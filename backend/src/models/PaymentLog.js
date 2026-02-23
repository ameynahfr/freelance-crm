import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    paymentMethod: {
      type: String,
      default: "card",
    },

    paymentProvider: {
      type: String,
      default: "stripe",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },

    // Stripe PaymentIntent ID
    paymentIntentId: {
      type: String,
      index: true,
    },

    // Generic transaction reference
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    receiptUrl: String,

    failureReason: String,

    description: String,

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Dashboard queries
paymentLogSchema.index({ userId: 1, createdAt: -1 });

// Invoice payment lookup
paymentLogSchema.index({ invoiceId: 1, status: 1 });

const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);

export default PaymentLog;
