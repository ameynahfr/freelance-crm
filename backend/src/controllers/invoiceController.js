import mongoose from "mongoose";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import puppeteer from "puppeteer";

const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

const generateInvoiceNumber = async (rootOwnerId) => {
  const count = await Invoice.countDocuments({ user: rootOwnerId });
  const number = String(count + 1).padStart(5, "0");
  return `INV-${number}`;
};

export const createProjectInvoice = async (req, res) => {
  try {
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

// 🚀 FIXED: Added the missing export
export const getInvoiceById = async (req, res) => {
  try {
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

export const getInvoicePDF = async (req, res) => {
  try {
    const rootOwnerId = getAgencyRootId(req.user);
    const invoice = await Invoice.findOne({ _id: req.params.invoiceId, user: rootOwnerId })
      .populate("client", "name email phone address")
      .populate("project", "title")
      .populate("user", "name email");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // (Keep the HTML and PDF generation logic the same as before)
    const html = `<html>...</html>`; // Shortened for brevity
    
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