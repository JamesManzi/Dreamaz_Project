import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import AdminNavbar from "./AdminNavbar";
import "./CreateTrending.css";
function CreateTrending(){
    const [name,setName]=useState("");
    const [category,setCategory]=useState("");
    const [price,setPrice]=useState("");
    const [description,setDescription]=useState("");
    const [files,setFiles]=useState([]);
    const {showSuccess,showError}=useMessage();
    const [loading,setLoading]=useState(false);


    const handleReset=()=>{
        setCategory("");
        setDescription("");
        setFiles([]);
        setName("");
        setPrice("");
    }

    const handleFile = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);
    e.target.value = "";
};

const del = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
};

    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!name||!category||!price){
            showError("All Fields Required");
            return
        }
        const formData=new FormData();
        formData.append("name",name);
        formData.append("category",category);
        formData.append("price",price);
        formData.append("description",description);

        files.forEach((file)=>{
            formData.append("files",file);
        })
        const token=localStorage.getItem("token");
        if(!token){
            navigate("/login");
            return
        }
        setLoading(true)
        try {
            const res=await api.post("/createTrending",formData,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            if(res.data.success){
                showSuccess("Item Created Successfully");
                setCategory("");
                setDescription("");
                setFiles([]);
                setName("");
                setPrice("");
            } else{
                showError(res.data.message);
            }
        } catch (error) {
            console.log("Creating Item Error",error);
            showError("Creating Item Error")
        } finally{
            setLoading(false);
        }
    }
    return(
        <>
        <div className="create-trendings">
            <AdminNavbar/>
            <div className="trending-form">
                <form onSubmit={handleSubmit}>
                    <h2>Create Trendings</h2>
                    <label htmlFor="name">Name</label><br/>
                    <input type="text" id="name" name="name" value={name}
                   onChange={(e)=>setName(e.target.value)} placeholder="Enter Name" required/><br/>
                    <label htmlFor="category">Category</label><br/>
                    <select id="category" name="category" value={category}
                    onChange={(e)=>setCategory(e.target.value)}>
                        <option value="">Select Category</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Prints">Prints</option>
                        <option value="Collections">Collections</option>
                    </select><br/>
                    <label htmlFor="price">Price</label><br/>
                    <input type="number" id="price" name="price" value={price}
                    onChange={(e)=>setPrice(e.target.value)} placeholder="Enter Price" required/><br/>
                    <label htmlFor="description">Description</label><br/>
                    <textarea id="description" name="description" value={description}
                    onChange={(e)=>setDescription(e.target.value)} placeholder="Enter Description"/><br/>
                    {/* MEDIA UPLOAD */}
<div className="form-card">

    <div className="card-heading">
        <div>
            <h2>Trending Media</h2>
            <p>Upload images or videos for your trending item.</p>
        </div>

        <span className="file-count">
            {files.length} files
        </span>
    </div>

    <label htmlFor="files" className="upload-area">

        <div className="upload-icon">
            <FaCloudUploadAlt />
        </div>

        <h3>Drop your files here</h3>

        <p>or click to browse from your computer</p>

        <span>
            JPG, PNG, WEBP, MP4, MOV • Up to 30MB per file
        </span>

        <input
            type="file"
            id="files"
            name="files"
            accept="image/*,video/*"
            multiple
            onChange={handleFile}
        />

    </label>

    {/* FILE PREVIEWS */}
    <div className="preview-images">

        {files.map((file, index) => (
            <div key={index} className="preview-item">

                {file.type.startsWith("image/") && (
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                    />
                )}

                {file.type.startsWith("video/") && (
                    <video
                        src={URL.createObjectURL(file)}
                        controls
                    />
                )}

                <p>{file.name}</p>

                <button
                    type="button"
                    onClick={() => del(index)}
                >
                    Delete <FaTrash />
                </button>

            </div>
        ))}

    </div>

</div>

                    <div className="trending-btns">
                        <button type="submit" disabled={loading}>
                            {loading?"Creating....":"Create"}
                        </button>
                        <button type="reset" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>
        </div>
        </>
    )
}

export default CreateTrending;