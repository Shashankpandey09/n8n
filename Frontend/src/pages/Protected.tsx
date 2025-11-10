import { useCredStore } from "@/store/CredStore";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const Protected = () => {
  //create a zustand store for token rn im fdoing with localstorage
  const get=useCredStore((s)=>s.getAllCredentialsMetaData)
  useEffect(()=>{
get()
  },[])
  const token=localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />; // renders nested routes (protected pages)
};

export default Protected;
