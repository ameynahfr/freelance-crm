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
    
    // 🔗 Client Reference (Optional for internal projects)
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false, 
      index: true,
    },

    // 👤 The Owner/Creator (REQUIRED by your schema)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 👑 The Agency Manager (REQUIRED by your schema)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
    
    // 👥 The Team (Array of Users)
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Compound index for faster lookups
projectSchema.index({ user: 1, status: 1 });

export default mongoose.model("Project", projectSchema);