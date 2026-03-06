import mongoose from "mongoose";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import puppeteer from "puppeteer";
import { sendInvoiceEmail } from "../utils/sendEmail.js";

const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

const generateInvoiceNumber = async (rootOwnerId) => {
  const count = await Invoice.countDocuments({ user: rootOwnerId });
  const number = String(count + 1).padStart(5, "0");
  return `INV-${number}`;
};

// 🎨 THE REBUILT PDF TEMPLATE
const generateInvoiceHTML = (invoice) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #35313F; margin: 0; padding: 40px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D2C9D8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #35313F; }
        .logo span { color: #A29EAB; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 24px; color: #35313F; tracking-wider; }
        .invoice-details p { margin: 5px 0 0; color: #5B5569; font-size: 14px; }
        .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .party { width: 45%; }
        .party h3 { margin-bottom: 10px; font-size: 12px; color: #A29EAB; text-transform: uppercase; letter-spacing: 1px; }
        .party p { margin: 5px 0; font-size: 14px; color: #35313F; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .table th { background: #F2EAE3; padding: 12px; text-align: left; font-size: 12px; color: #5B5569; text-transform: uppercase; letter-spacing: 1px; }
        .table td { padding: 15px 12px; border-bottom: 1px solid #D2C9D8; font-size: 14px; color: #35313F; }
        .total-section { display: flex; justify-content: flex-end; }
        .total-box { background: #464153; color: white; padding: 20px; border-radius: 10px; width: 250px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .total-row.final { font-size: 20px; font-weight: bold; margin-bottom: 0; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; }
        .footer { margin-top: 60px; text-align: center; color: #A29EAB; font-size: 12px; border-top: 1px solid #D2C9D8; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Freelance<span>OS</span></div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p># ${invoice.invoiceNumber}</p>
          <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p>Due Date: <strong style="color: #rose-500;">${new Date(invoice.dueDate).toLocaleDateString()}</strong></p>
        </div>
      </div>
      
      <div class="parties">
        <div class="party">
          <h3>Billed From</h3>
          <p><strong>${invoice.user?.name || "Agency"}</strong></p>
          <p>${invoice.user?.email || ""}</p>
        </div>
        <div class="party">
          <h3>Billed To</h3>
          <p><strong>${invoice.client?.name || "Internal Project"}</strong></p>
          <p>${invoice.client?.email || "No email on file"}</p>
          <p>${invoice.client?.address || ""}</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Project</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.title || "Standard Services"}</td>
            <td>${invoice.project?.title || "N/A"}</td>
            <td style="text-align: right;">$${(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row final">
            <span>Total Due</span>
            <span>$${(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions regarding this invoice, please contact ${invoice.user?.email || "us"}.</p>
      </div>
    </body>
    </html>
  `;
};

export const createProjectInvoice = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const { projectId } = req.params;
    const { amount, title, dueDate, description } = req.body;
    const rootOwnerId = getAgencyRootId(req.user);

    const project = await Project.findOne({ _id: projectId, user: rootOwnerId });
    if (!project) return res.status(404).json({ message: "Project not found." });

    const invoiceNumber = await generateInvoiceNumber(rootOwnerId);

    const invoice = await Invoice.create({
      user: rootOwnerId,
      creator: req.user._id,
      project: project._id,
      client: project.client,
      title: title || `Invoice for ${project.title}`,
      amount,
      invoiceNumber,
      dueDate,
      description,
      status: "unpaid",
    });

    res.status(201).json({ message: "Invoice created", invoice });
  } catch (error) {
    res.status(500).json({ message: "Invoice creation failed" });
  }
};

export const getInvoices = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const rootOwnerId = getAgencyRootId(req.user);
    const invoices = await Invoice.find({ user: rootOwnerId })
      .populate("project", "title status")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const { invoiceId } = req.params;
    const rootOwnerId = getAgencyRootId(req.user);

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: rootOwnerId,
    })
    .populate("project", "title status")
    .populate("client", "name email");

    if (!invoice) return res.status(404).json({ message: "Invoice not found." });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching invoice" });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const rootOwnerId = getAgencyRootId(req.user);
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.invoiceId, user: rootOwnerId },
      { status: req.body.status },
      { new: true }
    ).populate("client project");

    if (!invoice) return res.status(404).json({ message: "Invoice not found." });
    res.json({ message: "Status updated", invoice });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DOWNLOAD HANDLER
export const getInvoicePDF = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const rootOwnerId = getAgencyRootId(req.user);
    const invoice = await Invoice.findOne({ _id: req.params.invoiceId, user: rootOwnerId })
      .populate("client", "name email address")
      .populate("project", "title")
      .populate("user", "name email");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // 🚀 Use the beautiful template!
    const html = generateInvoiceHTML(invoice);
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: "PDF generation failed" });
  }
};

// EMAIL HANDLER
export const emailInvoiceToClient = async (req, res) => {
  try {
    if (req.user.role === "member") return res.status(403).json({ message: "Access denied." });
    const rootOwnerId = getAgencyRootId(req.user);
    
    const invoice = await Invoice.findOne({ _id: req.params.invoiceId, user: rootOwnerId })
      .populate("client", "name email address")
      .populate("project", "title")
      .populate("user", "name email");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    if (!invoice.client || !invoice.client.email) {
      return res.status(400).json({ message: "This client does not have an email address on file." });
    }

    // 🚀 Use the beautiful template!
    const html = generateInvoiceHTML(invoice);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    await sendInvoiceEmail({
      clientEmail: invoice.client.email,
      clientName: invoice.client.name,
      invoiceNumber: invoice.invoiceNumber,
      projectTitle: invoice.project?.title || "Project",
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      pdfBuffer: pdfBuffer 
    });

    res.json({ message: "Invoice emailed to client successfully!" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};