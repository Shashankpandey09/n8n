// panels.tsx
import { Button } from "./button";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useWebhook } from "@/store/Webhook";
import React from "react";
import { toast } from "sonner";
import { JSONNode } from "@/utils/JsonNode";

export const OutputPanel: React.FC<{ nodeId?: string }> = ({ nodeId }) => {
  const nodeMap = useWebhook((s) => s.NodePayload);
  const nodeEntry = useMemo(
    () => (nodeId ? nodeMap.get(nodeId) ?? null : null),
    [nodeMap, nodeId]
  );

  const inspectorOut = useWebhook((s) => s.outPayload);
  const outPayload = nodeEntry?.output ?? inspectorOut ?? null;

  const [rawView, setRawView] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["root"])
  );

  const rootJson = useMemo(() => outPayload ?? null, [outPayload]);

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const copyJson = useCallback(async (payload: any) => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(payload ?? {}, null, 2)
      );
      toast("Copied JSON to clipboard");
    } catch (err) {
      console.error("copy failed", err);
      toast.error("Failed to copy");
    }
  }, []);

  return (
    <aside className="p-4 border-l border-border h-full bg-surface w-[640px] max-w-full flex-shrink-0">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium">Output</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyJson(outPayload ?? {})}
            className="text-xs px-2 py-1 rounded-md border"
            title="Copy JSON"
          >
            Copy
          </button>
          <button
            onClick={() => setRawView((s) => !s)}
            className="text-xs px-2 py-1 rounded-md border"
            title="Toggle raw view"
          >
            {rawView ? "Tree" : "Raw"}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-input p-2 h-full overflow-auto bg-white">
        {rootJson ? (
          rawView ? (
            <div className="w-full overflow-x-auto">
              <pre className="whitespace-pre text-sm font-mono px-4 py-2 min-w-[900px]">
                {JSON.stringify(rootJson, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-sm">
              <div className="min-w-max overflow-x-auto px-2">
                <div className="min-h-[200px]">
                  <JSONNode
                    data={rootJson}
                    path="root"
                    expanded={expanded}
                    onToggle={toggle}
                  />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground">
            <p className="mb-2">Execute this node to view data</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export const LeftPanel = ({
  nodeDefinition,
  nodeId,
  connections
}: {
  nodeDefinition: any;
  nodeId: string;
  connections:{source:string,target:string}[]
}) => {
  const listening = useWebhook((s) => s.listening);
  const setListening = useWebhook((s) => s.setListening);
  const fetchNode = useWebhook((s) => s.fetchNode);
  const deleteTestData = useWebhook((s) => s.deleteTestData);
  const nodeMap = useWebhook((s) => s.NodePayload);
  const inspectorIn = useWebhook((s) => s.inputPayload);
  const propogateParentOutput=useWebhook((s)=>s.propagateAndMergeParents)
 
  const [busy, setBusy] = useState(false);
  const [rawView, setRawView] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["input"]));
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (listening && nodeDefinition?.type === "webhook") {
      // Poll every 4 seconds
      intervalId = setInterval(() => {
        fetchNode(nodeId, nodeDefinition.type).catch((err) => {
          console.error("poll fetchNode error:", err);
          toast.error("Failed to fetch latest webhook data");
        });
      }, 4000);

      // Stop after 60 seconds
      timeoutId = setTimeout(() => {
        toast.info("Stopped listening");
        if (intervalId) clearInterval(intervalId);
        setListening(listening); // toggle off
      }, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [listening, fetchNode, nodeId, nodeDefinition?.type, setListening]);
useEffect(()=>{
const fetch=async()=>{
  await fetchNode(nodeId,nodeDefinition.type)
  propogateParentOutput(connections,nodeId)
}
fetch()
},[])

  const nodeEntry = useMemo(
    () => (nodeId ? nodeMap.get(nodeId) ?? null : null),
    [nodeMap, nodeId]
  ); 
  console.log('node map----> ',nodeEntry)
  const inPayload = nodeEntry?.input ?? inspectorIn ?? null;
  console.log("input payload",inPayload)

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const copyJson = useCallback(async (payload: any) => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(payload ?? {}, null, 2)
      );
      toast("Copied input JSON to clipboard");
    } catch (err) {
      console.error("copy failed", err);
      toast.error("Failed to copy");
    }
  }, []);

  // Webhook listening with polling (keeps your exact logic)
 

  const handleListen = async () => {
    if (nodeDefinition?.type !== "webhook") {
      toast.error("Listening is only available for webhook nodes.");
      return;
    }

    if (busy) return;
    setBusy(true);
    try {
      await deleteTestData(nodeId);
      toast.success("Cleared previous test data");
      setListening(listening); // toggle
      if (!listening) toast("Listening for test event…");
      else toast("Stopped listening.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to clear previous test data";
      toast.error(msg);
      console.error("deleteTestData error:", err);
    } finally {
      setBusy(false);
    }
  };

  const asideClass =
    "p-4 border-r border-border h-full bg-surface w-[360px] max-w-full flex-shrink-0";

  // Webhook left panel (unchanged behavior)
  if (nodeDefinition?.type === "webhook") {
    return (
      <aside className={asideClass}>
        <h3 className="text-sm font-medium mb-3">Pull in events from Webhook</h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you've finished building your workflow, run it without clicking
            this button by using the production webhook URL.
          </p>

          <div className="pt-2">
            <Button
              onClick={handleListen}
              disabled={busy}
              variant={listening ? "secondary" : "destructive"}
              className={`w-full relative overflow-hidden transition-all ${
                listening ? "animate-pulse" : ""
              }`}
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </div>
              ) : listening ? (
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

  // Non-webhook: show INPUT nicely (tree or raw, with copy)
  return (
    <aside className={asideClass}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium">Input</h3>
        {inPayload && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyJson(inPayload)}
              className="text-xs px-2 py-1 rounded-md border"
              title="Copy input JSON"
            >
              Copy
            </button>
            <button
              onClick={() => setRawView((s) => !s)}
              className="text-xs px-2 py-1 rounded-md border"
              title="Toggle raw view"
            >
              {rawView ? "Tree" : "Raw"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        {inPayload ? (
          rawView ? (
            <div className="w-full overflow-x-auto">
              <pre className="whitespace-pre text-sm font-mono px-2 py-2 min-w-[480px] bg-white rounded border">
                {JSON.stringify(inPayload, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="min-w-max overflow-x-auto">
              <JSONNode
                data={inPayload}
                path="input"
                expanded={expanded}
                onToggle={toggle}
              />
            </div>
          )
        ) : (
          <p>
            This node uses inputs from previous nodes. Connect an upstream node
            or provide mock data to test.
          </p>
        )}
      </div>
    </aside>
  );
};