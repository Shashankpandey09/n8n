
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import nodeDefinitions from "./NodeDefinitions";
import { toast } from "sonner";
import { useCredStore } from "@/store/CredStore";
import { useWebhook } from "@/store/Webhook";
import { Link } from "react-router-dom";
import { LeftPanel, OutputPanel } from "../ui/panels";
import { handleSave } from "@/utils/handleFunctions";
import ParametersPanel from "./ParametersPanel";
import CredentialsPanel from "./CredentialsPanel";
import WebhookPanel from "./WebhookPanel";
import ExecuteButton from "./ExecuteButton";

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
  const { getWebhookUrl, WebhookUrl: path, success, executeNode } = useWebhook((s) => (s));

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
    <div className="flex w-full h-full">
      <div className="w-[360px] flex-shrink-0 min-w-[280px]">
        <LeftPanel nodeDefinition={nodeDefinition} nodeId={node.id} connections={edges} />
      </div>

      <div className="flex-1 px-4 py-3 overflow-y-auto min-w-0">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="relative flex items-center justify-between px-0">
            <CardTitle className="text-lg">Node Settings</CardTitle>

            <div className="flex items-center gap-2">
              {nodeDefinition?.type !== "webhook" && (
                <ExecuteButton onExecute={handleExecuteNode} />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-md bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-destructive/20"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-0">
            <div className="space-y-2">
              <label htmlFor="nodeLabel" className="block text-sm font-medium">
                Action
              </label>
              <select
                id="nodeLabel"
                className="mt-1 block w-full rounded-md border border-input bg-transparent py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                value={actionValue}
                onChange={(e) =>
                  onUpdate({
                    ...node,
                    data: { ...node.data, description: e.target.value },
                  })
                }
              >
                {actionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Parameters</h3>
              </div>

              <ParametersPanel
                node={node}
                nodeDefinition={nodeDefinition}
                onUpdate={onUpdate}
              />
            </div>

            {nodeDefinition?.type === "webhook" && (
              <WebhookPanel path={path} />
            )}

            {nodeDefinition?.credentials &&
              nodeDefinition.credentials.length > 0 && (
                <div className="pt-4 border-t border-border">
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

      <div className="w-[640px] flex-shrink-0 min-w-[300px]">
        <OutputPanel nodeId={node.id} />
      </div>
    </div>
  );
};

export default NodeInspector;