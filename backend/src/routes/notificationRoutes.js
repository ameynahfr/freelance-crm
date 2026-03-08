import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
    getMyNotifications, 
    markAsRead, 
    clearAll 
} from "../controllers/notificationController.js";

const router = express.Router();

// 🔒 All notification routes are protected
router.use(protect);

router.route("/")
    .get(getMyNotifications);

router.route("/clear")
    .put(clearAll);

router.route("/:id/read")
    .put(markAsRead);

export default router;