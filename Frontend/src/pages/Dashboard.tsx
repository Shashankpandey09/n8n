import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Play, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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
    //create a workflow in the backend
    //need to send the tokens also
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
        "http://localhost:3000/api/v1/workflow",
        newWorkflow,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = res.data;
      if(!result.ok) return;
      const allWorkflows = JSON.parse(
        localStorage.getItem("workflows") || "[]"
      );
      //push res.data.workflows
      allWorkflows.push(result.workflow);
      localStorage.setItem("workflows", JSON.stringify(allWorkflows));

      navigate(`/workflow/${result.workflow.id}`);
    } catch (error) {
      console.log('error while creating workflow----->',error)
    }
  };

  const handleDeleteWorkflow = async(id: number) => {
    try {
     const res= await axios.delete(`http://localhost:3000/api/v1/workflow/delete/${id}`,{
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    })
    if(res.status==200){
        const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const updated = allWorkflows.filter((w: any) => w.id !== id);
    localStorage.setItem("workflows", JSON.stringify(updated));
    localStorage.removeItem("validPayload");
    setWorkflows(workflows.filter((w) => w.id !== id));
    toast.success("Workflow deleted");
    }
    } catch (error) {
      console.log(error)
      console.log(error)
      toast.error('error occurred')
    }

  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top nav: subtle frosted bar, minimal */}
      <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-lg font-semibold tracking-tight"
            >
              Workflow
            </button>

            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-700">
             
              <button onClick={() => navigate("/credential")} className="hover:underline">Credentials</button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/settings")}>Settings</Button>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Workflows</h2>
            <p className="text-sm text-slate-500">Build and manage your automation workflows</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleCreateWorkflow} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        {workflows.length === 0 ? (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-slate-500">No workflows yet</p>
              <Button onClick={handleCreateWorkflow} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="bg-white border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-slate-900">{workflow.title}</CardTitle>
                      <CardDescription className="text-slate-500">
                        {workflow.nodes.length} nodes
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                        aria-label={`Open ${workflow.title}`}
                         className="hover:bg-transparent"
                      >
                        <Settings className="h-4 w-4 text-slate-700" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        aria-label={`Delete ${workflow.title}`} 
                        className="hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 z-10" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Execution coming soon")}
                      className="flex items-center gap-2"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
