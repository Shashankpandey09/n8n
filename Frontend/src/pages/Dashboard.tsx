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
import { v4 as uuidv4 } from "uuid";

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
    setWorkflows(workflows.filter((w) => w.id !== id));
    toast.success("Workflow deleted");
    }
    } catch (error) {
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
            <p className="text-muted-foreground">
              Build and manage your automation workflows
            </p>
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
              <Card
                key={workflow.id}
                className="hover:shadow-md transition-shadow"
              >
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
