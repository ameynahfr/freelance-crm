import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "active", "completed", "canceled"],
      default: "pending",
      index: true,
    },
    deadline: Date,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // CHANGED: From String to ObjectId reference
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false, // Allows "Self Project"
      index: true,
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

projectSchema.index({ user: 1, status: 1 });

export default mongoose.model("Project", projectSchema);
