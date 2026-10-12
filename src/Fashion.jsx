import Navbar from "./Navbar";
import { useState,useEffect } from "react";
import api from "./api";

function Fashion(){
    const [fashions,setFashions]=useState([]);
    const [message,setMessage]=useState("");
    const [messageType,setMessageType]=useState("");

    useEffect(()=>{
        const FetchFashion=async()=>{
        try {
            const res=await api.get("/getFashionProducts");
            if(res.data.success){
                setFashions(res.data.fashionProducts);
                setMessageType("success");
            } else{
                setMessage(res.data.message);
                setMessageType("error");
            }
        } catch (error) {
            console.log("Fetching content Error",error);
            setMessage(error.response?.data?.message||"Fetching Fashion Error");
            setMessageType("error")
        }
    }
    FetchFashion();
    },[])
    return(
        <>
        <div className="fashion-page">
                    <Navbar/>
        <div className="fashion-content">
            <div className="heading-content">
                <header>
                    {fashions.map((fashion)=>(
                        <div key={fashion._id}>
                            <p>{fashion.name}</p>
                        </div>
                    ))}
                </header>
            </div>
        </div>
        </div>
        </>
    )
}

export default Fashion;