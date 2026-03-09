import express from "express";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById
} from "../controllers/clientController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all client routes
router.use(protect);

router.route("/").get(getClients).post(createClient);

router.route("/:id")
      .put(updateClient)
      .get(getClientById)
      .delete(deleteClient);

export default router;
// routes/clientRoutes.js
