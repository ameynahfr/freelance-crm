import express from "express";
import {
  createProjectInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  getInvoicePDF,
  emailInvoiceToClient // 🚀 Added Import
} from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getInvoices);
router.post("/project/:projectId", createProjectInvoice);
router.get("/:invoiceId", getInvoiceById);
router.put("/:invoiceId/status", updateInvoiceStatus);
router.get("/:invoiceId/pdf", getInvoicePDF);
router.post("/:invoiceId/send", emailInvoiceToClient); // 🚀 NEW: Send Email Route

export default router;