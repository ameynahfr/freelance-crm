import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";

const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

// 🚀 UPDATED: Now accepts rootOwnerId to trigger the 100% Completion Notification
const updateProjectProgress = async (projectId, rootOwnerId) => {
  if (!projectId) return;
  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({ project: projectId, status: "done" });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    const project = await Project.findByIdAndUpdate(projectId, { progress }, { new: true });

    // 🚀 TRIGGER NOTIFICATION: Project hits 100% Health
    if (progress === 100 && rootOwnerId && project) {
      try {
        await Notification.create({
          recipient: rootOwnerId,
          type: "project_alert",
          message: `Mandate 100% Complete: ${project.title}. Ready for client handover.`,
          link: `/projects/${projectId}`
        });
      } catch (notifErr) {
        console.error("Project completion telemetry failed:", notifErr);
      }
    }
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
    
    // Pass rootOwnerId to the progress updater
    if (projectId) await updateProjectProgress(projectId, rootOwnerId);

    // 🚀 TRIGGER NOTIFICATION: Alert the assigned agent
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: assignedTo,
          type: "task_assigned",
          message: `You were deployed to a new mandate: ${title}`,
          link: `/my-tasks`
        });
      } catch (notifErr) {
        console.error("Telemetry failed to send:", notifErr);
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const tasks = await Task.find({ project: req.params.projectId, user: rootOwnerId })
      .populate("assignedTo", "_id name email") 
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
      .populate("assignedTo", "_id name email") 
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

    // 🚀 TRIGGER NOTIFICATION: Task Completed
    // If the status is being changed to 'done' and it wasn't already 'done'
    if (req.body.status === "done" && task.status !== "done") {
      // Don't notify the user if they created the task themselves
      if (task.creator && task.creator.toString() !== req.user._id.toString()) {
        try {
          await Notification.create({
            recipient: task.creator,
            type: "system_update",
            message: `Agent ${req.user.name.split(' ')[0]} finalized task: ${task.title}`,
            link: `/projects/${task.project}`
          });
        } catch (notifErr) {
          console.error("Task completion telemetry failed:", notifErr);
        }
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assignedTo", "_id name email");

    // Pass rootOwnerId to the progress updater
    if (updatedTask.project) await updateProjectProgress(updatedTask.project, rootOwnerId);
    
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
    
    // Pass rootOwnerId to the progress updater
    if (task && task.project) await updateProjectProgress(task.project, rootOwnerId);
    
    res.json({ message: "Removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};