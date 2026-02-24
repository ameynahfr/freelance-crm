import User from "../models/User.js";

/**
 * @desc    Get complete agency staff list
 * @access  Private
 */
export const getTeam = async (req, res) => {
    try {
        // Determine the Master Owner ID
        const rootOwnerId = req.user.role === "owner" 
            ? req.user._id 
            : req.user.agency_owner;

        if (!rootOwnerId) {
            // Fallback for users not yet linked to an agency
            const solo = await User.find({ _id: req.user._id }).select("-password");
            return res.json(solo);
        }

        // Fetch everyone in this agency "bubble"
        const team = await User.find({
            $or: [
                { _id: rootOwnerId },
                { agency_owner: rootOwnerId }
            ]
        })
        .select("-password")
        .sort({ role: 1, name: 1 }); // Owner -> Manager -> Member

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

        // 🔒 BLOCK: Standard members cannot hire people
        if (req.user.role === "member") {
            return res.status(403).json({ message: "Access Denied: Standard members cannot add staff." });
        }

        // 🔒 BLOCK: Managers cannot create other Managers (only Owner can)
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

        // 🛡️ THE SECURITY WALL
        
        // 1. Owners are Immortal
        if (target.role === "owner") {
            return res.status(403).json({ message: "The Agency Owner cannot be removed." });
        }

        // 2. Members have no power
        if (admin.role === "member") {
            return res.status(403).json({ message: "Access Denied." });
        }

        // 3. Managers can ONLY delete standard Members
        if (admin.role === "manager" && target.role !== "member") {
            return res.status(403).json({ message: "Managers can only remove standard Members." });
        }

        // 4. Cross-Agency Protection
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