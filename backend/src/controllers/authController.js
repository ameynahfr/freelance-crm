import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // SAAS RULE: Public signups are ALWAYS Owners.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      profilePic: profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      role: "owner", 
      agency_owner: null 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      title: user.title,
      location: user.location,
      bio: user.bio,
      skills: user.skills,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      title: user.title,
      location: user.location,
      bio: user.bio,
      skills: user.skills,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (for refreshes)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        title: user.title,         // 🚀 Return new fields
        location: user.location,
        bio: user.bio,
        skills: user.skills,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile (including Avatar & Agent Details)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Basic Info
      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email.toLowerCase();
      if (req.body.profilePic) user.profilePic = req.body.profilePic;
      if (req.body.password) user.password = req.body.password;

      // 🚀 AGENT DOSSIER FIELDS
      if (req.body.title !== undefined) user.title = req.body.title;
      if (req.body.location !== undefined) user.location = req.body.location;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.skills !== undefined) user.skills = req.body.skills;

      const updatedUser = await user.save();

      // Return the complete updated profile to Redux
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
        title: updatedUser.title,           // 🚀 Send back
        location: updatedUser.location,     // 🚀 Send back
        bio: updatedUser.bio,               // 🚀 Send back
        skills: updatedUser.skills,         // 🚀 Send back
        token: req.headers.authorization.split(" ")[1],
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};