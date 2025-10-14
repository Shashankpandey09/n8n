
import axios from 'axios';
import {create} from 'zustand'
interface DataRow {  
success:Boolean
  platform?: string;
  data?:string,
   CreateCredentials:(name:string,credential:any)=>Promise<Boolean>
}
export const CredStore=create<DataRow>((set)=>({
  platform:null,
  data:null,
  success:false,
  CreateCredentials:async(name,credential)=>{
    try {
        const res=  await axios.post('http://localhost:3000/api/v1/credential/',{name,credential},{
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
    }
  })
  console.log(res.data)
  set({platform:res.data.message.platform,data:res.data.message.data,success:res.data.message.ok})
  return CredStore.getState().success
  }
     catch (error) {
     set({success:false})
     return CredStore.getState().success 
    }
  }
}))