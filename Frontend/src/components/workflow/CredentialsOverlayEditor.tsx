import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
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

      const merged = { ...data, ...payload };

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
      // small delay to show success
      await new Promise((r) => setTimeout(r, 600));
      setSubmitting(false);
      onClose();
    }
  };

  if (!currentCred) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 12h18" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3v18" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit Credential</h3>
                <p className="text-sm text-slate-500">{currentCred.platform}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close editor"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-600 mb-1">Platform</Label>
              <Input value={currentCred.platform} disabled className="bg-slate-50 cursor-not-allowed" />
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading fields…
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[42vh] overflow-auto pr-2">
                {credentialSchema
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
                            onChange={(e) => setData((prev) => ({ ...prev, [r.name]: e.target.value }))}
                            placeholder={r.placeholder}
                            className="pr-10"
                          />

                          {r.type === "password" && (
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-slate-500 hover:text-slate-700 p-1 rounded"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} type="button" disabled={submitting}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CredentialsOverlayEditor;