import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaFingerprint, FaNetworkWired } from "react-icons/fa";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--os-canvas)] p-4 md:p-8 font-sans text-[var(--os-text-main)] transition-colors duration-300">
      <div className="flex w-full max-w-5xl bg-[var(--os-bg)] rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[650px] border border-[var(--os-border)]">
        
        {/* LEFT SIDE - Branding & OS Vibe */}
        <div className="hidden lg:flex lg:w-5/12 p-12 flex-col justify-between bg-[var(--os-surface)] border-r border-[var(--os-border)] relative overflow-hidden">
          
          {/* Subtle Background Accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--os-accent)]/10 to-transparent" />

          <div className="relative z-10">
            {/* 🚀 OMNI NODE SVG LOGO */}
            <div className="flex items-center gap-3 mb-10">
              <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-[var(--os-text-muted)] opacity-60 animate-[spin_12s_linear_infinite]" />
                  <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" className="text-[var(--os-text-main)] opacity-80" />
                  <circle cx="16" cy="16" r="4" fill="var(--os-accent)" className="drop-shadow-[0_0_8px_var(--os-accent)] animate-pulse" />
                </svg>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Omni<span className="text-[var(--os-text-muted)]">Node</span></h2>
            </div>

            <h1 className="text-4xl font-black mb-6 leading-tight">Access<br/>The Network.</h1>
            <p className="text-[var(--os-text-muted)] leading-relaxed text-sm font-medium max-w-xs">
              Authenticate your identity to access active mandates, agency personnel, and financial telemetrics.
            </p>
          </div>

          {/* Feature Callouts */}
          <div className="space-y-4 relative z-10">
            <FeatureItem icon={<FaFingerprint size={16} />} title="Biometric Security" desc="End-to-end encryption for all agency assets." />
            <div className="opacity-70">
              <FeatureItem icon={<FaNetworkWired size={14} />} title="Global Sync" desc="Real-time updates across the operative network." />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center bg-[var(--os-bg)] relative">
          <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Agent Login</h2>
              <p className="text-[var(--os-text-muted)] text-sm font-bold">Provide your credentials to proceed.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest text-center">
                {typeof error === 'string' ? error : "Authentication failed. Check credentials."}
              </div>
            )}

            <div className="space-y-5 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--os-text-muted)] ml-1">Secure Channel (Email)</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-[var(--os-surface)] border border-[var(--os-border)] text-sm font-bold shadow-inner outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all placeholder:text-[var(--os-text-muted)]/40"
                  placeholder="agent@omninode.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--os-text-muted)]">Cryptographic Key (Password)</label>
                  <a href="#" className="text-[9px] font-black uppercase tracking-widest text-[var(--os-accent)] hover:underline transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-[var(--os-surface)] border border-[var(--os-border)] text-sm font-bold shadow-inner outline-none focus:border-[var(--os-accent)] focus:ring-1 focus:ring-[var(--os-accent)] transition-all pr-12 placeholder:text-[var(--os-text-muted)]/40"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)] hover:text-[var(--os-accent)] transition-colors">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-[var(--os-btn-primary)] text-[var(--os-btn-primary-text)] rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--os-btn-primary)]/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Authenticating..." : "Initialize Session"}
            </button>

            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--os-text-muted)] text-center mt-8">
              Unregistered operative? <Link to="/register" className="text-[var(--os-accent)] hover:underline ml-1">Request Access</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Updated FeatureItem to use Icons instead of Numbers
function FeatureItem({ icon, title, desc }) {
  return (
    <div className="bg-[var(--os-bg)] p-5 rounded-2xl border border-[var(--os-border)] shadow-sm">
      <div className="flex items-center gap-3 mb-2 text-[var(--os-accent)]">
        {icon}
        <p className="font-black text-xs uppercase tracking-widest text-[var(--os-text-main)]">{title}</p>
      </div>
      <p className="text-[var(--os-text-muted)] text-[11px] font-bold leading-relaxed">
        {desc}
      </p>
    </div>
  );
}