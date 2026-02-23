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

    if (!project.client) {
      return res.status(400).json({
        message: "Cannot create an invoice for a self-project. Please assign a client first.",
      });
    }

    // Check for existing UNPAID invoice to prevent duplicates (Optional)
    const existingInvoice = await Invoice.findOne({
      project: projectId,
      status: { $in: ["unpaid", "partial"] },
      user: req.user._id,
    });

    if (existingInvoice) {
      return res.status(400).json({ message: "An unpaid invoice already exists for this project" });
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
    res.status(500).json({ message: "Invoice creation failed", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch invoices", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch invoice", error: error.message });
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

    if (!["unpaid", "paid", "partial", "overdue"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    })
      .populate("client", "name email")
      .populate("project", "title status");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = status;
    await invoice.save();

    res.json({ message: "Invoice status updated", invoice });
  } catch (error) {
    res.status(500).json({ message: "Failed to update invoice status", error: error.message });
  }
};

/**
 * @desc Generate and download PDF (Enhanced Version)
 * @route GET /api/invoices/:invoiceId/pdf
 */
export const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate("client", "name email phone address") // Assuming Client has address/phone
      .populate("project", "title")
      .populate("user", "name email"); // Assuming User has name/email

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Format Currency
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    const statusColor = invoice.status === 'paid' ? '#10b981' : '#ef4444'; // Green or Red

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #35313F;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          
          .container {
            padding: 50px;
            max-width: 800px;
            margin: 0 auto;
          }

          /* Header Banner */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #D2C9D8;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }

          .logo-area h1 {
            font-size: 32px;
            font-weight: 800;
            color: #35313F;
            margin: 0;
            letter-spacing: -1px;
          }
          .logo-area p {
            font-size: 14px;
            color: #A29EAB;
            margin: 5px 0 0;
          }

          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            font-size: 18px;
            color: #A29EAB;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 0 10px 0;
          }
          .invoice-details .number {
            font-size: 24px;
            font-weight: 600;
            color: #35313F;
          }
          .invoice-details .date {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }

          /* Addresses */
          .addresses {
            display: flex;
            justify-content: space-between;
            margin-bottom: 50px;
          }
          .addr-box h3 {
            font-size: 12px;
            color: #A29EAB;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .addr-box p {
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            font-weight: 500;
          }
          .addr-box .email {
            color: #35313F;
            text-decoration: underline;
          }

          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 6px;
            background-color: ${invoice.status === 'paid' ? '#d1fae5' : '#fee2e2'};
            color: ${invoice.status === 'paid' ? '#065f46' : '#991b1b'};
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 15px;
          }

          /* Content Table */
          .table-container {
            margin-bottom: 40px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #35313F;
            color: #fff;
            text-align: left;
            padding: 15px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          td {
            padding: 20px 15px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
          }
          
          /* Description Formatting */
          .desc-cell {
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap; /* This preserves the list format from your frontend */
          }
          .desc-cell strong {
            display: block;
            margin-bottom: 5px;
            font-size: 15px;
          }

          .amount-cell {
            text-align: right;
            font-weight: 600;
            font-size: 15px;
          }

          /* Totals */
          .totals {
            display: flex;
            justify-content: flex-end;
          }
          .totals-box {
            width: 300px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .total-row.final {
            border-bottom: none;
            border-top: 2px solid #35313F;
            margin-top: 10px;
            padding-top: 15px;
          }
          .total-row span {
            font-size: 14px;
            color: #666;
          }
          .total-row .val {
            font-weight: 600;
            color: #35313F;
          }
          .total-row.final span {
            font-size: 16px;
            font-weight: 800;
            color: #35313F;
          }
          .total-row.final .val {
            font-size: 20px;
            color: #35313F;
          }

          /* Footer */
          .footer {
            margin-top: 80px;
            border-top: 1px solid #eee;
            padding-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          <div class="header">
            <div class="logo-area">
              <h1>FREELANCE.</h1>
              <p>Professional Services</p>
            </div>
            <div class="invoice-details">
              <h2>Invoice</h2>
              <div class="number">#${invoice.invoiceNumber}</div>
              <div class="date">Issued: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
              <div class="status-badge">${invoice.status}</div>
            </div>
          </div>

          <div class="addresses">
            <div class="addr-box">
              <h3>Billed To</h3>
              <p><strong>${invoice.client?.name || "Client"}</strong></p>
              <p>${invoice.client?.email || "No email provided"}</p>
            </div>
            <div class="addr-box" style="text-align: right;">
              <h3>Payable To</h3>
              <p><strong>${invoice.user?.name || "Freelancer"}</strong></p>
              <p>${invoice.user?.email}</p>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">Description</th>
                  <th style="text-align: right; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="desc-cell">
                    <strong>${invoice.title}</strong>
                    ${invoice.description}
                  </td>
                  <td class="amount-cell">${formatter.format(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal</span>
                <span class="val">${formatter.format(invoice.amount)}</span>
              </div>
              <div class="total-row">
                <span>Tax (0%)</span>
                <span class="val">$0.00</span>
              </div>
              <div class="total-row final">
                <span>Total Due</span>
                <span class="val">${formatter.format(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Terms & Conditions</strong></p>
            <p>Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}. Please make checks payable to ${invoice.user?.name || "Freelancer"}.</p>
            <p style="margin-top: 20px;">Thank you for your business!</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};