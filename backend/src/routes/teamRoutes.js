import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
    getTeam, 
    addTeamMember, 
    removeTeamMember,
    getTeamMemberById,
    updateTeamMember
} from "../controllers/teamController.js";

const router = express.Router();

// All team routes should be protected
router.use(protect);

router.route("/")
    .get(getTeam)
    .post(addTeamMember);

router.route("/:id")
    .get(getTeamMemberById)
    .put(updateTeamMember)
    .delete(removeTeamMember);

export default router;