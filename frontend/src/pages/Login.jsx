import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
    // 🚀 Clean Redux Action - API call happens inside authSlice
    const result = await dispatch(login({ email, password }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D2C9D8] p-4 font-sans text-white">
      <div className="flex w-full max-w-4xl bg-[#35313F] rounded-[1.5rem] shadow-xl overflow-hidden min-h-[500px]">
        {/* LEFT SIDE - Branding */}
        <div className="hidden lg:flex lg:w-1/2 p-10 flex-col justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight mb-6 text-[#D2C9D8]">CRM</div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-3">FreelanceCRM</h1>
            <p className="text-[#A29EAB] max-w-sm text-sm font-medium leading-relaxed">
              The simple way to manage clients, invoices, and projects — built for freelancers who value clarity.
            </p>
          </div>
          <div className="space-y-4">
            <FeatureItem number="1" title="Organized Management" desc="Keep everything in one place" />
            <FeatureItem number="2" title="Clear Tracking" desc="Never miss deadlines" />
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="flex flex-1 items-center justify-center p-8 lg:p-10 bg-[#F2EAE3] text-[#35313F] rounded-[1.5rem] m-2 shadow-inner">
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight">Sign In</h2>
              <p className="text-[#847F8D] text-sm font-medium mt-1.5">Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 text-sm font-medium">
                {typeof error === 'string' ? error : "Login failed. Check credentials."}
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#847F8D] block mb-1.5 ml-3">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-white border-none text-[#35313F] placeholder-[#A29EAB] focus:ring-4 focus:ring-[#D2C9D8] transition-all text-sm font-medium shadow-sm outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5 px-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#847F8D] block">Password</label>
                <a href="#" className="text-xs font-bold text-[#847F8D] hover:text-[#35313F] transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-white border-none text-[#35313F] placeholder-[#A29EAB] focus:ring-4 focus:ring-[#D2C9D8] transition-all text-sm font-medium pr-12 shadow-sm outline-none"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A29EAB] hover:text-[#35313F] transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-3 rounded-full font-bold text-white text-base bg-[#35313F] hover:bg-[#2A2732] transition-all duration-200 shadow-md disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>

            <p className="text-xs font-medium text-[#847F8D] text-center mt-5">
              Don't have an account? <Link to="/register" className="text-[#35313F] font-bold hover:underline">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ number, title, desc }) {
  return (
    <div className="bg-[#464153] p-4 rounded-2xl flex items-center gap-4 border border-white/5">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#35313F] text-sm font-bold shadow-sm">{number}</div>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-[#A29EAB] text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
}