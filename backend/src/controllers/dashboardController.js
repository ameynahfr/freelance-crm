import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js"; // NEW: Import User model

/**
 * GET /api/dashboard
 * Private route
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Run queries in parallel
    const [
      userProfile, // NEW: Fetch user info for the welcome card
      activeProjects,
      pendingProjects,
      completedProjects,
      totalEarningsAgg,
      unpaidEarningsAgg,
      overdueTasks,
      projectProgressData,
      earningsOverTimeRaw,
      upcomingTasks,
    ] = await Promise.all([
      // 1. User Profile Info
      User.findById(userId).select("name email role"),

      // 2. Active projects count
      Project.countDocuments({ user: userId, status: "active" }),

      // 3. Pending projects count
      Project.countDocuments({ user: userId, status: "pending" }),

      // 4. Completed projects count
      Project.countDocuments({ user: userId, status: "completed" }),

      // 5. Total revenue from PAID invoices
      Invoice.aggregate([
        { $match: { user: userId, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // 6. Outstanding money from UNPAID, PARTIAL, or OVERDUE invoices
      Invoice.aggregate([
        {
          $match: {
            user: userId,
            status: { $in: ["unpaid", "partial", "overdue"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // 7. Overdue tasks
      Task.countDocuments({
        user: userId,
        dueDate: { $lt: now },
        status: { $ne: "done" },
      }),

      // 8. Active Projects Health
      Project.find({ user: userId, status: "active" })
        .select("title progress client")
        .sort({ updatedAt: -1 })
        .limit(5),

      // 9. Earnings over time
      Invoice.aggregate([
        {
          $match: {
            user: userId,
            status: "paid",
            updatedAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            earnings: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 10. Upcoming Tasks
      Task.find({ user: userId, status: { $ne: "done" } })
        .populate("project", "title")
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    const totalEarnings = totalEarningsAgg[0]?.total || 0;
    const unpaidEarnings = unpaidEarningsAgg[0]?.total || 0;

    const formattedEarnings = earningsOverTimeRaw.map((item) => {
      const date = new Date(item._id);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        earnings: item.earnings,
      };
    });

    res.json({
      user: userProfile, // Send user info to dashboard
      activeProjects,
      pendingProjects,
      completedProjects,
      totalEarnings,
      unpaidEarnings,
      overdueTasks,
      projectProgressData,
      earningsOverTime: formattedEarnings,
      upcomingTasks,
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ message: "Failed to load dashboard metrics." });
  }
};
