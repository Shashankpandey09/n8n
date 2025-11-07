import { connections, Node } from "./types";

export const getParentNode=(nodes:Node[],connections:connections[],nodeToExecute:string)=>{
//filtering out the connections 
const From_to=connections.find((c)=>c.to===nodeToExecute)
console.log(From_to)
const parent_node=nodes.find((n)=>n.id===From_to?.from)
console.log(parent_node)
return parent_node?.id;
}