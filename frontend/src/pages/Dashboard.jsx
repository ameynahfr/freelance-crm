import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";
import ProjectModal from "../components/ProjectModal";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaEdit } from "react-icons/fa";

export default function Dashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchMetrics();
  }, [token, fetchMetrics]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-5 py-2.5 rounded-full text-white text-sm font-medium animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );

  if (!metrics)
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500 bg-[#D2C9D8]">
        Failed to load dashboard metrics
      </div>
    );

  const earningsOverTime =
    metrics.earningsOverTime?.length > 0
      ? metrics.earningsOverTime
      : [
          { day: "Mon", earnings: 0 },
          { day: "Tue", earnings: 0 },
          { day: "Wed", earnings: 0 },
          { day: "Thu", earnings: 0 },
          { day: "Fri", earnings: 0 },
          { day: "Sat", earnings: 0 },
          { day: "Sun", earnings: 0 },
        ];

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.25rem] lg:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />

        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30 shadow-sm">
              <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 lg:px-8 py-3 lg:py-4 flex justify-between items-center">
                <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">
                  Overview
                </h1>
                <div className="flex gap-2.5">
                  <div className="hidden md:flex bg-[#464153] text-[#A29EAB] px-3 lg:px-4 py-1.5 lg:py-2 rounded-full items-center gap-2 text-xs font-medium border border-transparent focus-within:border-[#847F8D] transition-colors">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="bg-transparent border-none outline-none text-white placeholder-[#A29EAB] w-24 lg:w-32"
                    />
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-white text-[#35313F] text-[10px] lg:text-xs font-bold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-gray-100 transition shadow-sm"
                  >
                    + Add Project
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 lg:px-8 py-4 lg:py-6">
              {/* --- MASTER BENTO GRID --- */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-5">
                {/* 1. LEFT COLUMN: The Tall Profile Anchor Card */}
                <div className="xl:col-span-1 flex flex-col">
                  <div className="bg-[#464153] rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center border border-white/5 shadow-inner h-full relative overflow-hidden">
                    {/* Decorative Background Arc */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-[#5B5569]/30 rounded-b-[50%] scale-150 -translate-y-10" />

                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-[#35313F] overflow-hidden bg-[#D2C9D8] shadow-xl mb-5 mt-4">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-1">
                      {metrics.user?.name || "User"}
                    </h2>
                    <p className="text-[10px] lg:text-xs font-bold text-[#A29EAB] uppercase tracking-widest mb-6">
                      {metrics.user?.role || "Freelancer"}
                    </p>

                    <div className="w-full h-px bg-[#5B5569]/50 mb-6" />

                    {/* Mini Bento element inside the profile card */}
                    <div className="w-full bg-[#35313F]/50 rounded-2xl p-4 mb-6 text-left border border-white/5">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider">
                          Weekly Activity
                        </span>
                        <span className="text-xs font-bold text-white">
                          {metrics.completedProjects || 0} Done
                        </span>
                      </div>
                      <div className="w-full bg-[#35313F] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full w-[75%]" />
                      </div>
                    </div>

                    <div className="mt-auto w-full pt-4">
                      <Link
                        to="/profile"
                        className="w-full flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-white/20 transition shadow-sm"
                      >
                        <FaEdit /> Edit Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT COLUMN: The Data Hub */}
                <div className="xl:col-span-3 flex flex-col gap-4 lg:gap-5">
                  {/* Top Metric Cards (3x2 Grid) */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {[
                      {
                        label: "Active Projects",
                        value: metrics.activeProjects || 0,
                      },
                      {
                        label: "Pending Projects",
                        value: metrics.pendingProjects || 0,
                      },
                      {
                        label: "Completed Projects",
                        value: metrics.completedProjects || 0,
                      },
                      {
                        label: "Total Earnings",
                        value: `$${(metrics.totalEarnings || 0).toLocaleString()}`,
                      },
                      {
                        label: "Outstanding",
                        value: `$${(metrics.unpaidEarnings || 0).toLocaleString()}`,
                      },
                      {
                        label: "Overdue Tasks",
                        value: metrics.overdueTasks || 0,
                      },
                    ].map((metric, i) => (
                      <div
                        key={i}
                        className="bg-[#464153] rounded-2xl p-4 lg:p-5 flex flex-col justify-center min-h-[76px] lg:min-h-[88px] border border-transparent hover:border-white/5 transition-colors shadow-inner"
                      >
                        <p className="text-[#A29EAB] font-medium text-[10px] lg:text-xs mb-1">
                          {metric.label}
                        </p>
                        <h2 className="text-xl lg:text-3xl font-bold text-white truncate">
                          {metric.value}
                        </h2>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                    {/* Earnings Line Chart */}
                    <div className="lg:col-span-2 bg-[#464153] rounded-2xl p-4 lg:p-5 flex flex-col justify-between border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm lg:text-base font-bold text-white">
                          Earnings This Week
                        </h3>
                        <div className="text-[9px] lg:text-xs font-medium text-[#A29EAB] bg-[#35313F] px-2.5 py-1 rounded-full">
                          Last 7 Days
                        </div>
                      </div>
                      <div className="h-40 lg:h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={earningsOverTime}>
                            <CartesianGrid
                              stroke="#5B5569"
                              strokeDasharray="3 3"
                              opacity={0.3}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="day"
                              stroke="#A29EAB"
                              tick={{
                                fill: "#A29EAB",
                                fontSize: 11,
                                fontWeight: "500",
                              }}
                              axisLine={false}
                              tickLine={false}
                              dy={8}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#35313F",
                                borderRadius: "0.5rem",
                                border: "none",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "8px 12px",
                              }}
                              itemStyle={{
                                color: "#F2EAE3",
                                fontWeight: "bold",
                              }}
                              cursor={{
                                stroke: "#5B5569",
                                strokeWidth: 1,
                                strokeDasharray: "3 3",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="earnings"
                              stroke="#F2EAE3"
                              strokeWidth={2.5}
                              dot={{
                                fill: "#35313F",
                                stroke: "#F2EAE3",
                                strokeWidth: 2,
                                r: 3,
                              }}
                              activeDot={{
                                r: 4,
                                fill: "#F2EAE3",
                                stroke: "none",
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Active Projects Health */}
                    <div className="bg-[#F2EAE3] rounded-2xl p-4 lg:p-5 text-[#35313F] flex flex-col shadow-inner">
                      <h3 className="text-sm lg:text-base font-bold tracking-tight mb-4 lg:mb-5">
                        Project Health
                      </h3>
                      {metrics.projectProgressData?.length > 0 ? (
                        <div className="space-y-4 lg:space-y-5 flex-1">
                          {metrics.projectProgressData.map((project) => (
                            <div key={project._id} className="group">
                              <div className="flex justify-between text-[10px] lg:text-xs font-bold mb-1.5">
                                <span className="truncate pr-2">
                                  {project.title}
                                </span>
                                <span className="text-[#847F8D]">
                                  {project.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-white h-1.5 lg:h-2 rounded-full overflow-hidden shadow-sm">
                                <div
                                  className="bg-[#35313F] h-full rounded-full transition-all duration-700 ease-out"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] lg:text-xs font-medium text-[#847F8D]">
                            No active projects.
                          </p>
                        </div>
                      )}
                      <Link
                        to="/projects"
                        className="mt-5 lg:mt-6 w-full bg-[#35313F] text-white py-2 lg:py-2.5 rounded-full text-[11px] lg:text-xs font-bold hover:bg-[#2A2732] transition shadow-md block text-center"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  {/* Upcoming Tasks Feed */}
                  <div className="bg-[#464153] rounded-2xl p-4 lg:p-5 border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center mb-3 lg:mb-4">
                      <h3 className="text-sm lg:text-base font-bold text-white">
                        Upcoming Tasks
                      </h3>
                      <Link
                        to="/tasks"
                        className="text-[9px] lg:text-[11px] font-medium text-[#A29EAB] hover:text-white transition"
                      >
                        View All →
                      </Link>
                    </div>
                    <div className="space-y-0.5">
                      <div className="grid grid-cols-4 text-[#A29EAB] text-[9px] lg:text-[11px] font-medium border-b border-[#5B5569]/50 pb-2 px-2 lg:px-3">
                        <div>Task</div>
                        <div>Project</div>
                        <div>Status</div>
                        <div>Due Date</div>
                      </div>
                      {metrics.upcomingTasks?.length > 0 ? (
                        metrics.upcomingTasks.map((task) => (
                          <div
                            key={task._id}
                            className="grid grid-cols-4 items-center px-2 lg:px-3 py-2.5 lg:py-3 hover:bg-[#5B5569]/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="text-[11px] lg:text-sm font-semibold text-white truncate pr-2 lg:pr-4">
                              {task.title}
                            </div>
                            <div className="text-[9px] lg:text-[11px] font-medium text-[#A29EAB] truncate pr-2 lg:pr-4">
                              {task.project?.title || "No Project"}
                            </div>
                            <div>
                              <span className="bg-[#35313F] border border-white/5 text-white text-[8px] lg:text-[9px] font-semibold px-2 py-0.5 lg:py-1 rounded-full capitalize tracking-wide">
                                {task.status}
                              </span>
                            </div>
                            <div className="text-[9px] lg:text-[11px] font-medium text-white flex items-center">
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-5 lg:py-6 text-[#A29EAB] text-[10px] lg:text-xs font-medium">
                          You have no upcoming tasks! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* --- END MASTER BENTO GRID --- */}
            </div>
          </main>
        </div>

        {showModal && (
          <ProjectModal
            token={token}
            onClose={() => setShowModal(false)}
            onCreated={() => {
              setShowModal(false);
              fetchMetrics();
            }}
          />
        )}
      </div>
    </div>
  );
}
