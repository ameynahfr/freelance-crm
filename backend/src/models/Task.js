import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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
      // 🛡️ REJECTION ENGINE: Prevents Mongo IDs from being saved as status
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true,
    },
    dueDate: Date,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });

export default mongoose.model("Task", taskSchema);