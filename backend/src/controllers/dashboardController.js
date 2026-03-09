import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const now = new Date();
    // Normalize "now" to the end of yesterday so today's tasks aren't marked overdue yet
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const projectFilter = userRole === "member" 
      ? { team: userId } 
      : { $or: [{ user: userId }, { manager: userId }, { team: userId }] };

    const taskFilter = { assignedTo: userId, status: { $ne: "done" } };

    const queries = [
      User.findById(userId).select("name email role"),
      Project.countDocuments({ ...projectFilter, status: "active" }),
      Project.countDocuments({ ...projectFilter, status: "pending" }),
      Project.countDocuments({ ...projectFilter, status: "completed" }),
      // 🚀 MODIFIED: Fetch the actual overdue tasks instead of just counting
      Task.find({ 
        assignedTo: userId, 
        dueDate: { $lt: startOfToday }, 
        status: { $ne: "done" } 
      }).populate("project", "title").sort({ dueDate: 1 }),
      Project.find(projectFilter).select("title progress client").sort({ updatedAt: -1 }).limit(5),
      Task.find(taskFilter).populate("project", "title").sort({ dueDate: 1 }).limit(5),
    ];

    if (userRole !== "member") {
      queries.push(
        Invoice.aggregate([
          { $match: { user: userId, status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Invoice.aggregate([
          { $match: { user: userId, status: { $in: ["unpaid", "partial", "overdue"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Invoice.aggregate([
          { $match: { user: userId, status: "paid", updatedAt: { $gte: sevenDaysAgo } } },
          { $group: { 
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, 
              earnings: { $sum: "$amount" } 
          } },
          { $sort: { _id: 1 } },
        ])
      );
    }

    const results = await Promise.all(queries);

    const [
      userProfile,
      activeProjects,
      pendingProjects,
      completedProjects,
      overdueTasksList, // 🚀 Renamed to reflect array
      projectProgressData,
      upcomingTasks,
      totalEarningsAgg,
      unpaidEarningsAgg,
      earningsOverTimeRaw
    ] = results;

    const totalEarnings = totalEarningsAgg?.[0]?.total || 0;
    const unpaidEarnings = unpaidEarningsAgg?.[0]?.total || 0;

    const formattedEarnings = (earningsOverTimeRaw || []).map((item) => {
      const date = new Date(item._id);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        earnings: item.earnings,
      };
    });

    res.json({
      user: userProfile,
      activeProjects,
      pendingProjects,
      completedProjects,
      totalEarnings,
      unpaidEarnings,
      overdueTasks: overdueTasksList, // 🚀 Passing the array
      overdueTasksCount: overdueTasksList.length, // 🚀 Passing the count
      projectProgressData,
      earningsOverTime: formattedEarnings,
      upcomingTasks,
    });

  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ message: "Failed to load dashboard metrics." });
  }
};