import express from "express";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  createProjectInvoice,
  getProjectById,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id")
  .get(protect, getProjectById) // <--- ADD THIS LINE
  .put(protect, updateProject)
  .delete(protect, deleteProject);
router.post("/:projectId/invoice", protect, createProjectInvoice);
export default router;
