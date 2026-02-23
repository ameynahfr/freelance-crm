// models/Client.js
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Removed required to allow flexibility
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// FIX: Changed 'createdBy' to 'user' to match your schema field
clientSchema.index({ name: 1, user: 1 }, { unique: true });

const Client = mongoose.model("Client", clientSchema);
export default Client;
