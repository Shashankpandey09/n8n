import axios from 'axios';
import  {create} from 'zustand'
type Webhook={
    success:boolean;
    WebhookUrl?:string;
    getWebhookUrl:(workflowId:number)=>Promise<void>
}
export const useWebhook=create<Webhook>((set)=>({
   WebhookUrl:null,
   success:false,
   getWebhookUrl:async(workflowId:number)=>{
    try {
    const res=await axios.get(`http://localhost:3000/api/v1/webhook/create/${workflowId}`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${localStorage.getItem('token')}`
        }
    })  
   
    console.log(res.data.webhook.path)
    set({success:true,WebhookUrl:res.data.webhook.path})
    } catch (error) {
    console.log(error)
    }
   }
}))