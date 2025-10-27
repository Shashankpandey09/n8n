import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Play, Trash } from "lucide-react";
import { toast } from "sonner";
import NodePalette from "@/components/workflow/NodePalette";
import NodeInspector from "@/components/workflow/NodeInspector";
import { handleSave } from "@/utils/handleFunctions";
import axios from "axios";
import { useWebhook } from "@/store/Webhook";
import { useCredStore } from "@/store/CredStore";

const WorkflowEditor = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const path=useWebhook((s)=>s.WebhookUrl)
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // New: selectedEdge state to allow deleting/inspecting edges
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const [workflowTitle, setWorkflowTitle] = useState("New Workflow");
  const savedCredentials=useCredStore((s)=>s.credentialsMetaData)

  useEffect(() => {
    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const workflow = allWorkflows.find((w: any) => w.id === Number(workflowId));

    if (workflow) {
      setWorkflowTitle(workflow.title);
      setNodes(workflow.nodes || []);
      setEdges(workflow.connections || []);
    }
  }, [workflowId, setNodes, setEdges]);

  // wrap onConnect
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const res = addEdge(params, eds);
        console.log("edge added:", params, "resulting edges:", res);
        return res;
      }),
    [setEdges]
  );

  // Log nodes/edges whenever they change (helps show all updates)
  useEffect(() => {
    console.log("nodes state updated:", nodes);
  }, [nodes]);

  useEffect(() => {
    console.log("edges state updated:", edges);
  }, [edges]);

  // Handle deletions invoked by React Flow built-in change events
  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const ids = deletedNodes.map((n) => n.id);
      setNodes((nds) => nds.filter((n) => !ids.includes(n.id)));
      console.log("onNodesDelete -> deleted nodes:", deletedNodes);
      //deleting all the edges which are connected to this node
      const filteredEdges = edges.filter(
        (e) => !ids.includes(e.source) && !ids.includes(e.target)
      );
      console.log(filteredEdges);
      setEdges(filteredEdges);
      // clear inspector if selected node was deleted
      if (selectedNode && ids.includes(selectedNode.id)) {
        setSelectedNode(null);
      }
      toast.success("Node(s) deleted");
    },
    [setNodes, nodes, selectedNode]
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const ids = deletedEdges.map((e) => e.id).filter(Boolean) as string[];
      setEdges((eds) => eds.filter((e) => !(e.id && ids.includes(e.id))));
      console.log(
        "onEdgesDelete -> deleted edges:",
        deletedEdges,
        "remaining:",
        edges
      );
      if (selectedEdge && selectedEdge.id && ids.includes(selectedEdge.id)) {
        setSelectedEdge(null);
      }
      toast.success("Edge(s) deleted");
    },
    [setEdges, edges, selectedEdge]
  );

  // Wrap the provided onNodesChange/onEdgesChange so we can also log the changes objects
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // pass to original handler
      onNodesChange(changes);
      console.log("onNodesChange called:", changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      console.log("onEdgesChange called:", changes);
    },
    [onEdgesChange]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    // clear selected edge if any
    setSelectedEdge(null);
    console.log("node clicked:", node);
  };

  const handleEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    // clear selected node if any
    setSelectedNode(null);
    console.log("edge clicked:", edge);
  };

  const handleAddNode = (
    type: string,
    ActionType: string,
    description: string|string[]
  ) => {
    const Desc=Array.isArray(description)?description[0]:description
    const newNode: Node = {
      id: `${Date.now()}`,
      type: ActionType === "Trigger" ? "input" : "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label:Desc ,
        type,
        parameters: {},
        description,
      },
    };
    setNodes((nds) => [...nds, newNode]);

    console.log("node added:", newNode, "all nodes:", [...nodes, newNode]);
    toast.success(`${type} node added`);
  };

  // toolbar delete button (deletes currently selected node or edge)
  const handleDeleteSelection = () => {
    if (selectedNode) {
      handleNodesDelete([selectedNode]);
    } else if (selectedEdge) {
      handleEdgesDelete([selectedEdge]);
    } else {
      toast.info("Select a node or edge first");
    }
  };

  // Allow keyboard Delete key to remove selected node/edge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        if (selectedNode) {
          handleNodesDelete([selectedNode]);
        } else if (selectedEdge) {
          handleEdgesDelete([selectedEdge]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, selectedEdge, handleNodesDelete, handleEdgesDelete]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex gap-2 items-center">
           <Button
  variant="outline"
  onClick={async () => {
    try {
      const raw = localStorage.getItem("validPayload");
      if (!raw) {
        toast.error("No payload found in localStorage");
        return;
      }
      const payload = JSON.parse(raw);
    console.log(path)
      const res = await axios.post(
        `http://localhost:3000/api/v1/webhook/handle/${path}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        toast.info("Executing workflow");
      } else {
        toast.error(`Unexpected status: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      // If axios error, better message:
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";
      toast.error(msg);
    }
  }}
>test
  <Play />
</Button>

            <Button
              onClick={() =>
                handleSave(nodes, edges, workflowId, workflowTitle,savedCredentials)
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>

            {/* Delete selected node/edge */}
            <Button variant="destructive" onClick={handleDeleteSelection}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAddNode={handleAddNode} nodes={nodes} />

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onNodesDelete={handleNodesDelete} // ensure deletable via flow's built-in actions
            onEdgesDelete={handleEdgesDelete}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={(updatedNode) => {
              setNodes((nds) =>
                nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
              );
              setSelectedNode(updatedNode);
              console.log("node updated via inspector:", updatedNode);
            }}
            workflowId={workflowId}
          />
        )}

        {/* Optional simple inspector for edges (could be replaced by a full EdgeInspector) */}
        {selectedEdge && (
          <div className="w-80 border-l p-4 bg-muted">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium">Edge</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedEdge(null)}
              >
                ✕
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div>
                <strong>ID:</strong> {selectedEdge.id ?? "(no id)"}
              </div>
              <div>
                <strong>Source:</strong> {selectedEdge.source}
              </div>
              <div>
                <strong>Target:</strong> {selectedEdge.target}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    handleEdgesDelete([selectedEdge]);
                  }}
                >
                  Delete Edge
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;
