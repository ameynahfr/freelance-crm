import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/all", getTasks);
// Nested under project
router.get("/project/:projectId", getTasks);
router.post("/project/:projectId", createTask);

router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
