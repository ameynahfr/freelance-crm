import mongoose from "mongoose";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";

// @desc Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user._id,
    })
      .populate("client", "name email") // Added population
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new project
export const createProject = async (req, res) => {
  try {
    const { title, description, status, deadline, progress, client } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      deadline,
      progress,
      client: client || null, // Handles "Self Project"
      user: req.user._id,
    });

    const populatedProject = await project.populate("client", "name email");
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Find and update with new populate logic
    const project = await Project.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("client", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create invoice for project
export const createProjectInvoice = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Invoice now inherits the Client ObjectId from the project
    const invoice = await Invoice.create({
      user: req.user._id,
      project: project._id,
      client: project.client || null,
      amount,
      status: "unpaid",
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Invoice creation failed" });
  }
};

// @desc Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
