// Webhook.ts
import axios from "axios";
import { create } from "zustand";

type NodeIO = {
  input: Record<string, any> | null;
  output: Record<string, any> | null;
};
type Connection = { source: string; target: string };

type Webhook = {
  success: boolean;
  WebhookUrl?: string | null;
  inputPayload: any;
  outPayload: any;
  NodePayload: Map<string, NodeIO>;
  listening: boolean;
  polling: boolean;
  setPolling: (polling: boolean) => void;
  getWebhookUrl: (workflowId: number) => Promise<void>;
  setListening: (listening: boolean) => void;
  fetchNode: (NodeId: string, type: string) => Promise<void>;
  clearPayloads: (nodeID: string) => void;
  executeNode: (nodeId: string, workflowId: string) => Promise<void>;
  deleteTestData: (nodeId: string) => Promise<void>;
  propagateAndMergeParents: (connections: Connection[], childId: string) => void;
};

export const useWebhook = create<Webhook>((set) => ({
  WebhookUrl: null,
  success: false,
  listening: false,
  outPayload: null,
  inputPayload: null,
  NodePayload: new Map(),
  polling:false,

 setPolling: (polling: boolean) => {
    set({ polling });
  },
  getWebhookUrl: async (workflowId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/webhook/create/${workflowId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      set({ success: true, WebhookUrl: res.data.webhook.path });
    } catch (error) {
      console.error("Error fetching webhook URL:", error);
    }
  },

  fetchNode: async (NodeId: string, type: string) => {
    if (!NodeId) return;

  

    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:3000/api/v1/Nodes/get?nodeData=${encodeURIComponent(
        NodeId
      )}`;

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get<{
        data: {
          input: Record<string, any> | null;
          output: Record<string, any> | null;
          error?: string;
          status?:string
        };
        message: string;
      }>(url, {
        headers,
        timeout: 5000,
      });

      const data = res?.data.data ?? { input: null, output: null };

   

      const prevMap = useWebhook.getState().NodePayload ?? new Map<string, NodeIO>();
      const nextMap = new Map(prevMap);
   
      if (type === "webhook") {
        // treat webhook payload as output for this node
        const webhookOutput = data.output ?? data.input ?? null;
        
        
        // Keep listening if no data received yet
      
        const shouldKeepListening = !data.input && !data.output&& useWebhook.getState().listening;
        nextMap.set(NodeId, {
          input: data.input ?? null,
          output: webhookOutput,
        });
        set({
          NodePayload: nextMap,
          outPayload: webhookOutput,
          inputPayload: data.input ?? null,
          listening: shouldKeepListening,
        });
      } else {
        // non-webhook node -> whatever DB returned
        nextMap.set(NodeId, {
          input: data.input ?? null,
          output: data.output ?? null,
        });
        set({
          NodePayload: nextMap,
          inputPayload: data.input ?? null,
          outPayload: data.output ?? null,
         listening:data.status=='RUNNING' 
        });
      }
    } catch (error) {
      console.error("Error fetching node data:", error);
      set({ inputPayload: null, outPayload: null, listening: false });
    }
  },

  clearPayloads: (nodeID: string) => {
    const cur = useWebhook.getState().NodePayload;
    if (!cur.has(nodeID)) {
      set({ inputPayload: null, outPayload: null });
      return;
    }
    const next = new Map(cur);
    next.set(nodeID, { input: null, output: null });
    set({ NodePayload: next, inputPayload: null, outPayload: null });
  },

  // Toggle listening state
  setListening: (listening: boolean) => {
    set({ listening: !listening });
  },

  executeNode: async (nodeId, workflowId) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/Nodes/testNode`,
        { nodeId, workflowId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      set({success: true ,listening:true});
  
    } catch (error) {
      console.log("error during executing the node ");
      set({ success: false });
    }
  },

  deleteTestData: async (nodeId: string) => {
    if (!nodeId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/v1/Nodes/TestData?nodeID=${encodeURIComponent(
          nodeId
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      set({
        inputPayload: null,
        outPayload: null,
        success: true,
      });
    } catch (error) {
      console.error("Error deleting test data:", error);
      set({ success: false });
    }
  },

  propagateAndMergeParents: (
    connections: { source: string; target: string }[],
    childId: string
  ) => {
    
    if (!childId || !Array.isArray(connections)) return;

    const state = useWebhook.getState();
    const nodeMap = state.NodePayload;
   
    const parentIds = connections
      .filter((c) => c.target === childId )
      .map((c) => c.source);
    
    if (parentIds.length === 0) {
     
      return;
    }

    const outputs = parentIds
      .map((pid) => nodeMap.get(pid)?.output || null)
      .filter((o): o is Record<string, any> => o !== null);

    const merged:Record<string,any>|null = outputs.length ? Object.assign({}, ...outputs) : null;
   

    const next = new Map(nodeMap);
    const prevChild = nodeMap.get(childId);
    next.set(childId, { input: merged??prevChild.input, output: prevChild?.output ?? null });

    set({
      NodePayload: next,
      inputPayload: merged,
    });
  },
}));