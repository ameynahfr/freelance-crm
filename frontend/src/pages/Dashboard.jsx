import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import ProjectModal from "../components/ProjectModal";
import { Link, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { 
  FaEdit, FaPlus, FaRocket, FaCheckCircle, 
  FaExclamationTriangle, FaArrowUp, FaBriefcase, FaClock 
} from "react-icons/fa";

import { getDashboardMetrics } from "../api/dashboardApi";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await getDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate("/login");
      else fetchMetrics();
    }
  }, [authLoading, isAuthenticated, fetchMetrics, navigate]);

  // 🚀 FIX 1: Defensive high priority check
  const highPriorityMandates = useMemo(() => {
    const data = metrics?.projectProgressData || [];
    return data.filter(p => (p.progress || 0) < 40).slice(0, 3);
  }, [metrics]);

  const isManager = user?.role === "owner" || user?.role === "manager";

  if (authLoading || (loading && !metrics)) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-3 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl">
        Synchronizing Intelligence...
      </div>
    </div>
  );

  // If metrics still missing after loading, show error instead of crashing
  if (!metrics) return (
    <div className="h-screen flex items-center justify-center text-[var(--os-text-main)] bg-[var(--os-bg)]">
       Telemetry Lost. Check Connection.
    </div>
  );

  return (
    <div className="h-screen w-full bg-[var(--os-canvas)] p-0 md:p-3 flex font-sans text-[var(--os-text-main)] overflow-hidden">
      <div className="flex flex-1 bg-[var(--os-bg)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--os-border)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[var(--os-accent)]/10 to-transparent" />
                    <div className="w-24 h-24 rounded-[2rem] border-4 border-[var(--os-bg)] bg-[var(--os-canvas)] overflow-hidden shadow-2xl z-10 mb-4">
                      <img src={user?.profilePic} className="w-full h-full object-cover" alt="avatar" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter">{user?.name}</h2>
                    <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-[0.3em] mb-6">{user?.role} ACCESS</p>
                    <Link to="/profile" className="w-full flex items-center justify-center gap-2 bg-[var(--os-bg)] p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--os-border)]">
                      <FaEdit size={10} /> Profile Params
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Active" value={metrics?.activeProjects || 0} icon={<FaRocket className="text-[var(--os-accent)]"/>} />
                  <MetricCard label="Finalized" value={metrics?.completedProjects || 0} icon={<FaCheckCircle className="text-blue-400"/>} />
                  <MetricCard label="Critical" value={metrics?.overdueTasks || 0} icon={<FaExclamationTriangle className="text-rose-400"/>} urgent={(metrics?.overdueTasks || 0) > 0} />
                  {isManager ? (
                    <MetricCard label="Revenue" value={`$${(metrics?.totalEarnings || 0).toLocaleString()}`} icon={<FaBriefcase className="text-amber-400"/>} />
                  ) : (
                    <MetricCard label="Pending" value={metrics?.pendingProjects || 0} icon={<FaClock className="text-amber-400"/>} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] mb-8">Performance Analytics</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {/* 🚀 FIX 2: Ensure data is always an array */}
                      <AreaChart data={metrics?.earningsOverTime || []}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--os-accent)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--os-accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--os-text-muted)" opacity={0.1} vertical={false} />
                        <XAxis dataKey="day" hide />
                        <Tooltip contentStyle={{backgroundColor: 'var(--os-surface)', border: '1px solid var(--os-border)', borderRadius: '15px'}} />
                        <Area type="monotone" dataKey="earnings" stroke="var(--os-accent)" strokeWidth={3} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] mb-6">Tactical Priority</h3>
                  <div className="space-y-6">
                    {highPriorityMandates.map(p => (
                      <div key={p._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black truncate max-w-[150px]">{p.title}</p>
                          <span className="text-[9px] font-black text-rose-400 uppercase">Alert</span>
                        </div>
                        <div className="w-full bg-[var(--os-bg)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-400 h-full" style={{width: `${p.progress}%`}} />
                        </div>
                      </div>
                    ))}
                    {highPriorityMandates.length === 0 && <p className="text-xs opacity-30 italic">All systems nominal.</p>}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] mb-6">Upcoming Deadlines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 🚀 FIX 3: Safe array mapping with fallback */}
                  {(metrics?.upcomingTasks || []).slice(0, 4).map(t => (
                    <div key={t._id} className="bg-[var(--os-bg)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm">
                      <p className="text-[8px] font-black text-[var(--os-text-muted)] uppercase mb-1 truncate">{t.project?.title || "Internal"}</p>
                      <h4 className="text-xs font-bold mb-3 truncate">{t.title}</h4>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <span className="text-[var(--os-text-muted)]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Hold</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchMetrics(); }} />
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, urgent = false }) {
  return (
    <div className={`bg-[var(--os-surface)] p-6 rounded-3xl border ${urgent ? 'border-rose-500/30' : 'border-[var(--os-border)]'} shadow-xl transition hover:-translate-y-1`}>
      <div className="p-2.5 bg-[var(--os-bg)] rounded-xl border border-[var(--os-border)] w-fit mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-black mb-1">{value}</h2>
      <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">{label}</p>
    </div>
  );
}