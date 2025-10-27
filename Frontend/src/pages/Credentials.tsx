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
 

  const handleDelete = async (cred: Pick<Credential, "id" | "platform" | "createdAt">) => {
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
      toast.success("successfully deleted")
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 relative px-6 py-10">
      {overlayDisplay && (
        <CredentialsOverlayEditor
          currentCred={currentCred}
          onClose={() => setOverLay(false)}
        />
      )}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Saved Credentials
        </h1>
       {deleting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[360px] rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <p className="text-lg font-medium text-slate-800 mb-4">
              Delete credential for <strong>{currentCred?.platform}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(currentCred)}
              >
                Yes
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleting(false)}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
        {credentialsMetaData.length === 0 ? (
          <p className="text-center text-slate-500">No credentials found.</p>
        ) : (
          <div className="space-y-4">
            {credentialsMetaData.map((cred) => (
              <Card
                key={cred.id ?? cred.platform}
                className="hover:shadow-md transition-shadow duration-200 border border-slate-200"
              >
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <p className="text-lg font-medium text-slate-800 capitalize">
                      {cred.platform}
                    </p>
                    <p className="text-sm text-slate-500 tracking-wider">********</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-200"
                      onClick={() => {
                        setOverLay(true);
                        setCurrentCred(cred);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-500 border-blue-200 hover:text-red-700 hover:bg-white "
                      onClick={() => setDeleting(true)}
                      
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
    </div>
  );
}
