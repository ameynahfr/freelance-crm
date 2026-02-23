import express from "express";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  createProjectInvoice,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").put(updateProject).delete(deleteProject);
router.post("/:projectId/invoice", protect, createProjectInvoice);

export default router;
