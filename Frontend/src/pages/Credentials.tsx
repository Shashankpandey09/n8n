import { useState } from "react";
import { useCredStore, type Credential } from "@/store/CredStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CredentialsOverlayEditor from "@/components/workflow/CredentialsOverlayEditor";
import { toast } from "sonner";

export default function CredentialsPage(): JSX.Element {
  const { credentialsMetaData, deleteCredential } = useCredStore((s) => s);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [overlayDisplay, setOverLay] = useState(false);
  const [currentCred, setCurrentCred] = useState<
    Pick<Credential, "id" | "platform" | "createdAt"> | null
  >(null);

  const handleDelete = async (cred: Pick<Credential, "id" | "platform" | "createdAt"> | null) => {
    if (!cred?.platform) {
      toast.error("Platform missing for this credential");
      return;
    }

    try {
      const ok = await deleteCredential(cred.platform);
      if (ok) {
        toast.success(`Deleted credential for ${cred.platform}`);
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error("delete error", err);
      toast.error("Error deleting credential");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-12">
      {overlayDisplay && (
        <CredentialsOverlayEditor
          currentCred={currentCred}
          onClose={() => setOverLay(false)}
        />
      )}

      {/* Page header */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Saved Credentials</h1>
            <p className="text-sm text-slate-500 mt-1">Manage API keys and integrations securely</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => { setCurrentCred(null); setOverLay(true); }} className="flex  bg-teal-600 hover:bg-teal-500 items-center gap-2">
              + Add Credential
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {credentialsMetaData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
            <p className="text-slate-600 mb-4">No credentials found.</p>
            <Button onClick={() => { setCurrentCred(null); setOverLay(true); }} className="bg-teal-600 hover:bg-teal-700 text-white">
              Add your first credential
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {credentialsMetaData.map((cred) => (
              <Card key={cred.id ?? cred.platform} className="border border-slate-200 hover:shadow transition-shadow">
                <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                  <div className="min-w-0">
                    <p className="text-lg font-medium text-slate-800 capitalize truncate">{cred.platform}</p>
                    <p className="text-sm text-slate-500 tracking-wider mt-1">********</p>
                    <p className="text-xs text-slate-400 mt-1">Saved: {new Date(cred.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentCred(cred);
                        setOverLay(true);
                      }}
                      aria-label={`Edit ${cred.platform}`}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        setCurrentCred(cred);
                        setDeleting(true);
                      }}
                      aria-label={`Delete ${cred.platform}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete modal (re-usable, accessible) */}
      {deleting && currentCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleting(false)} />

          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Delete credential</h3>
              <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete <strong className="capitalize">{currentCred.platform}</strong>? This action cannot be undone.</p>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(currentCred)}>Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
