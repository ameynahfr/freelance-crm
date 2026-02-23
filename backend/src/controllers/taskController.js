import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

/**
 * GET TASKS
 * Supports fetching all tasks for a user OR tasks for a specific project
 */
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Base query: always filter by the logged-in user
    let query = { user: req.user._id };

    // If a projectId is provided and isn't the "all" keyword
    if (projectId && projectId !== "all" && projectId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid project id" });
      }

      // Optional: Verify project exists and belongs to user before filtering
      const project = await Project.findOne({
        _id: projectId,
        user: req.user._id,
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      query.project = projectId;
    }

    // Fetch tasks, populate project title for the global view, and sort by newest
    const tasks = await Task.find(query)
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CREATE TASK
 * Associated with a specific project
 */
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    // Ensure the project belongs to the user
    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      ...req.body,
      project: projectId,
      user: req.user._id,
    });

    // Populate project info before sending back to frontend
    const populatedTask = await Task.findById(task._id).populate(
      "project",
      "title",
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Task creation failed" });
  }
};

/**
 * UPDATE TASK
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("project", "title");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Task update failed" });
  }
};

/**
 * DELETE TASK
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task removed" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Task deletion failed" });
  }
};
