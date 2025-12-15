import { useState } from "react";
import { useCredStore, type Credential } from "@/store/CredStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CredentialsOverlayEditor from "@/components/workflow/CredentialsOverlayEditor";
import { toast } from "sonner";
import Navbar from "@/components/ui/Navbar";
import { Key, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-[#0B1121] text-slate-300 font-sans selection:bg-sky-500/30 relative overflow-x-hidden flex flex-col">
      

      <div className="fixed inset-0 pointer-events-none z-0">
     
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,#1e3a8a30,transparent_70%)]"></div>
      </div>

    
      {overlayDisplay && (
        <CredentialsOverlayEditor
          currentCred={currentCred}
          onClose={() => setOverLay(false)}
        />
      )}


      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 px-6 py-12 mx-auto max-w-7xl w-full">
          
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-8">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                  Credentials
                </h1>
                <p className="text-slate-400">
                  Manage your API keys and secure integrations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    setCurrentCred(null);
                    setOverLay(true);
                  }}
                  className="h-10 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_-5px_rgba(2,132,199,0.5)] flex items-center gap-2 group border border-sky-400/20"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  <span>Add Credential</span>
                </Button>
              </div>
            </div>


            {credentialsMetaData.length === 0 ? (
               <div className="relative rounded-2xl border border-dashed border-white/10 bg-[#1e293b]/10 p-12 text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                   <Key className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">No credentials saved</h3>
                <p className="mb-8 text-slate-500 max-w-sm mx-auto text-sm">
                  Add your first API key or token to authenticate your workflows.
                </p>
                <Button
                  onClick={() => {
                    setCurrentCred(null);
                    setOverLay(true);
                  }}
                  variant="outline"
                  className="mx-auto h-9 px-4 rounded-lg bg-transparent hover:bg-white/5 text-slate-300 border-white/10 hover:text-white transition-all text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Credential</span>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {credentialsMetaData.map((cred) => (
                  <Card
                    key={cred.id ?? cred.platform}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-[#1e293b]/20 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/30 hover:bg-[#1e293b]/40 hover:shadow-xl hover:shadow-sky-900/10"
                  >
                    <CardContent className="flex items-center justify-between gap-4 py-5 px-6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <p className="text-sm font-semibold text-white capitalize truncate group-hover:text-sky-100 transition-colors">
                            {cred.platform}
                            </p>
                        </div>
                        <p className="text-xs text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded inline-block">
                          ••••••••••••
                        </p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium">
                          Added {new Date(cred.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentCred(cred);
                            setOverLay(true);
                          }}
                          aria-label={`Edit ${cred.platform}`}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:bg-white/5 hover:text-sky-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentCred(cred);
                            setDeleting(true);
                          }}
                          aria-label={`Delete ${cred.platform}`}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </main>

        {/* Confirm delete modal */}
        {deleting && currentCred && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-[#0B1121]/80 backdrop-blur-sm transition-opacity"
              onClick={() => setDeleting(false)}
            />

            <div className="relative z-10 w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                      <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-white">
                        Revoke Credential?
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        Are you sure you want to delete <strong className="text-white capitalize">{currentCred.platform}</strong>? Any workflows using this key will stop working immediately.
                      </p>
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setDeleting(false)}
                  className="h-9 px-4 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 border border-red-500/20"
                  onClick={() => handleDelete(currentCred)}
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}