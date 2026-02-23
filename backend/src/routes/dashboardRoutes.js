import express from "express";
import { getDashboardMetrics } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDashboardMetrics);

export default router;
