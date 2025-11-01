import { Button } from "./button";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useWebhook } from "@/store/Webhook";
import React from "react";
import { toast } from "sonner";
import { JSONNode } from "@/utils/JsonNode";

const mockData = {
  id: "node_01",
  status: "ok",
  result: {
    items: [
      { name: "Alice", score: 92 },
      { name: "Bob", score: 81 },
    ],
    summary: { passed: 1, failed: 1 },
  },
  timestamp: new Date().toISOString(),
};




export const OutputPanel: React.FC = () => {
  const outPayload = useWebhook((s) => s.outPayload);
  const [rawView, setRawView] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["root"]));

  const rootJson = useMemo(() => outPayload ?? null, [outPayload]);

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rootJson ?? {}, null, 2));
      toast("Copied JSON to clipboard")

    } catch (err) {
      console.error("copy failed", err);
    }
  }, [rootJson]);

  const setMock = useCallback(() => {
    useWebhook.setState({ outPayload: mockData, listening: true });
  }, []);

  return (
    // increased width here and prevents shrinking in flex containers
    <aside className="p-4 border-l border-border h-full bg-surface w-[640px] max-w-full flex-shrink-0">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium">Output</h3>

        <div className="flex items-center gap-2">
          <button onClick={copyJson} className="text-xs px-2 py-1 rounded-md border" title="Copy JSON">
            Copy
          </button>
          <button onClick={() => setRawView((s) => !s)} className="text-xs px-2 py-1 rounded-md border" title="Toggle raw view">
            {rawView ? "Tree" : "Raw"}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-input p-2 h-full overflow-auto bg-white">
        {rootJson ? (
          rawView ? (
            // Raw view: horizontal scroll wrapper + padded pre with min width
            <div className="w-full overflow-x-auto">
              <pre className="whitespace-pre text-sm font-mono px-4 py-2 min-w-[900px]">
                {JSON.stringify(rootJson, null, 2)}
              </pre>
            </div>
          ) : (
            // Tree view: allow wide content and horizontal scroll if needed
            <div className="text-sm">
              <div className="min-w-max overflow-x-auto px-2">
                <div className="min-h-[200px]">
                  <JSONNode data={rootJson} path="root" expanded={expanded} onToggle={toggle} />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground">
            <p className="mb-2">Execute this node to view data</p>
            <button onClick={setMock} className="text-sm text-primary underline cursor-pointer">
              set mock data
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};


export const LeftPanel = ({
  nodeDefinition,
  path,
  nodeId,
}: {
  nodeDefinition: any;
  path: string;
  nodeId: string;
}) => {
  const { listening, setListening, fetchNode } = useWebhook((s) => s);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (listening) {
      intervalId = setInterval(() => {
        fetchNode(nodeId);
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [listening, fetchNode, nodeId]);

  const handleListen = async () => {
 
    setListening(listening);
  };

  // fixed width and prevents shrinking
  const asideClass = "p-4 border-r border-border h-full bg-surface w-[360px] max-w-full flex-shrink-0";

  if (nodeDefinition?.type === "webhook") {
    return (
      <aside className={asideClass}>
        <h3 className="text-sm font-medium mb-3">Pull in events from Webhook</h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you've finished building your workflow, run it without having to click this button by using the production webhook URL.
          </p>

          <div className="pt-2">
            <Button
              onClick={handleListen}
              variant={listening ? "secondary" : "destructive"}
              className={`w-full relative overflow-hidden transition-all ${listening ? "animate-pulse" : ""}`}
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

  return (
    <aside className={asideClass}>
      <h3 className="text-sm font-medium mb-3">Input</h3>
      <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        This node uses inputs from previous nodes. Connect an upstream node or provide mock data to test.
      </div>
    </aside>
  );
};
