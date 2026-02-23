import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import PaymentLog from "../models/PaymentLog.js";

const router = express.Router();

router.use(protect); // ✅ Must protect logs

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { status, search } = req.query;

    const filter = { userId: req.user._id }; // only own logs

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await PaymentLog.countDocuments(filter);
    const logs = await PaymentLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
      logs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:transactionId", async (req, res) => {
  try {
    const log = await PaymentLog.findOne({
      transactionId: req.params.transactionId,
      userId: req.user._id, // only own log
    });

    if (!log) return res.status(404).json({ error: "Payment not found" });

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
