import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import ProjectModal from "../components/ProjectModal";
import { Link, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from "recharts";
import { 
  FaEdit, FaPlus, FaRocket, FaCheckCircle, 
  FaExclamationTriangle, FaBriefcase, FaClock, FaFileInvoiceDollar
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

  const highPriorityMandates = useMemo(() => {
    const data = metrics?.projectProgressData || [];
    return data.filter(p => (p.progress || 0) < 40).slice(0, 3);
  }, [metrics]);

  const isManager = user?.role === "owner" || user?.role === "manager";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  if (authLoading || (loading && !metrics)) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--os-canvas)]">
      <div className="bg-[var(--os-bg)] px-8 py-4 rounded-2xl text-[var(--os-text-main)] text-xs font-black uppercase tracking-widest animate-pulse border border-[var(--os-border)] shadow-2xl flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-[var(--os-accent)] border-t-transparent rounded-full animate-spin"></div>
        Synchronizing OS...
      </div>
    </div>
  );

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
                
                {/* Command Center Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[var(--os-accent)]/10 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-4 mb-6 z-10">
                      <div className="w-16 h-16 rounded-[1.2rem] border-2 border-[var(--os-border)] bg-[var(--os-bg)] overflow-hidden shadow-lg flex-shrink-0">
                        <img src={user?.profilePic} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">{greeting},</p>
                        <h2 className="text-xl font-black tracking-tight leading-tight">{user?.name.split(' ')[0]}</h2>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto z-10">
                      <p className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-3">Quick Directives</p>
                      
                      <button onClick={() => setShowModal(true)} className="w-full flex items-center justify-between bg-[var(--os-btn-primary)] text-[var(--os-btn-primary-text)] p-3 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all shadow-md shadow-[var(--os-btn-primary)]/20">
                        <span className="flex items-center gap-2"><FaPlus /> Deploy Mandate</span>
                      </button>
                      
                      {isManager && (
                        <Link to="/invoices" className="w-full flex items-center justify-between bg-[var(--os-bg)] p-3 rounded-xl text-xs font-bold text-[var(--os-text-main)] hover:bg-[var(--os-surface)] border border-[var(--os-border)] transition-colors shadow-sm">
                          <span className="flex items-center gap-2"><FaFileInvoiceDollar className="text-emerald-400" /> Issue Invoice</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 🚀 Clickable Action Cards */}
                  <MetricCard 
                    label="Active Mandates" 
                    value={metrics?.activeProjects || 0} 
                    icon={<FaRocket className="text-[var(--os-accent)]"/>} 
                    onClick={() => navigate('/projects')}
                  />
                  <MetricCard 
                    label="Finalized" 
                    value={metrics?.completedProjects || 0} 
                    icon={<FaCheckCircle className="text-blue-400"/>} 
                  />
                  <MetricCard 
                    label="Critical Tasks" 
                    value={metrics?.overdueTasksCount || 0} 
                    icon={<FaExclamationTriangle className="text-rose-400"/>} 
                    urgent={(metrics?.overdueTasksCount || 0) > 0} 
                    onClick={() => navigate('/my-tasks')} // 🚀 Routes to tasks
                  />
                  {isManager ? (
                    <MetricCard label="Cleared Revenue" value={`$${(metrics?.totalEarnings || 0).toLocaleString()}`} icon={<FaBriefcase className="text-amber-400"/>} onClick={() => navigate('/invoices')} />
                  ) : (
                    <MetricCard label="Pending Review" value={metrics?.pendingProjects || 0} icon={<FaClock className="text-amber-400"/>} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                <div className="xl:col-span-2 bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)]">Revenue Telemetry</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics?.earningsOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--os-accent)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--os-accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--os-text-muted)" opacity={0.1} vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--os-text-muted)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--os-text-muted)' }} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          contentStyle={{backgroundColor: 'var(--os-bg)', border: '1px solid var(--os-border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'}}
                          itemStyle={{ color: 'var(--os-text-main)', fontWeight: 'bold' }}
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                          labelStyle={{ color: 'var(--os-text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="earnings" stroke="var(--os-accent)" strokeWidth={3} fill="url(#colorValue)" activeDot={{ r: 6, fill: 'var(--os-accent)', stroke: 'var(--os-bg)', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl flex flex-col">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)] mb-6">Tactical Priority</h3>
                  <div className="space-y-6 flex-1">
                    {highPriorityMandates.map(p => (
                      <div key={p._id} className="space-y-2 group cursor-pointer" onClick={() => navigate(`/projects/${p._id}`)}>
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black truncate max-w-[150px] group-hover:text-[var(--os-accent)] transition-colors">{p.title}</p>
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Alert</span>
                        </div>
                        <div className="w-full bg-[var(--os-bg)] h-1.5 rounded-full overflow-hidden border border-[var(--os-border)]">
                          <div className="bg-rose-400 h-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{width: `${p.progress}%`}} />
                        </div>
                      </div>
                    ))}
                    {highPriorityMandates.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <FaCheckCircle className="text-3xl mb-3 text-[var(--os-text-muted)]" />
                        <p className="text-xs font-bold">All systems nominal.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🚀 OPTIMIZATION: Now renders the explicit overdue tasks we fetched */}
              <div className="bg-[var(--os-surface)] rounded-[2.5rem] p-8 border border-[var(--os-border)] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--os-text-muted)]">Upcoming Deadlines</h3>
                  {metrics?.overdueTasksCount > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20">
                      {metrics.overdueTasksCount} Critical
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Merge overdue tasks with standard upcoming tasks, prioritizing overdue, limit to 4 */}
                  {([...(metrics?.overdueTasks || []), ...(metrics?.upcomingTasks || [])]
                    .filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i) // Remove duplicates
                    .slice(0, 4)
                  ).map(t => {
                    const isOverdue = t.dueDate && new Date(t.dueDate).setHours(23, 59, 59, 999) < new Date() && t.status !== 'done';
                    
                    const projectLink = t.project?._id ? `/projects/${t.project._id}/board` : '/my-tasks';

                    return (
                      <div 
                        key={t._id} 
                        onClick={() => navigate(projectLink)}
                        className={`bg-[var(--os-bg)] p-5 rounded-2xl border shadow-sm transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg group ${isOverdue ? 'border-rose-500/50 bg-rose-500/5 hover:border-rose-500 hover:bg-rose-500/10' : 'border-[var(--os-border)] hover:border-[var(--os-accent)]'}`}
                      >
                        <p className="text-[8px] font-black text-[var(--os-text-muted)] uppercase mb-1 truncate">{t.project?.title || "Internal"}</p>
                        <h4 className="text-xs font-bold mb-4 truncate group-hover:text-[var(--os-accent)] transition-colors">{t.title}</h4>
                        
                        <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span className={isOverdue ? 'text-rose-400' : 'text-[var(--os-text-muted)]'}>
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded border ${
                            isOverdue ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.2)]' :
                            t.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            t.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-[var(--os-surface)] text-[var(--os-text-muted)] border-[var(--os-border)]'
                          }`}>
                            {isOverdue ? 'OVERDUE' : t.status === 'todo' ? 'TODO' : t.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {(!metrics?.upcomingTasks || metrics.upcomingTasks.length === 0) && (!metrics?.overdueTasks || metrics.overdueTasks.length === 0) && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-[var(--os-border)] rounded-2xl bg-[var(--os-bg)]/30">
                       <p className="text-xs font-bold text-[var(--os-text-muted)]">No active deadlines detected.</p>
                    </div>
                  )}
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

// 🚀 ADDED: onClick prop
function MetricCard({ label, value, icon, urgent = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[var(--os-surface)] p-6 rounded-3xl border ${urgent ? 'border-rose-500/40 bg-rose-500/5' : 'border-[var(--os-border)]'} shadow-xl transition-all ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--os-accent)]/50' : ''}`}
    >
      <div className={`p-2.5 rounded-xl border w-fit mb-4 ${urgent ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[var(--os-bg)] border-[var(--os-border)]'}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-black mb-1">{value}</h2>
      <p className={`text-[9px] font-black uppercase tracking-widest ${urgent ? 'text-rose-400' : 'text-[var(--os-text-muted)]'}`}>{label}</p>
    </div>
  );
}