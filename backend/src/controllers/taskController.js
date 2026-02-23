import Task from "../models/Task.js";
import Project from "../models/Project.js";

/**
 * HELPER: Auto-Calculate Project Progress
 * This counts all tasks vs. completed tasks and updates the Project model.
 */
const updateProjectProgress = async (projectId) => {
  if (!projectId) return;

  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: "done",
    });

    // Calculate percentage (avoid division by zero)
    const progress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Save the new progress to the project
    await Project.findByIdAndUpdate(projectId, { progress });
  } catch (error) {
    console.error("Error updating project progress:", error);
  }
};

/**
 * @desc    Create a task
 * @route   POST /api/tasks/project/:projectId
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Support creating tasks via URL param OR body (for flexibility)
    const projectId = req.params.projectId || req.body.project;

    const task = await Task.create({
      user: req.user._id,
      project: projectId || null, // Tasks can be global (no project)
      title,
      description,
      status: status || "todo",
      dueDate,
    });

    // ⚡ AUTO-UPDATE: If linked to a project, recalculate progress
    if (projectId) {
      await updateProjectProgress(projectId);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all tasks for a specific project
 * @route   GET /api/tasks/project/:projectId
 */
export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
      user: req.user._id,
    }).sort({ createdAt: -1 }); // Newest first

    res.json(tasks);
  } catch (error) {
    console.error("Get project tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get ALL tasks for the logged-in user (Global View)
 * @route   GET /api/tasks/all
 */
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .populate("project", "title") // Populate project title for badges
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update task (Status, Title, etc.)
 * @route   PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Security: Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
    });

    // ⚡ AUTO-UPDATE: Recalculate progress for the associated project
    if (updatedTask.project) {
      await updateProjectProgress(updatedTask.project);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Capture project ID before deleting so we can update progress
    const projectId = task.project;

    await task.deleteOne();

    // ⚡ AUTO-UPDATE: Recalculate progress after deletion
    if (projectId) {
      await updateProjectProgress(projectId);
    }

    res.json({ message: "Task removed" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};