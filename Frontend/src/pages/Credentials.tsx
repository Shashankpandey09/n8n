import { useState } from "react";
import { useCredStore, type Credential } from "@/store/CredStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CredentialsOverlayEditor from "@/components/workflow/CredentialsOverlayEditor";
import { toast } from "sonner";
import Navbar from "@/components/ui/Navbar";

export default function CredentialsPage(): JSX.Element {
  const { credentialsMetaData, deleteCredential } = useCredStore((s) => s);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [overlayDisplay, setOverLay] = useState(false);
  const [currentCred, setCurrentCred] = useState<
    Pick<Credential, "id" | "platform" | "createdAt"> | null
  >(null);

  const handleDelete = async (
    cred: Pick<Credential, "id" | "platform" | "createdAt"> | null
  ) => {
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
    <div className="min-h-screen bg-[#050b11] text-[#e6eef6] flex flex-col">
      {/* Overlay editor (kept as-is) */}
      {overlayDisplay && (
        <CredentialsOverlayEditor
          currentCred={currentCred}
          onClose={() => setOverLay(false)}
        />
      )}

      {/* Full-width top navbar */}
      <Navbar />

      {/* Page content constrained to center */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#e6eef6]">
                Saved Credentials
              </h1>
              <p className="text-xs text-[#9aa3ad] mt-1">
                Manage API keys and integrations securely
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setCurrentCred(null);
                  setOverLay(true);
                }}
                className="flex bg-[#2563eb] hover:bg-[#1d4ed8] text-white items-center gap-2 h-9 px-3 rounded-full"
              >
                + Add Credential
              </Button>
            </div>
          </div>

          {/* Empty state */}
          {credentialsMetaData.length === 0 ? (
            <div className="rounded-2xl border border-[#1f2933] bg-[#0b1017] shadow-none p-8 text-center">
              <p className="text-sm text-[#9aa3ad] mb-4">
                No credentials found.
              </p>
              <Button
                onClick={() => {
                  setCurrentCred(null);
                  setOverLay(true);
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 px-4 rounded-full"
              >
                Add your first credential
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {credentialsMetaData.map((cred) => (
                <Card
                  key={cred.id ?? cred.platform}
                  className="border border-[#1f2933] bg-[#0b1017] hover:border-[#2563eb] hover:shadow-[0_0_0_1px_rgba(37,99,235,0.35)] transition-all"
                >
                  <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#e6eef6] capitalize truncate">
                        {cred.platform}
                      </p>
                      <p className="text-xs text-[#9aa3ad] tracking-wider mt-1">
                        ********
                      </p>
                      <p className="text-[11px] text-[#6b7280] mt-1">
                        Saved:{" "}
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setCurrentCred(cred);
                          setOverLay(true);
                        }}
                        aria-label={`Edit ${cred.platform}`}
                        className="h-8 px-3 text-xs rounded-full hover:bg-[#111827]"
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
                        className="h-8 px-3 text-xs rounded-full bg-red-600 hover:bg-red-700"
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
      </main>

      {/* Confirm delete modal (unchanged logic) */}
      {deleting && currentCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleting(false)}
          />

          <div className="relative z-10 w-full max-w-md">
            <div className="bg-[#0b1017] rounded-2xl shadow-xl border border-[#1f2933] p-6">
              <h3 className="text-base font-medium text-[#e6eef6] mb-2">
                Delete credential
              </h3>
              <p className="text-sm text-[#9aa3ad] mb-4">
                Are you sure you want to delete{" "}
                <strong className="capitalize">
                  {currentCred.platform}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleting(false)}
                  className="h-8 px-3 text-xs rounded-full border-[#1f2933] bg-transparent text-[#e6eef6] hover:bg-[#111827]"
                >
                  Cancel
                </Button>
                <Button
                  className="h-8 px-3 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(currentCred)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
