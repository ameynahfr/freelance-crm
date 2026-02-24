import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (Requires Token)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;