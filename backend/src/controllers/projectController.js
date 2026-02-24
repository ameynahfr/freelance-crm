import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js"; 

// Helper: Identify the Agency Root
const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

const isManagerOrOwner = (user) => {
  return user && (user.role === "owner" || user.role === "manager");
};

/**
 * @desc    Get all projects for the current agency
 * @access  Private (SaaS Isolated)
 */
export const getProjects = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);

    // 🚀 SaaS FILTER: Only find projects belonging to this specific agency root
    const projects = await Project.find({
      $and: [
        { 
          $or: [
            { user: rootOwnerId },      // Linked to Agency Owner
            { manager: req.user._id },  // User is the manager
            { team: req.user._id }      // User is on the team
          ]
        },
        // Safety: Ensure it belongs to this agency's owner ID
        { user: rootOwnerId } 
      ]
    })
    .populate("client", "name email")
    .populate("team", "name email title profilePic")
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new project
 * @access  Private (Managers/Owners Only)
 */
export const createProject = async (req, res) => {
  if (!isManagerOrOwner(req.user)) {
    return res.status(403).json({ message: "Only Managers/Owners can create projects." });
  }

  try {
    const { title, description, budget, deadline, client, status, team } = req.body;
    const rootOwnerId = getAgencyRootId(req.user);

    if (!title) return res.status(400).json({ message: "Title is required" });

    let assignedTeam = Array.isArray(team) ? [...team] : [];
    
    // Ensure the creator and the Root Owner are in the team list
    if (!assignedTeam.includes(req.user._id.toString())) assignedTeam.push(req.user._id);
    if (!assignedTeam.includes(rootOwnerId.toString())) assignedTeam.push(rootOwnerId);

    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      client: client || null,
      status: status || "active",
      user: rootOwnerId,     // 🚀 ALWAYS tie to the Root Owner for SaaS isolation
      manager: req.user._id, // The person who clicked 'create'
      team: assignedTeam, 
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update project
 */
export const updateProject = async (req, res) => {
  if (!isManagerOrOwner(req.user)) {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const rootOwnerId = getAgencyRootId(req.user);
    
    // Ensure the project belongs to the user's agency before updating
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: rootOwnerId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("client team");

    if (!project) return res.status(404).json({ message: "Project not found in your agency." });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete project
 */
export const deleteProject = async (req, res) => {
  if (!isManagerOrOwner(req.user)) {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const project = await Project.findOne({ _id: req.params.id, user: rootOwnerId });

    if (!project) return res.status(404).json({ message: "Project not found." });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single project
 */
export const getProjectById = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const project = await Project.findOne({ _id: req.params.id, user: rootOwnerId })
      .populate("client", "name email")
      .populate("team", "name email title profilePic");

    if (!project) return res.status(404).json({ message: "Project not found." });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};