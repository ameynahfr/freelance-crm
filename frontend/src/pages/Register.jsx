import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

export default function Register() {
  const { register, error, isAuthenticated } = useAuth(); // Redux hooks
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect if registration makes them authenticated immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ name, email, password });
    
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
            <div className="text-2xl font-extrabold tracking-tight mb-6">CRM</div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Join FreelanceCRM</h1>
            <p className="text-[#A29EAB] max-w-sm text-sm font-medium leading-relaxed">
              Start managing your clients, invoices, and projects with crystal clarity. Setup takes less than a minute.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#464153] p-4 rounded-2xl flex items-center gap-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#35313F] text-sm font-bold shadow-sm">✓</div>
              <div>
                <p className="font-bold text-white text-sm">Quick Setup</p>
                <p className="text-[#A29EAB] text-xs mt-0.5">Get started in seconds</p>
              </div>
            </div>
            <div className="bg-[#464153] p-4 rounded-2xl flex items-center gap-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#35313F] text-sm font-bold shadow-sm">✦</div>
              <div>
                <p className="font-bold text-white text-sm">All-in-one Toolkit</p>
                <p className="text-[#A29EAB] text-xs mt-0.5">Everything a freelancer needs</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="flex flex-1 items-center justify-center p-8 lg:p-10 bg-[#F2EAE3] text-[#35313F] rounded-[1.5rem] m-2 shadow-inner">
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight">Create Account</h2>
              <p className="text-[#847F8D] text-sm font-medium mt-1.5">Let's get you set up and ready to go.</p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 text-sm font-medium">
                {typeof error === 'string' ? error : "Registration failed"}
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-bold text-[#35313F] block mb-1.5 ml-3">Full Name</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-white border-none text-[#35313F] placeholder-[#A29EAB] focus:outline-none focus:ring-4 focus:ring-[#D2C9D8] transition-all text-sm font-medium shadow-sm"
                placeholder="John Doe"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-[#35313F] block mb-1.5 ml-3">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-white border-none text-[#35313F] placeholder-[#A29EAB] focus:outline-none focus:ring-4 focus:ring-[#D2C9D8] transition-all text-sm font-medium shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6 relative">
              <label className="text-xs font-bold text-[#35313F] block mb-1.5 ml-3">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-white border-none text-[#35313F] placeholder-[#A29EAB] focus:outline-none focus:ring-4 focus:ring-[#D2C9D8] transition-all text-sm font-medium pr-10 shadow-sm"
                  placeholder="Create a password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A29EAB] hover:text-[#35313F] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showPassword ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-full font-bold text-white text-base bg-[#35313F] hover:bg-[#2A2732] transition-all duration-200 shadow-md">
              Register
            </button>

            <p className="text-xs font-medium text-[#847F8D] text-center mt-5">
              Already have an account? <Link to="/login" className="text-[#35313F] font-bold hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}