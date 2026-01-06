import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Workflow, LogOut, Settings, Key, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("validPayload")
    navigate("/");
    toast.success("Logged out");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-4 sm:gap-8">

          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600/10 text-sky-500 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <Workflow className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-sky-100 transition-colors">
              Flowboard
            </span>
          </button>


          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isActive("/dashboard")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Workflows
            </button>
            <button
              onClick={() => handleNavigation("/credential")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isActive("/credential")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Key className="h-3 w-3" />
              Credentials
            </button>
            <button
              onClick={() => handleNavigation("/executions")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isActive("/executions")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Executions
            </button>
          </nav>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation("/settings")}
            className="h-8 px-2 sm:px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all gap-2"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <div className="hidden sm:block h-4 w-px bg-white/10 mx-1"></div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex h-8 px-3 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-300 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B1121]/95 backdrop-blur-xl border-b border-white/5 py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200 z-50">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/dashboard")
                ? "text-white bg-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            Workflows
          </button>
          <button
            onClick={() => handleNavigation("/credential")}
            className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/credential")
                ? "text-white bg-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Key className="h-4 w-4" />
            Credentials
          </button>
          <button
            onClick={() => handleNavigation("/executions")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/executions")
                ? "text-white bg-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            Executions
          </button>
          <div className="h-px w-full bg-white/10 my-2"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;