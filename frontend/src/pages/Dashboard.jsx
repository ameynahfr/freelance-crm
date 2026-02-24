import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";
import ProjectModal from "../components/ProjectModal";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaEdit, FaPlus, FaSearch, FaFilter } from "react-icons/fa";

export default function Dashboard() {
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetrics(res.data);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        fetchMetrics();
      }
    }
  }, [authLoading, isAuthenticated, fetchMetrics, navigate]);

  // Filters
  const filteredProjects = metrics?.projectProgressData?.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredTasks = metrics?.upcomingTasks?.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // 🔒 Permission Check
  const isManager = user?.role === "owner" || user?.role === "manager";

  if (authLoading || (loading && !metrics)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-5 py-2.5 rounded-full text-white text-sm font-medium animate-pulse">
          Syncing OS...
        </div>
      </div>
    );
  }

  if (!metrics) return <div className="h-screen flex items-center justify-center text-white bg-[#35313F]">Connection Error. Please refresh.</div>;

  const earningsOverTime = metrics.earningsOverTime?.length > 0 ? metrics.earningsOverTime : [
    { day: "Mon", earnings: 0 }, { day: "Tue", earnings: 0 }, { day: "Wed", earnings: 0 },
    { day: "Thu", earnings: 0 }, { day: "Fri", earnings: 0 }, { day: "Sat", earnings: 0 }, { day: "Sun", earnings: 0 },
  ];

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />

        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30 py-4 px-8 flex justify-between items-center">
              <h1 className="text-lg font-bold">Overview</h1>
              <div className="flex gap-3">
                <div className="hidden md:flex bg-[#464153] px-4 py-2 rounded-full items-center gap-2 border border-white/5">
                  <FaSearch className="text-[#A29EAB]" size={12}/>
                  <input 
                    type="text" placeholder="Search mandates..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-32"
                  />
                </div>
                {isManager && (
                  <button onClick={() => setShowModal(true)} className="bg-white text-[#35313F] text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition shadow-lg">
                    + New Project
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-8 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                
                {/* Profile Card */}
                <div className="xl:col-span-1">
                  <div className="bg-[#464153] rounded-[2rem] p-8 text-center border border-white/5 shadow-xl relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-full h-24 bg-white/5" />
                    <div className="relative mt-4 mb-4">
                      <div className="w-24 h-24 rounded-full mx-auto border-4 border-[#35313F] bg-[#D2C9D8] overflow-hidden flex items-center justify-center shadow-lg">
                        {user?.profilePic ? (
                          <img src={user.profilePic} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <span className="text-xl font-bold text-[#35313F]">{user?.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-widest">{user?.role}</p>
                    <div className="mt-6 space-y-3">
                        <div className="bg-[#35313F] p-3 rounded-xl border border-white/5">
                            <p className="text-[9px] text-[#A29EAB] uppercase font-bold tracking-tighter">Current Mandates</p>
                            <p className="text-lg font-bold">{metrics.activeProjects}</p>
                        </div>
                        <Link to="/profile" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl text-xs font-bold transition">
                            <FaEdit size={10} /> Edit Identity
                        </Link>
                    </div>
                  </div>
                </div>

                {/* Main Data Section */}
                <div className="xl:col-span-3 space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Active" value={metrics.activeProjects} />
                    <StatCard label="Pending" value={metrics.pendingProjects} />
                    <StatCard label="Overdue" value={metrics.overdueTasks} color="text-rose-400" />
                    {isManager && (
                      <>
                        <StatCard label="Total Revenue" value={`$${(metrics.totalEarnings || 0).toLocaleString()}`} />
                        <StatCard label="Outstanding" value={`$${(metrics.unpaidEarnings || 0).toLocaleString()}`} />
                        <StatCard label="Completed" value={metrics.completedProjects} />
                      </>
                    )}
                  </div>

                  {/* 📊 UPDATED CHART & HEALTH GRID */}
                  <div className={`grid grid-cols-1 ${isManager ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-5`}>
                    
                    {/* Revenue Performance - ONLY FOR MANAGERS */}
                    {isManager && (
                      <div className="lg:col-span-2 bg-[#464153] rounded-3xl p-6 border border-white/5 shadow-inner">
                        <h3 className="text-sm font-bold mb-6">Revenue Performance</h3>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={earningsOverTime}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#5B5569" vertical={false} opacity={0.2} />
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#A29EAB', fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#35313F', border: 'none', borderRadius: '10px'}} />
                              <Line type="monotone" dataKey="earnings" stroke="#D2C9D8" strokeWidth={3} dot={{r: 4, fill: '#35313F'}} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Project Health - Spans full width if Chart is hidden */}
                    <div className={`${isManager ? 'lg:col-span-1' : ''} bg-[#F2EAE3] rounded-3xl p-6 text-[#35313F] shadow-inner`}>
                      <h3 className="text-sm font-bold mb-4">Project Health</h3>
                      <div className="space-y-4">
                        {filteredProjects.map(p => (
                          <div key={p._id}>
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className="truncate pr-2">{p.title}</span>
                              <span>{p.progress}%</span>
                            </div>
                            <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#35313F] h-full transition-all duration-1000" style={{width: `${p.progress}%`}} />
                            </div>
                          </div>
                        ))}
                        {filteredProjects.length === 0 && (
                           <p className="text-[10px] text-[#847F8D] text-center py-4">No active mandates found.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="bg-[#464153] rounded-3xl p-6 border border-white/5 shadow-inner">
                    <h3 className="text-sm font-bold mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-2">
                      {filteredTasks.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition">
                           <div>
                              <p className="text-xs font-bold">{t.title}</p>
                              <p className="text-[10px] text-[#A29EAB]">{t.project?.title || "Internal mandate"}</p>
                           </div>
                           <span className="text-[10px] bg-[#35313F] px-2 py-1 rounded-lg border border-white/5">
                             {new Date(t.dueDate).toLocaleDateString()}
                           </span>
                        </div>
                      ))}
                      {filteredTasks.length === 0 && (
                        <p className="text-xs text-[#A29EAB] text-center py-4 italic">No pending deadlines. Enjoy the calm! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>

        {showModal && (
          <ProjectModal 
            token={token} 
            onClose={() => setShowModal(false)} 
            onCreated={() => { setShowModal(false); fetchMetrics(); }} 
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-[#464153] p-5 rounded-2xl border border-white/5 shadow-inner hover:bg-[#464153]/80 transition">
      <p className="text-[10px] font-bold text-[#A29EAB] uppercase mb-1 tracking-wider">{label}</p>
      <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}