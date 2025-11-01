import { Button } from "./button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useWebhook } from "@/store/Webhook";
export const OutputPanel = () => {
  return (
    <aside className="p-4 border-l border-border min-h-[420px] bg-surface">
      <h3 className="text-sm font-medium mb-3">Output</h3>

      <div className="rounded-md border border-dashed border-input p-6 flex flex-col items-center justify-center h-[260px] text-center">
        <p className="text-sm">Execute this node to view data</p>
        <p className="text-sm text-primary mt-1 underline cursor-pointer">set mock data</p>
      </div>
    </aside>
  );
};


export const LeftPanel = ({
  nodeDefinition,
  path,
}: {
  nodeDefinition: any;
  path: string;
}) => {
//   const [listening, setListening] = useState(false);
  const {listening,setListening}=useWebhook((s)=>s)

  const handleListen = async () => {
    setListening(listening);
  };

  if (nodeDefinition?.type === "webhook") {
    return (
      <aside className="p-4 border-r border-border min-h-[420px] bg-surface">
        <h3 className="text-sm font-medium mb-3">
          Pull in events from Webhook
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you've finished building your workflow, run it without having
            to click this button by using the production webhook URL.
          </p>

          <div className="pt-2">
            <Button
              onClick={handleListen}
              
              variant={listening ? "secondary" : "destructive"}
              className={`w-full relative overflow-hidden transition-all ${
                listening ? "animate-pulse" : ""
              }`}
            >
              {listening ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Listening for test event...
                </div>
              ) : (
                "Listen for test event"
              )}
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // For other node types
  return (
    <aside className="p-4 border-r border-border min-h-[420px] bg-surface">
      <h3 className="text-sm font-medium mb-3">Input</h3>
      <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        This node uses inputs from previous nodes. Connect an upstream node or
        provide mock data to test.
      </div>
    </aside>
  );
};
