import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CredentialsPanel = ({ node, nodeDefinition, CreateCredentials, StoredCred, onUpdate }) => {
  const [selectedCredential, setSelectedCredential] = useState(
    () => node.data?.credentials?.selected ?? ""
  );
  const [credentialFields, setCredentialFields] = useState(() => ({
    ...(node.data?.credentials?.fields || {}),
  }));

  useEffect(() => {
    setSelectedCredential(node.data?.credentials?.selected ?? "");
    setCredentialFields({ ...(node.data?.credentials?.fields || {}) });
  }, [node.id, node.data]);

  const handleSelect = (credentialName) => {
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

  const handleFieldChange = (fieldName, value) => {
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
      else toast.error("Failed to create credentials");
    } catch {
      toast.error("Failed to create credentials");
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-2">
      <Label htmlFor="credentialSelect" className="text-sm">
        Choose credential
      </Label>

      <select
        id="credentialSelect"
        value={selectedCredential}
        onChange={(e) => handleSelect(e.target.value)}
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
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="bg-transparent"
                />
              </div>
            ))}

        {selectedCredential === StoredCred ? (
          <Link to={"/credential"}>
            <Button>Update</Button>
          </Link>
        ) : (
          selectedCredential && <Button type="submit">Save credential</Button>
        )}
      </form>
    </div>
  );
};

export default CredentialsPanel;