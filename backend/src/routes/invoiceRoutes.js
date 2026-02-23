import express from "express";
import {
  createProjectInvoice, // create invoice for a real project
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  getInvoicePDF, // optional: mark paid/unpaid
} from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all invoice routes
router.use(protect);

// Get all invoices for logged-in freelancer
router.get("/", getInvoices);

// Create invoice for an existing project
router.post("/project/:projectId", createProjectInvoice);

// Optional: Get single invoice
router.get("/:invoiceId", getInvoiceById);

// Optional: Update invoice status (paid/unpaid)
router.put("/:invoiceId/status", updateInvoiceStatus);
// GET /api/invoices/:invoiceId/pdf
router.get("/:invoiceId/pdf", getInvoicePDF);
export default router;
