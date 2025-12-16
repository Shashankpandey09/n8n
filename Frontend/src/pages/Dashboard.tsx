import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Play, Trash2, Settings, Workflow as WorkflowIcon, ArrowRight, Calendar, Layers } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";

interface Workflow {
  id: number;
  title: string;
  nodes: any[];
  connections: any[];
  enabled: boolean;
  createdAt: string;
}

const Dashboard = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    if (!currentUser) {
      navigate("/");
      return;
    }

    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const userWorkflows = allWorkflows.filter(
      (w: any) => w.userId === currentUser.id
    );
    setWorkflows(userWorkflows);
  }, [navigate]);

  const handleCreateWorkflow = async () => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    try {
      const newWorkflow = {
        userId: currentUser.id,
        title: "New Workflow",
        nodes: [],
        connections: [],
        enabled: false,
        createdAt: new Date().toISOString(),
      };

      const res = await axios.post(
        `${import.meta.env.API_URL||"https://flowboard.shashankpandey.dev"}/api/v1/workflow`,
        newWorkflow,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = res.data;
      if (!result.ok) return;
      const allWorkflows = JSON.parse(
        localStorage.getItem("workflows") || "[]"
      );
      allWorkflows.push(result.workflow);
      localStorage.setItem("workflows", JSON.stringify(allWorkflows));

      navigate(`/workflow/${result.workflow.id}`);
    } catch (error) {
      console.log("error while creating workflow----->", error);
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.API_URL||"https://flowboard.shashankpandey.dev"}/api/v1/workflow/delete/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status == 200) {
        const allWorkflows = JSON.parse(
          localStorage.getItem("workflows") || "[]"
        );
        const updated = allWorkflows.filter((w: any) => w.id !== id);
        localStorage.setItem("workflows", JSON.stringify(updated));
        localStorage.removeItem("validPayload");
        setWorkflows(workflows.filter((w) => w.id !== id));
        toast.success("Workflow deleted");
      }
    } catch (error) {
      console.log(error);
      toast.error("error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-300 font-sans selection:bg-sky-500/30 relative overflow-x-hidden">
      
     
      <div className="fixed inset-0 pointer-events-none z-0">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,#1e3a8a30,transparent_70%)]"></div>
      </div>

    
      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 py-12">
  
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Workflows</h2>
              <p className="text-slate-400">
                Manage your automation pipelines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateWorkflow}
                className="h-10 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_-5px_rgba(2,132,199,0.5)] flex items-center gap-2 group border border-sky-400/20"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                <span>New Workflow</span>
              </Button>
            </div>
          </div>

   
          {workflows.length === 0 ? (
        
            <div className="relative rounded-2xl border border-dashed border-white/10 bg-[#1e293b]/10 p-12 text-center">
               <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <WorkflowIcon className="h-6 w-6 text-slate-400" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-white">No workflows yet</h3>
               <p className="mb-8 text-slate-500 max-w-sm mx-auto text-sm">
                 Create your first automation workflow to get started.
               </p>
               <Button
                onClick={handleCreateWorkflow}
                variant="outline"
                className="mx-auto h-9 px-4 rounded-lg bg-transparent hover:bg-white/5 text-slate-300 border-white/10 hover:text-white transition-all text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Workflow</span>
              </Button>
            </div>
          ) : (
            
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-[#1e293b]/20 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/30 hover:bg-[#1e293b]/40 hover:shadow-xl hover:shadow-sky-900/10"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                  
                        <CardTitle className="text-base font-semibold text-white group-hover:text-sky-100 transition-colors">
                          {workflow.title}
                        </CardTitle>
                        
             
                        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                           <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              <Layers className="h-3 w-3" />
                              <span>{workflow.nodes.length} nodes</span>
                           </div>
                           <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                 
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); navigate(`/workflow/${workflow.id}`); }}
                          className="h-7 w-7 rounded-md text-slate-500 hover:bg-white/5 hover:text-sky-400"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(workflow.id); }}
                          className="h-7 w-7 rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
               
                      <Button
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                        className="w-full h-9 rounded-lg bg-white/5 hover:bg-sky-600 hover:text-white text-xs font-medium text-slate-300 border border-white/5 hover:border-sky-500/50 transition-all flex items-center justify-between group/btn"
                      >
                        <span className="pl-1">Open Editor</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;