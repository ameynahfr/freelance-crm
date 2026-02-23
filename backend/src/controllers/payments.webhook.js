import dotenv from "dotenv";
dotenv.config();

import Invoice from "../models/Invoice.js";
import PaymentLog from "../models/PaymentLog.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  /**
   * Verify webhook signature
   */
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      /**
       * PAYMENT SUCCEEDED
       */
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        if (!invoiceId) break;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) break;

        // Mark invoice paid
        if (invoice.status !== "paid") {
          invoice.status = "paid";
          invoice.paidAt = new Date();
          invoice.paymentIntentId = paymentIntent.id;
          await invoice.save();
        }

        // Prevent duplicate logs
        const existing = await PaymentLog.findOne({
          transactionId: paymentIntent.id,
        });

        if (!existing) {
          await PaymentLog.create({
            userId: invoice.user,
            clientId: invoice.client,
            invoiceId: invoice._id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentMethod: "card",
            paymentProvider: "stripe",
            status: "completed",
            transactionId: paymentIntent.id,
            receiptUrl: paymentIntent.latest_charge
              ? `https://dashboard.stripe.com/payments/${paymentIntent.latest_charge}`
              : null,
            description: `Payment for invoice ${invoiceId}`,
          });
        }

        break;
      }

      /**
       * PAYMENT FAILED
       */
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        if (!invoiceId) break;

        const invoice = await Invoice.findById(invoiceId);

        if (invoice) {
          invoice.status = "failed";
          invoice.failedAt = new Date();
          await invoice.save();
        }

        const existing = await PaymentLog.findOne({
          transactionId: paymentIntent.id,
        });

        if (!existing) {
          await PaymentLog.create({
            userId: invoice?.user,
            clientId: invoice?.client,
            invoiceId: invoice?._id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentMethod: "card",
            paymentProvider: "stripe",
            status: "failed",
            transactionId: paymentIntent.id,
            description: `Failed payment for invoice ${invoiceId}`,
          });
        }

        break;
      }

      /**
       * CHECKOUT COMPLETED
       */
      case "checkout.session.completed": {
        const session = event.data.object;

        if (!session.payment_intent) break;

        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
        );

        const invoiceId = paymentIntent.metadata?.invoiceId;
        if (!invoiceId) break;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) break;

        if (invoice.status !== "paid") {
          invoice.status = "paid";
          invoice.paidAt = new Date();
          invoice.paymentIntentId = paymentIntent.id;
          await invoice.save();
        }

        const existing = await PaymentLog.findOne({
          transactionId: paymentIntent.id,
        });

        if (!existing) {
          await PaymentLog.create({
            userId: invoice.user,
            clientId: invoice.client,
            invoiceId: invoice._id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentMethod: "card",
            paymentProvider: "stripe",
            status: "completed",
            transactionId: paymentIntent.id,
            description: `Payment for invoice ${invoiceId} via checkout`,
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Webhook handler failed");
  }
};
