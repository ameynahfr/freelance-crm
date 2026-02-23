import { useAuth } from "../hooks/useAuth.jsx";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="w-full bg-transparent flex-shrink-0 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center px-4 md:px-6 lg:px-8 py-3 lg:py-4">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-white tracking-tight">
            Hello, Freelancer! 👋
          </h2>
        </div>

        <div className="flex items-center gap-4 lg:gap-5">
          <div className="flex items-center gap-4 lg:gap-5 border-l border-[#5B5569] pl-4 lg:pl-5">
            <button className="text-[#A29EAB] hover:text-white transition-colors relative">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#F2EAE3] rounded-full border-2 border-[#35313F]"></span>
            </button>

            <button
              onClick={logout}
              className="bg-[#464153] text-[#A29EAB] px-4 py-2 rounded-full font-semibold text-xs hover:bg-[#F2EAE3] hover:text-[#35313F] transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
