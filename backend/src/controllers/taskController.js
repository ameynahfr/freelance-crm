import Task from "../models/Task.js";
import Project from "../models/Project.js";

/**
 * HELPER: Auto-Calculate Project Progress
 */
const updateProjectProgress = async (projectId) => {
  if (!projectId) return;

  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: "done",
    });

    const progress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

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
    const { title, description, status, dueDate, assignedTo } = req.body;
    
    // Support creating tasks via URL param OR body
    const projectId = req.params.projectId || req.body.project;

    const task = await Task.create({
      user: req.user._id,
      project: projectId,
      title,
      description,
      status: status || "todo",
      dueDate,
      assignedTo: assignedTo || null // Save the assignment
    });

    // Populate assignee so frontend can show avatar immediately
    const populatedTask = await task.populate("assignedTo", "name email");

    // ⚡ AUTO-UPDATE: Recalculate progress
    if (projectId) {
      await updateProjectProgress(projectId);
    }

    res.status(201).json(populatedTask);
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
      // Removed 'user: req.user._id' check so Team Members can see tasks too!
    })
    .populate("assignedTo", "name email") // Show who is working on it
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get project tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get ALL tasks (Global View for Admin)
 * @route   GET /api/tasks/all
 */
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get tasks assigned to ME (Employee View) - NEW
 * @route   GET /api/tasks/my-tasks
 */
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "title status")
      .populate("user", "name") // Show who assigned it (the manager)
      .sort({ dueDate: 1 }); // Show urgent tasks first

    res.json(tasks);
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Security: Allow update if you are the CREATOR or the ASSIGNEE
    const isCreator = task.user.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isCreator && !isAssignee) {
      return res.status(401).json({ message: "Not authorized to update this task" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedTo", "name email");

    // ⚡ AUTO-UPDATE: Recalculate progress
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

    // Only the Creator (Manager) can delete tasks
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete task" });
    }

    const projectId = task.project;
    await task.deleteOne();

    // ⚡ AUTO-UPDATE: Recalculate progress
    if (projectId) {
      await updateProjectProgress(projectId);
    }

    res.json({ message: "Task removed" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};