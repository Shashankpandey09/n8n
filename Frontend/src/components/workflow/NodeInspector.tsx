import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import nodeDefinitions from "./NodeDefinitions"; // Import the shared configuration
import { toast } from "sonner";
import { useCredStore } from "@/store/CredStore";
import { useWebhook } from "@/store/Webhook";

const NodeInspector = ({ node, onClose, onUpdate, workflowId }) => {
  // find definition
  const nodeDefinition = nodeDefinitions.find((d) => d.type === node.data.type);
  const CreateCredentials = useCredStore((s) => s.createCredentials);
  const getWebhookUrl = useWebhook((s) => s.getWebhookUrl);
  const path = useWebhook((s) => s.WebhookUrl);

  // parameters state (apply defaults from definition)
  const [parameters, setParameters] = useState(() => {
    const initial = { ...(node.data?.parameters || {}) };
    nodeDefinition?.parameters?.forEach((p) => {
      if (initial[p.name] === undefined && p.default !== undefined) {
        initial[p.name] = p.default;
      }
    });
    return initial;
  });

  // credential selection & fields
  const [selectedCredential, setSelectedCredential] = useState(
    () => node.data?.credentials?.selected ?? ""
  );
  const [credentialFields, setCredentialFields] = useState(
    () => ({ ...(node.data?.credentials?.fields || {}) })
  );

  // sync when node changes (or nodeDefinition changes)
  useEffect(() => {
    const initial = { ...(node.data?.parameters || {}) };
    nodeDefinition?.parameters?.forEach((p) => {
      if (initial[p.name] === undefined && p.default !== undefined) {
        initial[p.name] = p.default;
      }
    });
    setParameters(initial);

    setSelectedCredential(node.data?.credentials?.selected ?? "");
    setCredentialFields({ ...(node.data?.credentials?.fields || {}) });
  }, [node.id, node.data, nodeDefinition]);

  useEffect(() => {
    if (nodeDefinition?.type === "webhook") {
      // create or load the webhook url
      getWebhookUrl(workflowId);
    }
  }, [node]); // keep node as dependency to re-run when inspector switches nodes

  // update parameter locally and propagate
  const handleParameterChange = (key, value) => {
    const updated = { ...parameters, [key]: value };
    setParameters(updated);
    onUpdate({
      ...node,
      data: { ...node.data, parameters: updated },
    });
  };

  // when credential selection changes
  const handleCredentialSelect = (credentialName) => {
    const def = nodeDefinition?.credentials?.find((c) => c.name === credentialName);
    const newFields = {};

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

  // when credential sub-field changes
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const success = await CreateCredentials(nodeDefinition.type, credentialFields);
      if (success) {
        toast.success(`Successfully created credentials for ${nodeDefinition.type}`);
      }
    } catch (error) {
      toast.error("Failed to create credentials");
    }
  };

  return (
    <aside className="w-80 md:w-[32rem] border-l bg-card p-4 overflow-y-auto">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="flex items-center justify-between px-0">
          <CardTitle className="text-lg ">Node Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4 " />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label htmlFor="nodeLabel" className="block text-sm font-medium ">
              Action
            </Label>
            <select
              onChange={(e) =>
                onUpdate({
                  ...node,
                  data: { ...node.data, description: e.target.value },
                })
              }
              id="nodeLabel"
              className="mt-1 block w-full rounded-md border border-input bg-transparent py-2 pl-3 pr-10 text-sm  shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              value={node.data?.description ?? (Array.isArray(nodeDefinition?.description) ? nodeDefinition.description[0] : nodeDefinition?.description)}
            >
              {Array.isArray(nodeDefinition?.description) ? (
                nodeDefinition.description.map((s) => (
                  <option key={s} value={s} className="">
                    {s}
                  </option>
                ))
              ) : (
                <option className="">{nodeDefinition?.description}</option>
              )}
            </select>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3 ">Parameters</h3>
            <div className="space-y-4">
              {nodeDefinition?.parameters?.length > 0 ? (
                nodeDefinition.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name} className="flex items-center justify-between ">
                      <span>{param.label || param.name}</span>
                      {param.required && <span className="text-destructive">*</span>}
                    </Label>

                    <Input
                      id={param.name}
                      type={param.type || "text"}
                      value={parameters[param.name] ?? ""}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      placeholder={param.placeholder ?? param.default ?? ""}
                      disabled={!!param.disabled}
                      className="bg-transparent "
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm ">No parameters available for this node type.</p>
              )}
            </div>
          </div>

          {/* Webhook url path */}
          {nodeDefinition?.type === "webhook" && (
            <div className="space-y-1">
              <Label htmlFor="webhook" className="block text-sm font-medium ">
                Webhook URL
              </Label>
              <p
                id="webhook"
                className="px-4 py-2 bg-muted border border-input rounded-lg text-sm  cursor-pointer shadow-sm hover:opacity-90 transition-all duration-150 select-all break-words"
                title={`http://localhost:3000/api/v1/webhook/${path}`}
              >
                {`http://localhost:3000/api/v1/webhook/${path}`}
              </p>
            </div>
          ) }

          {/* Credentials */}
          {nodeDefinition?.credentials && nodeDefinition.credentials.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3 ">Credentials</h3>
              <div className="flex flex-col gap-2 mb-2">
                <Label htmlFor="credentialSelect" className="text-sm ">
                  Choose credential
                </Label>

                <select
                  id="credentialSelect"
                  value={selectedCredential}
                  onChange={(e) => handleCredentialSelect(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input text-sm outline-none cursor-pointer w-full bg-transparent  shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="" className="">-- none --</option>
                  {nodeDefinition.credentials.map((c) => (
                    <option key={c.name} value={c.name} className="">
                      {c.name}
                    </option>
                  ))}
                </select>

                <form onSubmit={handleSave} className="space-y-2">
                  {selectedCredential &&
                    nodeDefinition.credentials
                      .find((c) => c.name === selectedCredential)
                      ?.InputFields?.map((field) => (
                        <div key={field.name} className="space-y-1">
                          <Label className="text-sm ">{field.name}</Label>
                          <Input
                            placeholder={field.name}
                            required
                            type={field.type}
                            value={credentialFields[field.name] ?? ""}
                            onChange={(e) => handleCredentialFieldChange(field.name, e.target.value)}
                            className="bg-transparent "
                          />
                        </div>
                      ))}

                  <Button type="submit">Save credential</Button>
                </form>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default NodeInspector;
