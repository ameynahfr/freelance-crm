import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply 'protect' to all routes
router.use(protect);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// 🚀 REMOVED: router.post("/:projectId/invoice", createProjectInvoice);
// This is now handled in invoiceRoutes.js

export default router;