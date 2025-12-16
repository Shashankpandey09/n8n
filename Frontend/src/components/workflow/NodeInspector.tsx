import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Activity, Key, Settings } from "lucide-react";
import nodeDefinitions from "./NodeDefinitions";
import { toast } from "sonner";
import { useCredStore } from "@/store/CredStore";
import { useWebhook } from "@/store/Webhook";
import { LeftPanel, OutputPanel } from "../ui/panels";
import ParametersPanel from "./ParametersPanel";
import CredentialsPanel from "./CredentialsPanel";
import WebhookPanel from "./WebhookPanel";
import ExecuteButton from "./ExecuteButton";
import { handleSave } from "@/utils/handleFunctions";

const NodeInspector = ({
  node,
  onClose,
  onUpdate,
  workflowId,
  workflowTitle,
  edges,
  savedCredentials,
  Nodes,
}) => {
  const nodeDefinition = nodeDefinitions?.find((d) => d.type === node.data.type);
  const CreateCredentials = useCredStore((s) => s.createCredentials);
  const { getWebhookUrl, WebhookUrl: path, success, executeNode } = useWebhook(
    (s) => s
  );

  const StoredCred = useCredStore(
    (s) =>
      s.credentialsMetaData?.find((s) => nodeDefinition?.type === s?.platform)
        ?.platform ?? null
  );

  useEffect(() => {
    if (nodeDefinition?.type === "webhook") {
      getWebhookUrl(workflowId);
    }
  }, [node.id, getWebhookUrl, workflowId, nodeDefinition?.type]);

  const handleExecuteNode = async () => {
    if (nodeDefinition?.type !== "webhook") {
      await handleSave(Nodes, edges, workflowId, workflowTitle, savedCredentials);
      await executeNode(node.id, workflowId);
      if (success) toast.success("Node executed successfully");
    }
  };

  const actionSource = node.data?.description ?? nodeDefinition?.description;
  const actionValue: string = Array.isArray(actionSource)
    ? String(actionSource[0] ?? "")
    : actionSource == null
    ? ""
    : String(actionSource);

  const actionOptions: string[] = Array.isArray(nodeDefinition?.description)
    ? nodeDefinition.description.map((s) => String(s))
    : [String(nodeDefinition?.description ?? "")];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#020817] text-[#e6eef6] animate-in fade-in zoom-in-95 duration-200">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-[#1e293b] bg-[#020817]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#94a3b8]" />
          <h2 className="text-sm font-semibold tracking-wide text-[#e6eef6]">Node Configuration</h2>
        </div>

        <div className="flex items-center gap-3">
          {nodeDefinition?.type !== "webhook" && (
            <ExecuteButton onExecute={handleExecuteNode} />
          )}

          <Button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="
              h-8 w-8 rounded-full
              bg-transparent
              text-red-500
              hover:bg-[#1e293b]
              hover:text-red-500
              transition-colors duration-200
            "
            variant="ghost"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
       
        <div className="flex-[0.3] min-w-[300px] h-full overflow-hidden bg-[#020617] border-r border-[#1e293b]">
          <LeftPanel
            nodeDefinition={nodeDefinition}
            nodeId={node.id}
            connections={edges}
          />
        </div>

        <div className="flex-[0.4] min-w-[400px] h-full overflow-y-auto bg-[#020817] relative">
          <div className="absolute inset-0 px-8 py-8">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="space-y-8 px-0 py-0">
                
    
                <div className="space-y-3">
                  <label
                    htmlFor="nodeLabel"
                    className="text-xs font-semibold uppercase tracking-wider text-[#64748b] pl-1"
                  >
                    Action
                  </label>
                  <div className="relative group">
                    <select
                      id="nodeLabel"
                      className="
                        w-full appearance-none rounded-xl
                        bg-[#0f172a] border border-[#1e293b]
                        py-3 pl-4 pr-10 text-sm text-[#e6eef6]
                        shadow-sm transition-all duration-200
                        hover:border-[#3b82f6]/50
                        focus:border-[#3b82f6] focus:bg-[#0f172a] focus:ring-4 focus:ring-[#3b82f6]/10 focus:outline-none
                      "
                      value={actionValue}
                      onChange={(e) =>
                        onUpdate({
                          ...node,
                          data: { ...node.data, description: e.target.value },
                        })
                      }
                    >
                      {actionOptions.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-[#0f172a] text-[#e6eef6]"
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#64748b] group-hover:text-[#94a3b8] transition-colors">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

           
                <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                  <div className="flex items-center gap-2 pb-1">
                    <Activity className="w-4 h-4 text-[#94a3b8]" />
                    <h3 className="text-sm font-medium text-[#e6eef6]">Parameters</h3>
                  </div>

                  <div className="bg-[#020617] rounded-xl border border-[#1e293b] p-1">
                    <ParametersPanel
                      node={node}
                      nodeDefinition={nodeDefinition}
                      onUpdate={onUpdate}
                    />
                  </div>
                </div>

                {nodeDefinition?.type === "webhook" && (
                  <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                    <div className="flex items-center gap-2 pb-1">
                      <Activity className="w-4 h-4 text-[#94a3b8]" />
                      <h3 className="text-sm font-medium text-[#e6eef6]">Webhook Configuration</h3>
                    </div>
                    <WebhookPanel path={path} />
                  </div>
                )}

          
                {nodeDefinition?.credentials &&
                  nodeDefinition.credentials.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                      <div className="flex items-center gap-2 pb-1">
                        <Key className="w-4 h-4 text-[#94a3b8]" />
                        <h3 className="text-sm font-medium text-[#e6eef6]">Credentials</h3>
                      </div>
                      <CredentialsPanel
                        node={node}
                        nodeDefinition={nodeDefinition}
                        CreateCredentials={CreateCredentials}
                        StoredCred={StoredCred}
                        onUpdate={onUpdate}
                      />
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-[0.3] min-w-[300px] h-full overflow-hidden bg-[#020617] border-l border-[#1e293b]">
          <OutputPanel nodeId={node.id} />
        </div>
      </div>
    </div>
  );
};

export default NodeInspector;