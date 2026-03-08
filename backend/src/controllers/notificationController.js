import Notification from "../models/Notification.js";

/**
 * @desc    Get user's active notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30); // Keep a rolling log of the last 30 alerts
            
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch telemetry." });
    }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        
        if (!notif) return res.status(404).json({ message: "Alert not found." });
        
        // Security check: ensure the user owns this notification
        if (notif.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized clearance." });
        }

        notif.isRead = true;
        await notif.save();
        
        res.json({ message: "Alert cleared." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update alert." });
    }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/clear
 * @access  Private
 */
export const clearAll = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All telemetry cleared." });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear telemetry." });
    }
};