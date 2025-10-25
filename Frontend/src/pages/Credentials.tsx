
import { useEffect, useState } from "react";
import { useCredStore } from "@/store/CredStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CredentialsOverlayEditor from "@/components/workflow/CredentialsOverlayEditor";
import type { Credential } from "@/store/CredStore";

export default function CredentialsPage(): JSX.Element {
  const { credentialsMetaData, getAllCredentialsMetaData } = useCredStore((s) => s);
  const [overlayDisplay,setOverLay]=useState(false)
  
  const [currentCred,setCurrentCred]=useState<Pick<Credential,"id"|'platform'|"createdAt"|null>>(null)

  useEffect(() => {
    getAllCredentialsMetaData();
  }, [getAllCredentialsMetaData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 relative px-6 py-10">
      {overlayDisplay&&<CredentialsOverlayEditor currentCred={currentCred} onClose={()=>setOverLay(!overlayDisplay)}/>}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Saved Credentials
        </h1>

        {credentialsMetaData.length === 0 ? (
          <p className="text-center text-slate-500">No credentials found.</p>
        ) : (
          <div className="space-y-4">
            {credentialsMetaData.map((cred) => (
              <Card
                key={cred.id}
                className="hover:shadow-md transition-shadow duration-200 border border-slate-200"
              >
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <p className="text-lg font-medium text-slate-800 capitalize">
                      {cred.platform}
                    </p>
                    <p className="text-sm text-slate-500 tracking-wider">
                      ********
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-200 hover:"
                    onClick={()=>{setOverLay(true)
                      setCurrentCred(cred)
                    }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
