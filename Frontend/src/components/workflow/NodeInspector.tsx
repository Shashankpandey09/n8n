import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
  const nodeDefinition = nodeDefinitions.find((d) => d.type === node.data.type);
  const CreateCredentials = useCredStore((s) => s.createCredentials);
  const { getWebhookUrl, WebhookUrl: path, success, executeNode } = useWebhook(
    (s) => s
  );

  const StoredCred = useCredStore(
    (s) =>
      s.credentialsMetaData.find((s) => nodeDefinition?.type === s?.platform)
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050b11] text-[#e6eef6]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1f2933] bg-[#050b11]">
        <h2 className="text-sm font-semibold tracking-wide">Node Settings</h2>

        <div className="flex items-center gap-3">
          {nodeDefinition?.type !== "webhook" && (
            <ExecuteButton onExecute={handleExecuteNode} />
          )}

          <Button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="
              h-9 w-9 rounded-full
              bg-[#0b1017]
              border border-[#1f2933]
              text-[#fca5a5]
              shadow-sm
              hover:bg-[#111827]
              hover:border-[#f87171]
              hover:text-[#fecaca]
              active:scale-95
              transition-all duration-150
            "
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 3-column content area – width ratios kept exactly */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: 0.33 */}
        <div className="flex-[0.33] min-w-[260px] h-full overflow-hidden bg-[#0b1017]">
          <LeftPanel
            nodeDefinition={nodeDefinition}
            nodeId={node.id}
            connections={edges}
          />
        </div>

        {/* Center: 0.34 */}
        <div className="flex-[0.34] min-w-[360px] h-full overflow-y-auto px-6 py-4 bg-[#050b11]">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="space-y-4 px-0">
              <div className="space-y-2">
                <label
                  htmlFor="nodeLabel"
                  className="block text-sm font-medium text-[#e6eef6]"
                >
                  Action
                </label>
                <select
                  id="nodeLabel"
                  className="mt-1 block w-full rounded-md border border-[#1f2933] bg-[#111827] py-2 pl-3 pr-10 text-sm shadow-sm text-[#e6eef6] placeholder:text-[#6b7280] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
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
                      className="bg-[#050b11] text-[#e6eef6]"
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parameters */}
              <div className="pt-4 border-t border-[#1f2933]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Parameters</h3>
                </div>

                <ParametersPanel
                  node={node}
                  nodeDefinition={nodeDefinition}
                  onUpdate={onUpdate}
                />
              </div>

              {/* Webhook extra UI */}
              {nodeDefinition?.type === "webhook" && <WebhookPanel path={path} />}

              {/* Credentials */}
              {nodeDefinition?.credentials &&
                nodeDefinition.credentials.length > 0 && (
                  <div className="pt-4 border-t border-[#1f2933]">
                    <h3 className="text-sm font-medium mb-3">Credentials</h3>
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

        {/* Right: 0.33 */}
        <div className="flex-[0.33] min-w-[320px] h-full overflow-hidden bg-[#0b1017]">
          <OutputPanel nodeId={node.id} />
        </div>
      </div>
    </div>
  );
};

export default NodeInspector;
