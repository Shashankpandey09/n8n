import { toast } from "sonner";
import type { Credential } from "@/store/CredStore";
import { Normalize_Conn, NormalizeForBackend, orderNodes } from "./NormalizeForBackend";
import axios from "axios";

 export const handleSave = async(nodes,edges,workflowId,workflowTitle,savedCredentials:Pick<Credential, "createdAt" | "platform" | "id">[]) => {
    const allWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]");
    const workflowIndex = allWorkflows.findIndex(
      (w: any) => w.id === Number(workflowId)
    );
    console.log(workflowId)
    
    if (workflowIndex !== -1) {
      allWorkflows[workflowIndex] = {
        ...allWorkflows[workflowIndex],
        title: workflowTitle,
        nodes,
        connections: edges,
      };

      //normalize the workflow according to the backend and Post it to the backend
      const Formated_NODE=NormalizeForBackend(nodes,savedCredentials)
      const formatedConn=Normalize_Conn(edges)
      const orderedNodes=orderNodes(Formated_NODE,formatedConn)
      
      const Payload={
        nodes:orderedNodes,connections:formatedConn
      }
      const res=await axios.put(`http://localhost:3000/api/v1/workflow/update/${workflowId}`,{workflow:Payload},{
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${localStorage.getItem('token')}`
        }
      })
      if(!res.data.ok) {
        toast.error('workflow not saved due to wrong structure of nodes or connections')
        return
      }
      localStorage.setItem("workflows", JSON.stringify(allWorkflows));
      localStorage.setItem('validPayload',JSON.stringify(Payload))
      toast.success("Workflow saved");
    } else {
      // if not found, optional: push new
      toast.error("Workflow not found to save");
    }
  };

 