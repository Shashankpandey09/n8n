import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import nodeDefinitions from "./NodeDefinitions"; // Import the shared configuration
import axios from "axios";
import { toast } from "sonner";

const NodeInspector = ({ node, onClose, onUpdate }) => {
  // find definition
  const nodeDefinition = nodeDefinitions.find((d) => d.type === node.data.type);

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
  const [selectedCredential, setSelectedCredential] = useState(() => node.data?.credentials?.selected ?? "");
  const [credentialFields, setCredentialFields] = useState(() => ({ ...(node.data?.credentials?.fields || {}) }));

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

  // update parameter locally and propagate
  const handleParameterChange = (key, value) => {
    const updated = { ...parameters, [key]: value };
    setParameters(updated);
    onUpdate({
      ...node,
      data: { ...node.data, parameters: updated },
    });
  };
  //handling description select


  // when credential selection changes
  const handleCredentialSelect = (credentialName:string) => {
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
  const handleSave=async(e:React.FormEvent<HTMLFormElement>)=>{
  
    e.preventDefault()
 try {
  const res=await axios.post('http://localhost:3000/api/v1/credential/',{name:nodeDefinition.type,credential:credentialFields},{
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
    }
  })
  console.log(res.data)
toast.success(`successfully created credentials for ${nodeDefinition.type}`)
 } catch (error) {
  
 }
  }

  return (
    <aside className="w-80 border-l bg-card p-4 overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex items-center justify-between px-0">
          <CardTitle className="text-lg">Node Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 px-0">
          {/* <div className="space-y-2">
            <Label>Node Type</Label>
            <p className="text-sm font-medium capitalize">{node.data.label || "Unknown"}</p>
          </div> */}

        <div className="space-y-2">
  <Label
    htmlFor="nodeLabel"
    // Applied standard form label styles for consistency
    className="block text-sm font-medium text-gray-700"
  >
    Action
  </Label>
  <select
    onChange={(e) =>
      onUpdate({
        ...node,
        data: { ...node.data, description: e.target.value },
      })
    }
    className="mt-1 border block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    id="nodeLabel"
  >
    {Array.isArray(nodeDefinition.description) ? (
      nodeDefinition.description.map((s) => (
        <option value={s} key={s}>{s}</option>
      ))
    ) : (
      <option>{nodeDefinition.description}</option>
    )}
  </select>
</div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Parameters</h3>
            <div className="space-y-4">
              {nodeDefinition?.parameters?.length > 0 ? (
                nodeDefinition.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name} className="flex items-center justify-between">
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
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No parameters available for this node type.</p>
              )}
            </div>
          </div>

          {/* Credentials */}
          {nodeDefinition?.credentials && nodeDefinition.credentials.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Credentials</h3>
              <div className="flex flex-col gap-2 mb-2">
                <Label htmlFor="credentialSelect" className="text-sm">
                  Choose credential
                </Label>

                <select
                  id="credentialSelect"
                  value={selectedCredential}
                  onChange={(e) => handleCredentialSelect(e.target.value)}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm outline-none cursor-pointer w-full"
                >
                  <option value="">-- none --</option>
                  {nodeDefinition.credentials.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <form onSubmit={handleSave} >
                {selectedCredential &&
                  nodeDefinition.credentials
                    .find((c) => c.name === selectedCredential)
                    ?.InputFields?.map((field) => (
                    
                      <div key={field.name} className="space-y-1">
                        <Label className="text-sm">{ field.name}</Label>
                        <Input
                          placeholder={field.name}
                          required
                          value={credentialFields[field.name] ?? ""}
                          onChange={(e) => handleCredentialFieldChange(field.name, e.target.value)}
                        />
                      </div>
                    
                    
                    ))}
                     <Button type="submit">save credential</Button>
                    </form>
              </div>
            {/* send a post request to backend */}
             
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default NodeInspector;
