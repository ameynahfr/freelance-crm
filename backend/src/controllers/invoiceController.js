import mongoose from "mongoose";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import puppeteer from "puppeteer";

/**
 * @desc Generate a unique invoice number per freelancer
 */
const generateInvoiceNumber = async (userId) => {
  const count = await Invoice.countDocuments({ user: userId });
  const number = String(count + 1).padStart(5, "0");
  return `INV-${number}`;
};

/**
 * @desc Create invoice for an existing project
 * @route POST /api/invoices/project/:projectId
 */
export const createProjectInvoice = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, title, dueDate, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // SECURITY CHECK: Block invoicing for self-projects
    if (!project.client) {
      return res.status(400).json({
        message:
          "Cannot create an invoice for a self-project. Please assign a client to this project first.",
      });
    }

    const existingInvoice = await Invoice.findOne({
      project: projectId,
      status: { $in: ["unpaid", "partial"] },
      user: req.user._id,
    });

    if (existingInvoice) {
      return res
        .status(400)
        .json({ message: "An unpaid invoice already exists for this project" });
    }

    const invoiceNumber = await generateInvoiceNumber(req.user._id);

    const invoice = await Invoice.create({
      user: req.user._id,
      project: project._id,
      client: project.client,
      title: title || `Invoice for ${project.title}`,
      amount,
      invoiceNumber,
      dueDate,
      description,
      status: "unpaid",
    });

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res
      .status(500)
      .json({ message: "Invoice creation failed", error: error.message });
  }
};

/**
 * @desc Get all invoices for logged-in freelancer
 * @route GET /api/invoices
 */
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate("project", "title status")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch invoices", error: error.message });
  }
};

/**
 * @desc Get single invoice for freelancer
 * @route GET /api/invoices/:invoiceId
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    })
      .populate("project", "title status")
      .populate("client", "name email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch invoice", error: error.message });
  }
};

/**
 * @desc Public invoice endpoint (client can view without login)
 * @route GET /api/public/invoice/:id
 */
export const getPublicInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client", "name email")
      .populate("project", "title");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching public invoice:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update invoice status
 * @route PUT /api/invoices/:invoiceId/status
 */
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    if (!["unpaid", "paid", "partial"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    })
      .populate("client", "name email")
      .populate("project", "title status"); // Populate so frontend gets updated data

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = status;
    await invoice.save();

    res.json({ message: "Invoice status updated", invoice });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res
      .status(500)
      .json({
        message: "Failed to update invoice status",
        error: error.message,
      });
  }
};

/**
 * @desc Generate and download PDF
 * @route GET /api/invoices/:invoiceId/pdf
 */
export const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate("client", "name email")
      .populate("project", "title");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Defensive templating - handles null clients safely
    const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
              header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
              header h1 { font-size: 24px; margin: 0; }
              .client-info, .invoice-info { margin-bottom: 20px; }
              .row { display: flex; justify-content: space-between; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f4f4f4; }
              .total { text-align: right; font-weight: bold; }
              footer { text-align: center; font-size: 12px; color: #555; margin-top: 40px; }
            </style>
          </head>
          <body>
            <header>
              <h1>Freelance SaaS</h1>
              <div>
                Invoice #: ${invoice.invoiceNumber}<br/>
                Date: ${new Date(invoice.createdAt).toLocaleDateString()}<br/>
                Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
              </div>
            </header>

            <div class="row">
              <div class="client-info">
                <strong>Bill To:</strong><br/>
                ${invoice.client?.name || "Internal / Self Project"}<br/>
                ${invoice.client?.email || ""}
              </div>
              <div class="invoice-info">
                <strong>Project:</strong><br/>
                ${invoice.project?.title || "Unknown Project"}<br/>
                <strong>Status:</strong> ${invoice.status.toUpperCase()}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${invoice.title || "Services Rendered"}</td>
                  <td>$${invoice.amount.toFixed(2)}</td>
                </tr>
                ${
                  invoice.description
                    ? `
                <tr>
                  <td colspan="2" style="font-size: 12px; color: #666; white-space: pre-wrap;">${invoice.description}</td>
                </tr>`
                    : ""
                }
              </tbody>
              <tfoot>
                <tr>
                  <td class="total">Total</td>
                  <td>$${invoice.amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <footer>
              Thank you for your business! Please pay by the due date.
            </footer>
          </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};
