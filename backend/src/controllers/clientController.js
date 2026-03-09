import mongoose from "mongoose";
import Client from "../models/Client.js";
import Project from "../models/Project.js";

// Helper: Identify the Agency Root
const getAgencyRootId = (user) => (user.role === "owner" ? user._id : user.agency_owner);

/**
 * GET /api/clients
 * Get all clients for the agency
 */
export const getClients = async (req, res) => {
  try {
    // 🔒 SECURITY: Members cannot view the client list
    if (req.user.role === "member") {
      return res.status(403).json({ message: "Access denied. Members cannot view clients." });
    }

    const rootOwnerId = getAgencyRootId(req.user);
    const clients = await Client.find({
      user: rootOwnerId,
    }).sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

/**
 * POST /api/clients
 * Create client
 */
export const createClient = async (req, res) => {
  try {
    // 🔒 SECURITY: Members cannot create clients
    if (req.user.role === "member") {
      return res.status(403).json({ message: "Access denied. Members cannot create clients." });
    }

    const { name, email, phone, notes } = req.body;
    const rootOwnerId = getAgencyRootId(req.user);

    if (!name) return res.status(400).json({ message: "Client name is required" });

    const client = await Client.create({
      name: name.trim(),
      email: email?.toLowerCase().trim(),
      phone,
      notes,
      user: rootOwnerId, // 🚀 SaaS Sync: Always save to the agency root
    });

    res.status(201).json(client);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Client with this name already exists in your agency" });
    }
    console.error("Create client error:", error);
    res.status(500).json({ message: "Failed to create client" });
  }
};

/**
 * PUT /api/clients/:id
 * Update client
 */
export const updateClient = async (req, res) => {
  try {
    if (req.user.role === "member") {
      return res.status(403).json({ message: "Access denied. Members cannot edit clients." });
    }

    const { id } = req.params;
    const rootOwnerId = getAgencyRootId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid client ID" });

    const client = await Client.findOne({ _id: id, user: rootOwnerId });

    if (!client) return res.status(404).json({ message: "Client not found in your agency" });

    const { name, email, phone, notes } = req.body;

    if (name !== undefined) client.name = name.trim();
    if (email !== undefined) client.email = email.toLowerCase().trim();
    if (phone !== undefined) client.phone = phone;
    if (notes !== undefined) client.notes = notes;

    await client.save();
    res.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ message: "Failed to update client" });
  }
};

/**
 * DELETE /api/clients/:id
 */
export const deleteClient = async (req, res) => {
  try {
    if (req.user.role === "member") {
      return res.status(403).json({ message: "Access denied. Members cannot delete clients." });
    }

    const { id } = req.params;
    const rootOwnerId = getAgencyRootId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid client ID" });

    const activeProjects = await Project.countDocuments({ client: id });
    if (activeProjects > 0) {
      return res.status(400).json({
        message: `Cannot delete client. They are linked to ${activeProjects} projects.`,
      });
    }

    const client = await Client.findOneAndDelete({ _id: id, user: rootOwnerId });

    if (!client) return res.status(404).json({ message: "Client not found or unauthorized" });

    res.json({ message: "Client removed" });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ message: "Failed to delete client" });
  }
};

/**
 * GET /api/clients/:id
 * Get single client and all associated projects
 */
export const getClientById = async (req, res) => {
  try {
    if (req.user.role === "member") {
      return res.status(403).json({ message: "Access denied." });
    }

    const { id } = req.params;
    const rootOwnerId = getAgencyRootId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid client ID" });

    // Fetch the client
    const client = await Client.findOne({ _id: id, user: rootOwnerId });
    if (!client) return res.status(404).json({ message: "Client not found" });

    // 🚀 Fetch all projects tied to this client
    const projects = await Project.find({ client: id, user: rootOwnerId }).sort({ createdAt: -1 });

    // Return both so the frontend can build a complete dossier
    res.json({ client, projects });
  } catch (error) {
    console.error("Get client details error:", error);
    res.status(500).json({ message: "Failed to fetch client dossier" });
  }
};