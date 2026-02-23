import mongoose from "mongoose";
import Client from "../models/Client.js";

/**
 * GET /api/clients
 * Get all clients for logged in user
 */
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      user: req.user._id,
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
    const { name, email, phone, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Client name is required",
      });
    }

    const client = await Client.create({
      name: name.trim(),
      email: email?.toLowerCase().trim(),
      phone,
      notes,
      user: req.user._id,
    });

    res.status(201).json(client);
  } catch (error) {
    // Duplicate client name per user
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Client with this name already exists",
      });
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
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid client ID",
      });
    }

    const client = await Client.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    // NEW: Check if client has associated projects before deleting
    const activeProjects = await Project.countDocuments({ client: id });
    if (activeProjects > 0) {
      return res.status(400).json({
        message: `Cannot delete client. They are linked to ${activeProjects} projects.`,
      });
    }

    const client = await Client.findOneAndDelete({
      _id: id,
      user: req.user._id, // Ensure consistent field naming
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client removed" });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ message: "Failed to delete client" });
  }
};
