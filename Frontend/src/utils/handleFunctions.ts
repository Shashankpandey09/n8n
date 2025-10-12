import { toast } from "sonner";
import { Normalize_Conn, NormalizeForBackend } from "./NormalizeForBackend";
import axios from "axios";

 export const handleSave = async(nodes,edges,workflowId,workflowTitle) => {
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
      const Formated_NODE=NormalizeForBackend(nodes)
      const formatedConn=Normalize_Conn(edges)
      const Payload={
        nodes:Formated_NODE,connections:formatedConn
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
      console.log("workflow saved:", allWorkflows[workflowIndex]);
    } else {
      // if not found, optional: push new
      toast.error("Workflow not found to save");
    }
  };

 