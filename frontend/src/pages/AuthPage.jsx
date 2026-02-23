import { useState } from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
      <div className="relative w-full max-w-4xl h-[500px] bg-white shadow-lg rounded-lg overflow-hidden flex">
        {/* Sliding Forms */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ${
            isLogin ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Login />
        </div>
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full transition-transform duration-700 ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <Register />
        </div>

        {/* Sliding Panel */}
        <div
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-colors duration-700 ${
            isLogin
              ? "bg-gradient-to-r from-purple-500 to-indigo-600"
              : "bg-gradient-to-r from-green-500 to-teal-500"
          }`}
        >
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : "Join Us!"}
            </h2>
            <p className="mb-6">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Create an account to start managing your projects."}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="bg-white text-gray-800 font-semibold px-6 py-2 rounded-full hover:shadow-lg transition"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
