import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["task_assigned", "project_alert", "system_update", "deadline_warning"],
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    link: { 
        type: String, // Where the user goes when they click the notification (e.g., "/projects/123")
        default: "" 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);