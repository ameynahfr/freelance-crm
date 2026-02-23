import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Create Stripe Checkout Session
// @route POST /api/payments/create-checkout-session
// @access Private
export const createCheckoutSession = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Invoice already paid" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      payment_intent_data: {
        metadata: {
          invoiceId: invoice._id.toString(),
        },
      },

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Project Invoice Payment",
            },
            unit_amount: invoice.amount * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

      metadata: {
        invoiceId: invoice._id.toString(),
      },
    });

    invoice.stripeSessionId = session.id;
    await invoice.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment session failed" });
  }
};
