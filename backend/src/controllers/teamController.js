import User from "../models/User.js";
import Notification from "../models/Notification.js"; // 🚀 NEW: Import Notification model
import { sendWelcomeEmail } from "../utils/sendEmail.js"; 

/**
 * @desc    Get complete agency staff list
 * @access  Private
 */
export const getTeam = async (req, res) => {
    try {
        const rootOwnerId = req.user.role === "owner" 
            ? req.user._id 
            : req.user.agency_owner;

        if (!rootOwnerId) {
            const solo = await User.find({ _id: req.user._id }).select("-password");
            return res.json(solo);
        }

        const team = await User.find({
            $or: [
                { _id: rootOwnerId },
                { agency_owner: rootOwnerId }
            ]
        })
        .select("-password")
        .sort({ role: 1, name: 1 }); 

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: "Agency data fetch failed." });
    }
};

/**
 * @desc    Add staff member (Owner/Manager only)
 */
export const addTeamMember = async (req, res) => {
    try {
        const { name, email, password, role, title, profilePic } = req.body;

        if (req.user.role === "member") {
            return res.status(403).json({ message: "Access Denied: Standard members cannot add staff." });
        }

        if (req.user.role === "manager" && role === "manager") {
             return res.status(403).json({ message: "Only the Agency Owner can appoint new Managers." });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) return res.status(400).json({ message: "Email is already registered." });

        const rootOwnerId = req.user.role === "owner" ? req.user._id : req.user.agency_owner;

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password, 
            role: role || "member",
            title: title || "Agency Staff",
            profilePic: profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            agency_owner: rootOwnerId,
        });

        try {
            await sendWelcomeEmail({
                name: user.name,
                email: user.email,
                password: password 
            });
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError.message);
        }

        res.status(201).json({ message: "Member added successfully", id: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Remove staff member (Hierarchy Restricted)
 */
export const removeTeamMember = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        const admin = req.user;

        if (!target) return res.status(404).json({ message: "Member not found." });

        if (target.role === "owner") {
            return res.status(403).json({ message: "The Agency Owner cannot be removed." });
        }
        if (admin.role === "member") {
            return res.status(403).json({ message: "Access Denied." });
        }
        if (admin.role === "manager" && target.role !== "member") {
            return res.status(403).json({ message: "Managers can only remove standard Members." });
        }

        const rootOwnerId = admin.role === "owner" ? admin._id : admin.agency_owner;
        if (target.agency_owner?.toString() !== rootOwnerId.toString()) {
            return res.status(403).json({ message: "Unauthorized agency access." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Member successfully offboarded." });
    } catch (error) {
        res.status(500).json({ message: "Server error during removal." });
    }
};

/**
 * @desc    Get single team member profile
 */
export const getTeamMemberById = async (req, res) => {
    try {
        const target = await User.findById(req.params.id).select("-password");
        if (!target) return res.status(404).json({ message: "Agent not found." });

        const rootOwnerId = req.user.role === "owner" ? req.user._id : req.user.agency_owner;
        
        if (target._id.toString() !== rootOwnerId.toString() && target.agency_owner?.toString() !== rootOwnerId.toString()) {
            return res.status(403).json({ message: "Unauthorized agency access." });
        }

        res.json(target);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching agent data." });
    }
};

/**
 * @desc    Update staff role (Promote/Demote)
 * @route   PUT /api/team/:id
 * @access  Private (Owner Only)
 */
export const updateTeamMember = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: "Agent not found." });

        // Only the Owner can promote/demote people
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Only the Agency Owner can modify clearance levels." });
        }

        const oldRole = target.role;
        const newRole = req.body.role;

        target.role = newRole || target.role;
        await target.save();

        // 🚀 TRIGGER NOTIFICATION: Clearance Level Changed
        if (newRole && oldRole !== newRole) {
            try {
                await Notification.create({
                    recipient: target._id,
                    type: "system_update",
                    message: `Your agency clearance was updated to: ${newRole.toUpperCase()}`,
                    link: `/profile`
                });
            } catch (notifErr) {
                console.error("Telemetry failed to send:", notifErr);
            }
        }

        res.json({ message: "Agent clearance updated.", user: target });
    } catch (error) {
        res.status(500).json({ message: "Server error updating member." });
    }
};