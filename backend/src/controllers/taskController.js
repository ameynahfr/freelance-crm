import Task from "../models/Task.js";
import Project from "../models/Project.js";

const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

const updateProjectProgress = async (projectId) => {
  if (!projectId) return;
  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({ project: projectId, status: "done" });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    await Project.findByIdAndUpdate(projectId, { progress });
  } catch (error) {
    console.error("Progress Sync Error:", error);
  }
};

export const createTask = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Forbidden" });
    const { title, description, status, dueDate, assignedTo } = req.body;
    const projectId = req.params.projectId || req.body.project;
    const rootOwnerId = getAgencyRootId(req.user);

    const task = await Task.create({
      user: rootOwnerId,
      creator: req.user._id,
      project: projectId,
      title,
      description,
      status: status || "todo",
      dueDate,
      assignedTo: assignedTo || null
    });

    const populatedTask = await task.populate("assignedTo", "_id name email"); 
    if (projectId) await updateProjectProgress(projectId);
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const tasks = await Task.find({ project: req.params.projectId, user: rootOwnerId })
      .populate("assignedTo", "_id name email") // 🚀 CRITICAL: Added _id
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const tasks = await Task.find({ user: rootOwnerId })
      .populate("project", "title")
      .populate("assignedTo", "_id name email") // 🚀 CRITICAL: Added _id
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const tasks = await Task.find({ assignedTo: req.user._id, user: rootOwnerId })
      .populate("project", "title status")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const task = await Task.findOne({ _id: req.params.id, user: rootOwnerId });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isBoss = req.user.role === "owner" || req.user.role === "manager";
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isBoss && !isAssignee) {
      return res.status(403).json({ message: "Unauthorized move blocked." });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assignedTo", "_id name email");

    if (updatedTask.project) await updateProjectProgress(updatedTask.project);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Forbidden" });
    const rootOwnerId = getAgencyRootId(req.user);
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: rootOwnerId });
    if (task && task.project) await updateProjectProgress(task.project);
    res.json({ message: "Removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};