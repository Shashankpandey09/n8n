import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Play, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";

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
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      navigate("/");
      return;
    }

    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const userWorkflows = allWorkflows.filter((w: any) => w.userId === currentUser.id);
    setWorkflows(userWorkflows);
  }, [navigate]);

  const handleCreateWorkflow = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    const newWorkflow = {
      id: Date.now(),
      userId: currentUser.id,
      title: "New Workflow",
      nodes: [],
      connections: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    allWorkflows.push(newWorkflow);
    localStorage.setItem("workflows", JSON.stringify(allWorkflows));
    
    navigate(`/workflow/${newWorkflow.id}`);
  };

  const handleDeleteWorkflow = (id: number) => {
    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const updated = allWorkflows.filter((w: any) => w.id !== id);
    localStorage.setItem("workflows", JSON.stringify(updated));
    setWorkflows(workflows.filter(w => w.id !== id));
    toast.success("Workflow deleted");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Workflow Automation</h1>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Workflows</h2>
            <p className="text-muted-foreground">Build and manage your automation workflows</p>
          </div>
          <Button onClick={handleCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>

        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">No workflows yet</p>
              <Button onClick={handleCreateWorkflow}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{workflow.title}</CardTitle>
                      <CardDescription>
                        {workflow.nodes.length} nodes
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Execution coming soon")}
                    >
                      <Play className="mr-2 h-3 w-3" />
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
