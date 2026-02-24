import express from "express";
import {
  getAllTasks,
  getProjectTasks,
  getMyTasks, // NEW IMPORT
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// 1. Special Routes (Must be before /:id)
router.get("/all", getAllTasks);       // Admin view (Everything created by me)
router.get("/my-tasks", getMyTasks);   // Employee view (Everything assigned to me)

// 2. Project-Specific Routes
router.get("/project/:projectId", getProjectTasks);
router.post("/project/:projectId", createTask); // Can also accept assignedTo in body

// 3. Single Task Operations
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;