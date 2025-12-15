import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Workflow, LogOut, Settings, Key } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("validPayload")
    navigate("/");
    toast.success("Logged out");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
   
        <div className="flex items-center gap-8">
   
          <button
            onClick={() => navigate("/")}
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
              onClick={() => navigate("/dashboard")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive("/dashboard")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => navigate("/credential")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive("/credential")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Key className="h-3 w-3" />
              Credentials
            </button>
             <button
              onClick={() => navigate("/executions")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive("/executions")
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Executions
            </button>
          </nav>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className="h-8 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all gap-2"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          
          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-3 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;