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
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NodePalette from "@/components/workflow/NodePalette";
import NodeInspector from "@/components/workflow/NodeInspector";
import { handleSave } from "@/utils/handleFunctions";
import axios from "axios";
import { useWebhook } from "@/store/Webhook";
import { useCredStore } from "@/store/CredStore";
import WorkflowNavbar from "@/components/workflow/WorkflowNavbar";
import { Trash2 } from "lucide-react";
import { icons, styles } from "@/components/executionPage/StatusBadge";
import { useExecutionStore } from "@/store/useExecutionStore";

type WFNodeData = {
  label?: string;
  type?: string;
  [key: string]: any;
};

const BaseNode = ({
  id,
  data,
  isTrigger,
}: {
  id: string;
  data: WFNodeData;
  isTrigger: boolean;
}) => {
  const { ExecutedNodes} =
    useExecutionStore((s) => s);
  
  const label = data.label || data.type || "Node";
  const nodeStatus = ExecutedNodes.find((c) => c.nodeId === id)?.status;
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("workflow-delete-node", { detail: { id } })
    );
  };

  return (
    <div className="group relative  border-[#111827] bg-[#020817] ">
      <div className="rounded-2xl  relative shadow-sm px-4 py-2">
        <div className=" text-center  ">
          <span className="text-sm flex justify-around items-center font-medium text-[#e5e7eb] capitalize">
            {label}
            <span  className={`${styles[nodeStatus]} bg-inherit`}>{icons[nodeStatus]}</span>
          </span>
        </div>
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 fixed right-0  top-0 transition-opacity  hover:text-red-500 p-1"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {isTrigger ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[#38bdf8] fixed bottom-0"
        />
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="!bg-[#38bdf8] fixed bottom-0"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="!bg-[#38bdf8] fixed bottom-0"
          />
        </>
      )}
    </div>
  );
};

const TriggerNode = (props: NodeProps<WFNodeData>) => (
  <BaseNode id={props.id} data={props.data} isTrigger />
);

const DefaultNode = (props: NodeProps<WFNodeData>) => (
  <BaseNode id={props.id} data={props.data} isTrigger={false} />
);

const nodeTypes = {
  input: TriggerNode,
  default: DefaultNode,
};

const WorkflowEditor = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const path = useWebhook((s) => s.WebhookUrl);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const [workflowTitle, setWorkflowTitle] = useState("New Workflow");
  const savedCredentials = useCredStore((s) => s.credentialsMetaData);
  const { setListening, setPolling } = useWebhook((s) => s);
  const fetchExecutionTaskStatus = useExecutionStore(
    (s) => s.fetchExecutionTaskStatus
  );
  const API_BASE =
  import.meta.env.VITE_API_URL || "https://flowboard.shashankpandey.dev";
    const {  isTestActive, ExecutedNodes, ExecutionId } =
    useExecutionStore((s) => s);
  useEffect(() => {
    let intervalID: NodeJS.Timeout | null = null;
    if (isTestActive) {
      intervalID = setInterval(() => {
        fetchExecutionTaskStatus(ExecutionId);
      }, 2000);
      return () => {
        if (intervalID) {
          clearInterval(intervalID);
        }
      };
    }
  }, [isTestActive,fetchExecutionTaskStatus,ExecutedNodes]);

  useEffect(() => {
    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const workflow = allWorkflows.find((w: any) => w.id === Number(workflowId));

    if (workflow) {
      setWorkflowTitle(workflow.title);
      setNodes(workflow.nodes || []);
      setEdges(workflow.connections || []);
    }
  }, [workflowId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const res = addEdge(params, eds);
        console.log("edge added:", params, "resulting edges:", res);
        return res;
      }),
    [setEdges]
  );

  useEffect(() => {
    console.log("nodes state updated:", nodes);
  }, [nodes]);

  useEffect(() => {
    console.log("edges state updated:", edges);
  }, [edges]);

  const saveWith = useCallback(
    async (nextNodes: Node[], nextEdges: Edge[]) => {
      await handleSave(
        nextNodes,
        nextEdges,
        workflowId,
        workflowTitle,
        savedCredentials
      );
    },
    [workflowId, workflowTitle, savedCredentials]
  );

  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const ids = deletedNodes.map((n) => n.id);

      setNodes((prevNodes) => {
        const nextNodes = prevNodes.filter((n) => !ids.includes(n.id));

        setEdges((prevEdges) => {
          const nextEdges = prevEdges.filter(
            (e) => !ids.includes(e.source) && !ids.includes(e.target)
          );

          void saveWith(nextNodes, nextEdges);
          console.log("onNodesDelete -> deleted nodes:", deletedNodes);
          console.log("remaining edges:", nextEdges);
          return nextEdges;
        });

        if (selectedNode && ids.includes(selectedNode.id)) {
          setSelectedNode(null);
        }

        setTimeout(() => toast.success("Node deleted"), 500);
        return nextNodes;
      });
    },
    [setNodes, setEdges, selectedNode, saveWith]
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const ids = deletedEdges.map((e) => e.id).filter(Boolean) as string[];

      setEdges((prevEdges) => {
        const nextEdges = prevEdges.filter(
          (e) => !(e.id && ids.includes(e.id))
        );
        void saveWith(nodes, nextEdges);

        console.log(
          "onEdgesDelete -> deleted edges:",
          deletedEdges,
          "remaining:",
          nextEdges
        );

        if (selectedEdge && selectedEdge.id && ids.includes(selectedEdge.id)) {
          setSelectedEdge(null);
        }

        setTimeout(() => toast.success("Node deleted"), 500);
        return nextEdges;
      });
    },
    [setEdges, nodes, selectedEdge, saveWith]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
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
    setSelectedEdge(null);
    console.log("node clicked:", node);
  };

  const handleEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    console.log("edge clicked:", edge);
  };

  const handleAddNode = (
    type: string,
    ActionType: string,
    description: string | string[]
  ) => {
    const newNode: Node = {
      id: `${Date.now()}`,

      type: ActionType === "Trigger" ? "input" : "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: type,
        type,
        parameters: {},
        description,
      },
    };
    setNodes((nds) => [...nds, newNode]);

    console.log("node added:", newNode, "all nodes:", [...nodes, newNode]);
    toast.success(`${type} node added`);
  };

  const handleDeleteSelection = useCallback(() => {
    if (selectedNode) {
      handleNodesDelete([selectedNode]);
    } else if (selectedEdge) {
      handleEdgesDelete([selectedEdge]);
    } else {
      toast.info("Select a node or edge first");
    }
  }, [selectedNode, selectedEdge, handleNodesDelete, handleEdgesDelete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        handleDeleteSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDeleteSelection]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      const id = custom.detail?.id;
      if (!id) return;
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      handleNodesDelete([node]);
    };

    window.addEventListener("workflow-delete-node", handler);
    return () => window.removeEventListener("workflow-delete-node", handler);
  }, [nodes, handleNodesDelete]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleTest = useCallback(async () => {
    try {
      const raw = localStorage.getItem("validPayload");
      if (!raw) {
        toast.error("No payload found in localStorage");
        return;
      }
      const payload = JSON.parse(raw);
      const triggerId = payload?.nodes[0]?.id;
      const triggerPayload = useWebhook
        .getState()
        .NodePayload.get(triggerId)?.output;

      const res = await axios.post(
        `${API_BASE}/api/v1/webhook/handle/${path}`,
        triggerPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        toast.info("Executing workflow");
        fetchExecutionTaskStatus(res.data.executionId);
      } else {
        toast.error(`Unexpected status: ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(msg);
    }
  }, [path]);

  const handleSaveClick = async () =>
    await handleSave(nodes, edges, workflowId, workflowTitle, savedCredentials);

  return (
    <div className="h-screen flex flex-col bg-[#050b11] text-[#e6eef6]">
      <WorkflowNavbar
        workflowTitle={workflowTitle}
        onTitleChange={setWorkflowTitle}
        onBack={handleBack}
        onTest={handleTest}
        onSave={handleSaveClick}
        onDeleteSelection={handleDeleteSelection}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <NodePalette onAddNode={handleAddNode} nodes={nodes} />

        <div className="flex-1 bg-[#050b11]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={handleEdgesDelete}
            fitView
          >
            <Controls />
            <MiniMap
              style={{ background: "#020617" }}
              nodeColor={() => "#1f2937"}
              maskColor="rgba(15,23,42,0.85)"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#1f2933"
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="fixed inset-0 z-50 bg-black/40">
            <NodeInspector
              node={selectedNode}
              onClose={() => {
                setSelectedNode(null);
                setListening(true);
                setPolling(false);
              }}
              onUpdate={(updatedNode) => {
                setNodes((nds) =>
                  nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
                );
                setSelectedNode(updatedNode);
                console.log("node updated via inspector:", updatedNode);
              }}
              workflowId={workflowId}
              workflowTitle={workflowTitle}
              edges={edges}
              savedCredentials={savedCredentials}
              Nodes={nodes}
            />
          </div>
        )}

        {selectedEdge && (
          <div className="w-80 border-l border-[#1f2933] p-4 bg-[#0b1017] text-[#e6eef6]">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium">Edge</h3>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-[#111827]"
                onClick={() => setSelectedEdge(null)}
              >
                ✕
              </Button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
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
                  className="bg-[#b91c1c] hover:bg-[#991b1b]"
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
