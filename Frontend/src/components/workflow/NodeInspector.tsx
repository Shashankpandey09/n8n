
// NodeInspector.tsx
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import nodeDefinitions from "./NodeDefinitions";
import { toast } from "sonner";
import { useCredStore } from "@/store/CredStore";
import { useWebhook } from "@/store/Webhook";
import { Link } from "react-router-dom";
import { LeftPanel, OutputPanel } from "../ui/panels";
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
  const { getWebhookUrl, clearPayloads, success, executeNode, propagateAndMergeParents, fetchNode } =
    useWebhook((s) => s);
  const path = useWebhook((s) => s.WebhookUrl);
  const StoredCred = useCredStore(
    (s) =>
      s.credentialsMetaData.find((s) => nodeDefinition?.type === s?.platform)
        ?.platform ?? null
  );

  const initParameters = useCallback(() => {
    const initial = { ...(node.data?.parameters || {}) };
    nodeDefinition?.parameters?.forEach((p) => {
      if (initial[p.name] === undefined && p.default !== undefined) {
        initial[p.name] = p.default;
      }
    });
    return initial;
  }, [node.data?.parameters, nodeDefinition?.parameters]);

  const [parameters, setParameters] = useState(() => initParameters());
  const [paramModes, setParamModes] = useState(() => {
    const modes: Record<string, string> = {};
    (nodeDefinition?.parameters || []).forEach((p) => {
      modes[p.name] = node.data?.parametersMode?.[p.name] ?? "fixed";
    });
    return modes;
  });

  const [selectedCredential, setSelectedCredential] = useState(
    () => node.data?.credentials?.selected ?? ""
  );
  const [credentialFields, setCredentialFields] = useState(() => ({
    ...(node.data?.credentials?.fields || {}),
  }));
  const [testUrl, setTestUrl] = useState(false);

  useEffect(() => {
    setParameters(initParameters());
    setSelectedCredential(node.data?.credentials?.selected ?? "");
    setCredentialFields({ ...(node.data?.credentials?.fields || {}) });

    const modes: Record<string, string> = {};
    (nodeDefinition?.parameters || []).forEach((p) => {
      modes[p.name] = node.data?.parametersMode?.[p.name] ?? "fixed";
    });
    setParamModes(modes);  
  }, [node.id, node.data, nodeDefinition, initParameters, edges, propagateAndMergeParents, fetchNode]);

  useEffect(() => {
    if (nodeDefinition?.type === "webhook") {
      getWebhookUrl(workflowId);
    } else {
      // IMPORTANT: don't wipe webhook payload when opening the inspector
      clearPayloads(node.id);
    }
  }, [node, getWebhookUrl, clearPayloads, workflowId, nodeDefinition?.type]);

  const handleParameterChange = (key, value) => {
    const updated = { ...parameters, [key]: value };
    setParameters(updated);
    onUpdate({
      ...node,
      data: { ...node.data, parameters: updated },
    });
  };

  const handleModeChange = (paramName, mode) => {
    setParamModes((prev) => ({ ...prev, [paramName]: mode }));
  };

  const handleCredentialSelect = (credentialName) => {
    const def = nodeDefinition?.credentials?.find(
      (c) => c.name === credentialName
    );
    const newFields: Record<string, any> = {};

    if (def?.InputFields?.length) {
      def.InputFields.forEach((f) => {
        newFields[f.name] = node.data?.credentials?.fields?.[f.name] ?? "";
      });
    }

    setSelectedCredential(credentialName);
    setCredentialFields(newFields);

    onUpdate({
      ...node,
      data: {
        ...node.data,
        credentials: {
          selected: credentialName,
          fields: newFields,
        },
      },
    });
  };

  const handleCredentialFieldChange = (fieldName, value) => {
    const updated = { ...credentialFields, [fieldName]: value };
    setCredentialFields(updated);

    onUpdate({
      ...node,
      data: {
        ...node.data,
        credentials: {
          selected: selectedCredential,
          fields: updated,
        },
      },
    });
  };

  const handleCredSave = async (e) => {
    e.preventDefault();
    try {
      const ok = await CreateCredentials(nodeDefinition.type, credentialFields);
      if (ok) toast.success(`Successfully created credentials for ${nodeDefinition.type}`);
    } catch {
      toast.error("Failed to create credentials");
    }
  };

  const handleExecuteNode = async () => {
    // For non-webhook nodes: execute then fetch once
    if (nodeDefinition?.type !== "webhook") {
      await handleSave(Nodes, edges, workflowId, workflowTitle, savedCredentials);
      await executeNode(node.id, workflowId);
      
      // Fetch once to load the result from DB
      await fetchNode(node.id, nodeDefinition.type);
      
      if (success) toast.success("Node executed successfully");
    }
  };

  // normalize Action select to scalar string
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
        <LeftPanel nodeDefinition={nodeDefinition}  nodeId={node.id} connections={edges} />
      </div>

      <div className="flex-1 px-4 py-3 overflow-y-auto min-w-0">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="relative flex items-center justify-between px-0">
            <CardTitle className="text-lg">Node Settings</CardTitle>

            <div className="flex items-center gap-2">
              {nodeDefinition?.type !== "webhook" && (
                <Button
                  onClick={handleExecuteNode}
                  size="sm"
                  className="px-3 py-1.5 rounded-md border border-input transition-all"
                  title="Execute node"
                >
                  Execute Node
                </Button>
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
              <Label htmlFor="nodeLabel" className="block text-sm font-medium">
                Action
              </Label>
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

              <div className="space-y-4">
                {nodeDefinition?.parameters?.length > 0 ? (
                  nodeDefinition.parameters.map((param) => {
                    const mode = paramModes[param.name] ?? "fixed";
                    return (
                      <div key={param.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={param.name} className="flex items-center gap-2">
                            <span>{param.label || param.name}</span>
                            {param.required && <span className="text-destructive">*</span>}
                          </Label>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModeChange(param.name, "fixed")}
                              type="button"
                              className={`px-2 py-1 text-xs font-semibold rounded-md border transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                                mode === "fixed"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border bg-background hover:bg-muted"
                              }`}
                            >
                              Fixed
                            </button>
                            <button
                              onClick={() => handleModeChange(param.name, "Expression")}
                              type="button"
                              className={`px-2 py-1 text-xs font-semibold rounded-md border transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                                mode === "Expression"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border bg-background hover:bg-muted"
                              }`}
                            >
                              Expression
                            </button>
                          </div>
                        </div>

                        <Input
                          id={param.name}
                          type={param.type || "text"}
                          value={parameters[param.name] ?? ""}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          placeholder={mode === "fixed" ? param.placeholder ?? param.default ?? "" : "{{json.expression}}"}
                          disabled={!!param.disabled}
                          className="bg-transparent"
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm">No parameters available for this node type.</p>
                )}
              </div>
            </div>

            {nodeDefinition?.type === "webhook" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook" className="text-sm font-medium">
                    Webhook URL
                  </Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTestUrl(true)}
                      className="px-3 py-1 text-xs rounded-md border border-border bg-background hover:bg-muted transition-all"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => setTestUrl(false)}
                      className="px-3 py-1 text-xs rounded-md border border-border bg-background hover:bg-muted transition-all"
                    >
                      Prod
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p
                    id="webhook"
                    className="flex-1 px-4 py-2 bg-muted border border-input rounded-lg text-sm shadow-sm hover:opacity-90 transition-all duration-150 select-all break-words"
                  >
                    {testUrl
                      ? `http://localhost:3000/api/v1/webhook/handle/test/${path}`
                      : `http://localhost:3000/api/v1/webhook/handle/${path}`}
                  </p>
                </div>
              </div>
            )}

            {nodeDefinition?.credentials &&
              nodeDefinition.credentials.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-3">Credentials</h3>
                  <div className="flex flex-col gap-2 mb-2">
                    <Label htmlFor="credentialSelect" className="text-sm">
                      Choose credential
                    </Label>

                    <select
                      id="credentialSelect"
                      value={selectedCredential}
                      onChange={(e) => handleCredentialSelect(e.target.value)}
                      className="px-3 py-2 rounded-md border border-input text-sm outline-none cursor-pointer w-full bg-transparent shadow-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="">-- none --</option>
                      {nodeDefinition.credentials.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <form onSubmit={handleCredSave} className="space-y-2">
                      {selectedCredential &&
                        StoredCred == null &&
                        nodeDefinition.credentials
                          .find((c) => c.name === selectedCredential)
                          ?.InputFields?.map((field) => (
                            <div key={field.name} className="space-y-1">
                              <Label className="text-sm">{field.name}</Label>
                              <Input
                                placeholder={field.name}
                                required
                                type={field.type}
                                value={credentialFields[field.name] ?? ""}
                                onChange={(e) =>
                                  handleCredentialFieldChange(
                                    field.name,
                                    e.target.value
                                  )
                                }
                                className="bg-transparent"
                              />
                            </div>
                          ))}

                      {selectedCredential === StoredCred ? (
                        <Link to={"/credential"}>
                          <Button>Update</Button>
                        </Link>
                      ) : (
                        <Button type="submit">Save credential</Button>
                      )}
                    </form>
                  </div>
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