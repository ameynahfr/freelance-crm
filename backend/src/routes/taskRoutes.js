import express from "express";
import {
  getAllTasks,      // NEW: For "All Tasks" view
  getProjectTasks,  // NEW: For "Project Details" view
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All task routes are protected
router.use(protect);

// 1. Global View (All tasks across all projects)
router.get("/all", getAllTasks);

// 2. Project-Specific Routes
router.get("/project/:projectId", getProjectTasks);
router.post("/project/:projectId", createTask);

// 3. Single Task Operations (Update/Delete)
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;