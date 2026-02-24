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
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true,
    },
    dueDate: Date,

    // 🔗 Project Link
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // 👤 Creator (The Admin/Manager who made the task)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 👷 Assignee (The Employee doing the work) - NEW
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional: Task can be unassigned initially
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
taskSchema.index({ project: 1, status: 1 });

export default mongoose.model("Task", taskSchema);