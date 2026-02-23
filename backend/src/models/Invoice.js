import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true }, // Added
    title: { type: String, default: "Invoice" }, // Added
    description: { type: String }, // Added
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true }, // Added
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial", "overdue"], // Added 'partial' to match your controller
      default: "unpaid",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Invoice", invoiceSchema);
