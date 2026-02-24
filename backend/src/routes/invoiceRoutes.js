import express from "express";
import {
  createProjectInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  getInvoicePDF,
} from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all invoice routes
router.use(protect);

// Get all invoices for logged-in freelancer
router.get("/", getInvoices);

// Create invoice for an existing project
// This matches your frontend call: POST /api/invoices/project/:projectId
router.post("/project/:projectId", createProjectInvoice);

// Get single invoice
router.get("/:invoiceId", getInvoiceById);

// Update invoice status (paid/unpaid)
router.put("/:invoiceId/status", updateInvoiceStatus);

// Generate PDF
router.get("/:invoiceId/pdf", getInvoicePDF);

export default router;