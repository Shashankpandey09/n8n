import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CredentialsPanel = ({
  node,
  nodeDefinition,
  CreateCredentials,
  StoredCred,
  onUpdate,
}) => {
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
    const def = nodeDefinition?.credentials?.find(
      (c) => c.name === credentialName
    );
    const newFields: Record<string, string> = {};
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
      if (ok)
        toast.success(`Successfully created credentials for ${nodeDefinition.type}`);
      else toast.error("Failed to create credentials");
    } catch {
      toast.error("Failed to create credentials");
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-2 text-slate-100">
      <Label htmlFor="credentialSelect" className="text-xs text-slate-300">
        Choose credential
      </Label>

      <select
        id="credentialSelect"
        value={selectedCredential}
        onChange={(e) => handleSelect(e.target.value)}
        className="
          px-3 py-2 rounded-md
          border border-slate-700
          text-sm
          outline-none cursor-pointer w-full
          bg-slate-900 text-slate-100
          shadow-sm
          focus:border-sky-500 focus:ring-1 focus:ring-sky-500
        "
      >
        <option value="" className="bg-slate-900 text-slate-400">
          -- none --
        </option>
        {nodeDefinition.credentials.map((c) => (
          <option
            key={c.name}
            value={c.name}
            className="bg-slate-900 text-slate-100"
          >
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
                <Label className="text-xs text-slate-300">
                  {field.name}
                </Label>
                <Input
                  placeholder={field.name}
                  required
                  type={field.type}
                  value={credentialFields[field.name] ?? ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className="
                    bg-slate-900
                    border border-slate-700
                    text-sm text-slate-100
                    placeholder:text-slate-500
                    focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                  "
                />
              </div>
            ))}

        {selectedCredential === StoredCred ? (
          <Link to={"/credential"}>
            <Button
              type="button"
              className="mt-1 bg-sky-600 hover:bg-sky-500 text-white border-0 shadow-sm"
            >
              Update
            </Button>
          </Link>
        ) : (
          selectedCredential && (
            <Button
              type="submit"
              className="mt-1 bg-sky-600 hover:bg-sky-500 text-white border-0 shadow-sm"
            >
              Save credential
            </Button>
          )
        )}
      </form>
    </div>
  );
};

export default CredentialsPanel;
