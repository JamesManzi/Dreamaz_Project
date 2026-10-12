import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
function ProductDetails(){
    const [product,setProduct]=useState(null);
    const [message,setMessage]=useState("");
    const [messageType,setMesssageType]=useState("");

    const navigate=useNavigate();

    useEffect(()=>{
        const FetchingProduct=async(id)=>{
            if(!id){
                setMessage("Product Not Found");
                setMesssageType("error");
                return
            }
            const token=localStorage.getItem("token");
            if(!token){
                navigate("/login");
                return
            }
            try {
               const res=await api.get(`/getProduct/${id}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
               }) ;

               if(res.data.success){
                setProduct(res.data.product);
                setMesssageType("success");
               } else{
                setMessage(res.data.message);
                setMesssageType("error");
               }
            } catch (error) {
                console.log("Fetching Product Error",error);
                setMessage(error.response.data?.message);
                setMesssageType("error")
            }
        }
        FetchingProduct();
    },[navigate])
    return(
        <>
        <div className="productDetails-page">

        </div>
        </>
    )
}

export default ProductDetails;