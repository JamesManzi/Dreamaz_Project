import { useState, useEffect } from "react";
import api from "./api";
import { useNavigate,Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    FaCloudUploadAlt,
    FaTrash,
    
} from "react-icons/fa";

import "./CreateProduct.css";
import Spinner from "./Spinner";
import AdminNavbar from "./AdminNavbar";

function CreateProduct() {
    const [name, setName] = useState("");
    const [price,setPrice]=useState("");
    const [availability,setAvailability]=useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading,setLoading]=useState(false);

    const navigate = useNavigate();

    const Reset=()=>{
        try {
            setName("");
            setPrice("");
            setAvailability("");
            setCategory("");
            setDescription("");
            setFiles([]);
            setMessage("");
            setMessageType("");
        } catch (error) {
            console.log(error);
            setMessage(response.data.message);
            setMessageType("error");
        }
    }

    const handleFile = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);
    };

    const del = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("availability",availability);
        formData.append("price",price);

        files.forEach((file) => {
            formData.append("files", file);
        });
        setLoading(true)
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            // Pass formData directly and add headers if your backend requires auth
            const res = await api.post("/createProduct", formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setMessage(res.data.message);
                setMessageType("success");
                 setName("");
            setCategory("");
            setDescription("");
            setAvailability("");
            setPrice("");
            setFiles([]);
            } else {
                setMessage(res.data.message);
                setMessageType("error"); // Fixed: changed from messageType to setMessageType
            }
        } catch (error) {
            console.log(error);
            setMessage(error.response?.data?.message || "An error occurred");
            setMessageType("error");
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="dreamaz-dashboard">
                <AdminNavbar/>
            {/* MAIN CONTENT */}
            <main className="gallery-main">

                {/* PAGE INTRO */}
                <section className="gallery-intro">
                    <div>
                        <p className="eyebrow">
                            CREATE • CURATE • INSPIRE
                        </p>
                        <h1>Create Your Products</h1>
                        <p>
                            Showcase your artwork, photography and creative
                            work with a beautiful Dreamaz Ink gallery.
                        </p>
                    </div>
                </section>

                {/* FORM */}
                <form
                    className="gallery-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-left">

                        {/* BASIC INFORMATION */}
                        <section className="form-card">
                            <div className="card-heading">
                                <div>
                                    <h2>Product Information</h2>
                                    <p>
                                        Give your Item a name and tell
                                        visitors what it is about.
                                    </p>
                                </div>
                            </div>

                            <div className="form-group">
    <label htmlFor="name">
        Product Name
    </label>

    <input
        type="text"
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. African Portraits"
        required
    />
</div>

<div className="form-group">
    <label htmlFor="price">
        Price
    </label>

    <input
        type="number"
        id="price"
        name="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Enter Price"
        required
    />
</div>

<div className="form-group">
    <label htmlFor="category">
        Category
    </label>

    <select
        id="category"
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
    >
        <option value="">Select a category</option>
        <option value="Fashion">Fashion</option>
        <option value="Accessories">Accessories</option>
        <option value="Prints">Prints</option>
        <option value="Collections">Collections</option>
        <option value="About">About</option>
    </select>
</div>

<div className="form-group">
    <label htmlFor="availability">
        Availability
    </label>

    <select id="availability" name="availability" 
    onChange={(e)=>setAvailability(e.target.value)} value={availability}>
        <option value="">Select Availability state</option>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
        <option value="reserved">Reserved</option>
    </select>
</div>

<div className="form-group">
    <label htmlFor="description">
        Description
    </label>

    <textarea
        id="description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell the story behind this collection..."
        rows="6"
    />

    <small>
        A good description helps visitors understand your creative work.
    </small>
</div>
                        </section>

                        {/* MEDIA UPLOAD */}
                        <section className="form-card">
                            <div className="card-heading">
                                <div>
                                    <h2>Product Media</h2>
                                    <p>
                                        Upload the artwork, photos or videos
                                        you want to showcase.
                                    </p>
                                </div>
                                <span className="file-count">
                                    {files.length} files
                                </span>
                            </div>

                            {/* UPLOAD AREA */}
                            <label
                                htmlFor="files"
                                className="upload-area"
                            >
                                <div className="upload-icon">
                                    <FaCloudUploadAlt />
                                </div>
                                <h3>
                                    Drop your files here
                                </h3>
                                <p>
                                    or click to browse from your computer
                                </p>
                                <span>
                                    JPG, PNG, WEBP, MP4, MOV • Up to 30MB
                                    per file
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
                            <div className="preview-images">
                                {files.map((file,index)=>(
                                    <div key={index}>
                                        {file.type.startsWith("image/")&&(
                                            <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            />
                                        )}

                                        {file.type.startsWith("video/")&&(
                                            <video
                                            src={URL.createObjectURL(file)}
                                            controls
                                            />
                                        )}
                                        <button type="button" onClick={()=>del(index)}>
                                            Delete<FaTrash/>
                                            </button>
                                        </div>
                                ))}
                            </div>
                        </section>
                        <div className="create-gallery-btns">
                            <button type="submit" className="create-gallery-btn1"
                            disabled={loading}>
                                {loading?(
                                    <>
                                    <Spinner text="Creating...."></Spinner>
                                    </>
                                ):(
                                    "Publish"
                                )}
                            </button>
                            <button type="reset" className="create-gallery-btn2" onClick={Reset}>
                                Reset
                            </button>
                        </div>
                        
                    </div>
                </form>

                {message && (
                    <p className={messageType}>
                        {message}
                    </p>
                )}
            </main>
        </div>
    );
}

export default CreateProduct;