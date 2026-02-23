import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { FaUser, FaLock, FaSave, FaEdit, FaTimes } from "react-icons/fa";

export default function Profile() {
  const { token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [savedData, setSavedData] = useState({ name: "", email: "", role: "" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSavedData({
          name: res.data.name || "",
          email: res.data.email || "",
          role: res.data.role || "Freelancer",
        });

        setName(res.data.name || "");
        setEmail(res.data.email || "");
      } catch (err) {
        console.error("Failed to fetch profile");
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password && password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }

    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSavedData({
        ...savedData,
        name: res.data.name,
        email: res.data.email,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setPassword("");
      setConfirmPassword("");
      setIsEditing(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(savedData.name);
    setEmail(savedData.email);
    setPassword("");
    setConfirmPassword("");
    setMessage({ type: "", text: "" });
    setIsEditing(false);
  };

  if (pageLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#D2C9D8]">
        <div className="bg-[#35313F] px-6 py-3 rounded-full text-white text-sm font-medium animate-pulse">
          Loading Profile...
        </div>
      </div>
    );

  return (
    <div className="h-screen w-full bg-[#D2C9D8] p-0 md:p-3 lg:p-4 font-sans text-white overflow-hidden flex">
      <div className="flex flex-1 bg-[#35313F] rounded-none md:rounded-[1.5rem] shadow-xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-30 bg-[#35313F]/95 backdrop-blur-sm border-b border-[#5B5569]/30">
              <div className="max-w-[1600px] mx-auto w-full px-5 md:px-8 py-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Account Settings
                  </h1>
                  <p className="text-[#A29EAB] text-xs font-medium mt-0.5">
                    Manage your personal information and security
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-[#35313F] px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition shadow-sm flex items-center gap-2"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-5 md:px-8 py-8">
              {message.text && (
                <div
                  className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
                >
                  {message.text}
                </div>
              )}

              {!isEditing ? (
                /* VIEW MODE */
                <div className="bg-[#464153] rounded-2xl p-6 md:p-8 border border-white/5 shadow-inner">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Restored Dicebear Avatar */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#35313F] bg-[#D2C9D8] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                      <div>
                        <p className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1">
                          Full Name
                        </p>
                        <h2 className="text-2xl font-bold text-white">
                          {savedData.name}
                        </h2>
                      </div>

                      <div className="w-full h-px bg-[#5B5569]/50 my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1">
                            Email Address
                          </p>
                          <p className="text-sm font-medium text-white">
                            {savedData.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#A29EAB] uppercase tracking-wider mb-1">
                            Account Role
                          </p>
                          <span className="bg-[#35313F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {savedData.role || "Freelancer"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form
                  onSubmit={submitHandler}
                  className="bg-[#464153] rounded-2xl p-6 md:p-8 border border-white/5 shadow-inner space-y-8 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <FaUser className="text-[#A29EAB]" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          required
                          className="w-full bg-[#35313F] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                          className="w-full bg-[#35313F] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#5B5569]/50" />

                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <FaLock className="text-[#A29EAB]" /> Security
                    </h3>
                    <p className="text-xs text-[#A29EAB] mb-4">
                      Leave blank if you do not want to change your password.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full bg-[#35313F] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#A29EAB] uppercase tracking-wider mb-2 block ml-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full bg-[#35313F] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#D2C9D8] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-xl text-xs font-bold text-[#A29EAB] bg-[#35313F] hover:text-white transition flex items-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-white text-[#35313F] px-8 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                      <FaSave /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
