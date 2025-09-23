import axios from "axios";
export async function sendTelegram(WebhookUrl: string, message: string) {
    let success=false
  try {
    const res = await axios.post(
     `${WebhookUrl}`,
      {
        content: message,
      }
    );
    if(res.status==204){
        console.log('DISCORD executed')
        return success=true
    }    
  } catch (error) {
    console.log('telegram node error')
    throw error
  }
}
