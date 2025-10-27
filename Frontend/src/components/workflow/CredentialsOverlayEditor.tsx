import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredStore, type Credential } from "@/store/CredStore";
import { credentialSchema } from "@/Contstants/CredentialSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  currentCred: Pick<Credential, "platform" | "id" | "createdAt"> | null;
  onClose: () => void;
};

const CredentialsOverlayEditor = ({ currentCred, onClose }: Props) => {
  const { createCredentials, getDecryptedCredential } = useCredStore((s) => s);
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  useEffect(() => {
    if (!currentCred?.id) {
      setData({});
      return;
    }

    let cancelled = false;
    const getdecryptedData = async () => {
      try {
        setLoading(true);
        const resp = await getDecryptedCredential(currentCred.id);
        if (!cancelled) {
          // expect resp to be Record<string, string> or similar
          setData(resp ?? {});
        }
      } catch (err) {
        console.error("failed to get decrypted credential", err);
        toast.error("Failed to load credential");
        setData({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getdecryptedData();
    return () => {
      cancelled = true;
    };
  }, [currentCred?.id, getDecryptedCredential]);

 
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentCred) return;

    try {
      setSubmitting(true);
      const formData = new FormData(e.currentTarget);
      const payload = Object.fromEntries(formData) as Record<string, string>;

      const merged = { ...payload, ...data };

      const res = await createCredentials(currentCred.platform || "", merged);
      if (res) {
        toast.success(`Edited credentials for ${currentCred.platform}`);
    
      } else {
        toast.error("Edit failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error editing credentials");
    } finally {
    await new Promise((r)=>setTimeout(r,1000))
         onClose();
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

          {loading ? (
            <div className="text-sm text-slate-500">Loading fields…</div>
          ) : (
            credentialSchema
              .filter((x) => x.platform === currentCred.platform)
              .flatMap((c) =>
                c.RequiredKeys.map((r, i) => (
                  <div key={`${currentCred?.id}-${r.name}-${i}`}>
                    <Label className="text-sm font-medium text-slate-600 mb-1">
                      {r.name} {r.required && <span className="text-red-500">*</span>}
                    </Label>

                    <div className="relative">
                      <Input
                        id={r.name}
                        name={r.name}
                  
                        type={r.type === "password" && showPassword ? "text" : r.type}
                    
                        value={data[r.name] ?? ""}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, [r.name]: e.target.value }))
                        }
                        placeholder={r.placeholder}
                        className="pr-10"
                      />

                      {r.type === "password" && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        >
                          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={onClose} type="button" disabled={submitting}>
              Cancel
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialsOverlayEditor;
