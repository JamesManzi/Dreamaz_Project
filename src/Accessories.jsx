import Navbar from "./Navbar";
import { useEffect,useState } from "react";
import api from "./api";
function Accessories(){
    const [accessories,setAccessories]=useState([]);
    const [message,setMessage]=useState("");
    const [messageType,setMessageType]=useState("");
    
    return(
        <>
        <Navbar/>

        </>
    )
}

export default Accessories;