import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
function Dashboard(){
    const [user,setUser]=useState("");

    const navigate=useNavigate();
    const {showSuccess,showError}=useMessage();
    useEffect(()=>{
        const fetchUser=async()=>{
            const token=localStorage.getItem("token");
            const userId=localStorage.getItem("userId");
            if(!token||!userId){
                navigate("/login");
                return
            }
            try {
            const res=await api.get("/clientDashboard",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            if(res.data.success){
                setUser(res.data.user);
            } else{
                showError("User not Found");
            }
        } catch (error) {
            console.log("Fetching User Error",error);
            
        }
        }
        fetchUser();
    },[]);
    return(
        <>
        <h1> Welcome Back, {user.username}</h1>
        </>
    )
}

export default Dashboard;