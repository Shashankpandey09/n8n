import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredStore, type Credential } from "@/store/CredStore";
import { credentialSchema } from "@/Contstants/CredentialSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CredentialsOverlayEditor = ({
  currentCred,
  onClose,
}: {
  currentCred: Pick<Credential, "platform" | "id" | "createdAt"> | null;
  onClose: () => void;
}) => {
  const { createCredentials } = useCredStore((s) => s);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      const res = await createCredentials(currentCred?.platform || "", data);
      if (res) {
        toast.success(`Edited credentials for ${currentCred?.platform}`);
        onClose();
      } else toast.error("Edit failed");
    } catch (err) {
      console.error(err);
      toast.error("Error editing credentials");
    }
  };

  if (!currentCred) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white w-[420px] rounded-2xl shadow-lg border border-slate-200 p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Edit Credential
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-600 mb-1">
              Platform
            </Label>
            <Input
              value={currentCred.platform}
              disabled
              className="bg-slate-100 cursor-not-allowed"
            />
          </div>

          {credentialSchema
            .filter((x) => x.platform === currentCred.platform)
            .map((c) =>
              c.RequiredKeys.map((r, i) => (
                <div key={i}>
                  <Label className="text-sm font-medium text-slate-600 mb-1">
                    {r.name}{" "}
                    {r.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={r.name}
                      name={r.name}
                      type={
                        r.type === "password" && showPassword ? "text" : r.type
                      }
                      placeholder={r.placeholder}
                      className="pr-10"
                    />
                    {r.type === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                      >
                        {showPassword ? <Eye size={18} />:<EyeOff size={18} /> }
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialsOverlayEditor;
