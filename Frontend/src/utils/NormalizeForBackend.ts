
export const NormalizeForBackend=(FrontendNodes:any)=>{
    const finalPayLoad=[]
  
    FrontendNodes.forEach((n)=>{
        
        const action=Array.isArray(n?.data?.description)?n?.data?.description[0]:n?.data?.description
       const newNode={
        id:n.id,
        meta:{...n.position},
        Credential:[n.data?.type],
        type:n.data?.type,
        parameters:n.data?.parameters,
        action:action
       } 
       console.log(newNode)
 
       finalPayLoad.push(newNode)
    })
    return finalPayLoad
}

export const Normalize_Conn=(conn:any[])=>{
    const formatedConn=[];
    conn.forEach((C)=>{
        const newConn={
            to:C.target,
            from:C.source
        }
        formatedConn.push(newConn)
    })
    return formatedConn
}