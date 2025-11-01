import axios from "axios";
import { create } from "zustand";

type Webhook = {
  success: boolean;
  WebhookUrl?: string | null;
  inputPayload:any
  outPayload: any;
  listening: boolean;
  getWebhookUrl: (workflowId: number) => Promise<void>;
  setListening: (listening: boolean) => void;
  fetchNode: (NodeId: string) => Promise<void>;
  clearPayloads:()=>void
};

export const useWebhook = create<Webhook>((set) => ({
  WebhookUrl: null,
  success: false,
  listening: false,
  outPayload: null,
  inputPayload:null,

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

      console.log(res.data.webhook.path);
      set({ success: true, WebhookUrl: res.data.webhook.path });
    } catch (error) {
      console.error("Error fetching webhook URL:", error);
    }
  },

 fetchNode: async (NodeId: string) => {
  if (!NodeId) return;

  // lightweight in-flight guard to avoid overlapping requests
  if ((window as any).__isFetchingNode) return;
  (window as any).__isFetchingNode = true;

  try {
    const token = localStorage.getItem("token");
    const url = `http://localhost:3000/api/v1/Nodes/get?nodeData=${encodeURIComponent(NodeId)}`;

    // Only include Authorization header if token exists
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await axios.get<{data:{ input: any; output: any; error?: string },message:string}>(url, {
      headers,
      // optional: set timeout if you want to ensure calls don't hang forever
      timeout: 5000,
    });

    const data = res?.data.data ?? { input: null, output: null };
    console.log(res.data)
    // helper to check for non-empty payload


    const listen = !data.input && !(data.output);

    set({
      inputPayload: data.input ?? null,
      outPayload: data.output ?? null,
      listening: listen,
    });
  } catch (error) {
    console.error("Error fetching node data:", error);
    // on error, clear payloads and stop listening
    set({ inputPayload: null, outPayload: null, listening: false });
  } finally {
    (window as any).__isFetchingNode = false;
  }
},
clearPayloads:()=>{
  set({inputPayload:null,outPayload:null})
},

  setListening: (listening: boolean) => {
    set({ listening: !listening });
  },
}));
