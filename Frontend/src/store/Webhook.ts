import axios from "axios";
import { create } from "zustand";

type Webhook = {
  success: boolean;
  WebhookUrl?: string | null;
  payload: any;
  listening: boolean;
  getWebhookUrl: (workflowId: number) => Promise<void>;
  setListening: (listening: boolean) => void;
  fetchNode: (NodeId: string) => Promise<void>;
};

export const useWebhook = create<Webhook>((set) => ({
  WebhookUrl: null,
  success: false,
  listening: false,
  payload: null,

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
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/get?nodeData=${NodeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Node Data:", res.data);
      set({ payload: res.data });
    } catch (error) {
      console.error("Error fetching node data:", error);
      set({ payload: null });
    }
  },

  setListening: (listening: boolean) => {
    set({ listening: !listening });
  },
}));
