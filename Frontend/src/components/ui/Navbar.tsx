import { toast } from "sonner";
import { Button } from "./button"
import { useNavigate } from "react-router-dom"
const Navbar:React.FC = () => {
    const navigate =useNavigate()
      const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
    toast.success("Logged out");
  };
  return (
    <header className="sticky top-0 z-20 border-b border-[#111827] bg-[#050b11]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-lg font-semibold tracking-tight text-[#e6eef6]"
            >
              Workflow
            </button>

            <nav className="hidden md:flex items-center gap-4 text-xs text-[#9aa3ad]">
              <button
                onClick={() => navigate("/credential")}
                className="hover:text-[#e6eef6] transition-colors"
              >
                Credentials
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/settings")}
              className="h-8 px-3 text-xs border border-transparent hover:border-[#1f2933] hover:bg-[#0b1017]"
            >
              Settings
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="h-8 px-3 text-xs bg-[#111827] hover:bg-[#1f2937] border border-[#1f2933] text-[#e6eef6]"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
  )
}
export default Navbar