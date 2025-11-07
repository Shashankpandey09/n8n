import axios from 'axios'
export async function sendTelegram(WebhookUrl: string, message:  object) {
  try {
    if (!WebhookUrl) {
      console.warn("No webhook URL provided");
     return {
      success:false,
      status: 'FAILED',
     
    };
    }

    let body: any;
    if (typeof message === "string") {
      body = { content: message };
    } else if (typeof message === "object") {
      body = message;
    } else {
      body = { content: String(message) };
    }

    const res = await axios.post(WebhookUrl, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    if (res.status === 204 || (res.status >= 200 && res.status < 300)) {
      console.log("DISCORD webhook executed (status:", res.status, ")");
     
     return {
      success:true,
      status: 'SUCCESS',
      data: res.data ?? null,
     
    };
    }

    console.warn("Discord webhook returned non-success status:", res.status, res.data);
    
  } catch (error: any) {
    console.error("discord webhook error:", error?.message ?? error);
     return {
      success: false,
      error: error?.message ?? "unknown error",
      status:'FAILED'
    };
  }
}