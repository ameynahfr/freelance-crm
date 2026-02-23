import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext.jsx";
import { loginUser, registerUser } from "../api/auth.jsx";
import { setAuthToken } from "../api/apiUser.jsx";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const login = async ({ email, password }) => {
    try {
      const res = await loginUser({ email, password });

      if (res?.data?.token) {
        setToken(res.data.token);
        setAuthToken(res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const res = await registerUser({ name, email, password });

      if (res?.data?.token) {
        setToken(res.data.token);
        setAuthToken(res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
    }
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
