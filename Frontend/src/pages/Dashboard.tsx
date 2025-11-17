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
import { Plus, Play, Trash2, Settings } from "lucide-react";
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
      if (!result.ok) return;
      const allWorkflows = JSON.parse(
        localStorage.getItem("workflows") || "[]"
      );
      //push res.data.workflows
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
        `http://localhost:3000/api/v1/workflow/delete/${id}`,
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
      console.log(error);
      toast.error("error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-[#050b11] text-[#e6eef6]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#e6eef6]">Workflows</h2>
            <p className="text-xs text-[#9aa3ad]">
              Build and manage your automation workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateWorkflow}
              className="flex items-center gap-2 h-9 px-3 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">New Workflow</span>
            </Button>
          </div>
        </div>

        {workflows.length === 0 ? (
          <Card className="border border-[#1f2933] bg-[#0b1017] shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="mb-4 text-sm text-[#9aa3ad]">
                No workflows yet. Create your first automation.
              </p>
              <Button
                onClick={handleCreateWorkflow}
                className="flex items-center gap-2 h-9 px-3 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create workflow</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="bg-[#0b1017] border border-[#1f2933] hover:border-[#2563eb] hover:shadow-[0_0_0_1px_rgba(37,99,235,0.4)] transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium text-[#e6eef6]">
                        {workflow.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#9aa3ad]">
                        {workflow.nodes.length} node
                        {workflow.nodes.length === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                        aria-label={`Open ${workflow.title}`}
                        className="h-7 w-7 rounded-full hover:bg-[#111827]"
                      >
                        <Settings className="h-3.5 w-3.5 text-[#9aa3ad]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        aria-label={`Delete ${workflow.title}`}
                        className="h-7 w-7 rounded-full hover:bg-[#111827]"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#6b7280]">
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Execution coming soon")}
                      className="h-7 px-3 rounded-full border-[#1f2933] bg-transparent text-xs text-[#e6eef6] hover:bg-[#111827]"
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
