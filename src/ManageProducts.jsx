import { useState, useEffect } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd,faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  FaCloudUploadAlt,
  FaTrash
} from "react-icons/fa";
import "./ManageProducts.css";
import AdminNavbar from "./AdminNavbar";
function ManageProducts() {
   const [products,setProducts]=useState([]);
   const [message,setMessage]=useState("");
   const [messageType,setMessageType]=useState("");
   const [totalProducts,setTotalProducts]=useState(0);
   const [soldProducts,setSoldProducts]=useState(0);
   const [reservedProducts,setReservedProducts]=useState(0);
   const [availableProducts,setAvailableProducts]=useState(0);
   const [showUpdateForm, setShowUpdateForm] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
 const [newFiles, setNewFiles] = useState([]);
 const [currentImages, setCurrentImages] = useState({});
   const navigate=useNavigate();

   const handleDelete=async(id)=>{
   const confirmDelete=window.confirm("Do you want to delete this product?");
   if(!confirmDelete){
    return;
   }
    if(!id){
        setMessage("Product not Found");
        setMessageType("error");
        return
    }
    const token=localStorage.getItem("token");
    if(!token){
        navigate("/login");
        return
    }
    try {
        const res=await api.delete(`/deleteProduct/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });

        if(res.data.success){
            setProducts(prevProducts=>
                prevProducts.filter(product=>product._id!==id)
            )
            setMessage(res.data.message);
            setMessageType("success");
        } else{
            setMessage(res.data.message);
            setMessageType("error");
        }
    } catch (error) {
        console.log("Deleting Product Error",error);
        setMessage(error.response?.data?.message || "Deleting Product Error");
        setMessageType("error");
    }
   }

   const handleNext = (productId, totalFiles) => {
    setCurrentImages((prev) => ({
        ...prev,
        [productId]: ((prev[productId] || 0) + 1) % totalFiles
    }));
};

const handlePrevious = (productId, totalFiles) => {
    setCurrentImages((prev) => ({
        ...prev,
        [productId]: ((prev[productId] || 0) - 1 + totalFiles) % totalFiles
    }));
};

   const handleUpdateFiles = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setNewFiles(uploadedFiles);
};

const deleteUpdateFile = (index) => {
    setNewFiles((prev) =>
        prev.filter((_, i) => i !== index)
    );
};

   const handleUpdate=async(product)=>{
    if(!product){
        setMessage("Product not Found");
        setMessageType("error");
    }
    const token=localStorage.getItem("token");
    if(!token){
        navigate("/login");
        return
    }
   
    setSelectedProduct(product);
    setShowUpdateForm(true);
   };

   const handleSaveUpdate = async (product) => {

    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login");
        return;
    }

    try {

        const res = await api.post(
            `/updateProduct/${product._id}`,
            {
                name: product.name,
                price: product.price,
                category: product.category,
                availability: product.availability,
                description: product.description
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.data.success) {

            setMessage(res.data.message);
            setMessageType("success");

            setProducts((prevProducts) =>
                prevProducts.map((item) =>
                    item._id === product._id
                        ? res.data.UpdatedProduct
                        : item
                )
            );

            setShowUpdateForm(false);
            setSelectedProduct(null);

        } else {
            setMessage(res.data.message);
            setMessageType("error");
        }

    } catch (error) {

        console.log("Updating Product Error", error);

        setMessage(
            error.response?.data?.message ||
            "Updating Product Error"
        );

        setMessageType("error");
    }
};

   useEffect(()=>{
    const FetchProducts=async()=>{
        const token=localStorage.getItem("token");
        if(!token){
            navigate("/login");
            return
        }
        try {
            const res=await api.get("/getProducts",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            if(res.data.success){
                setProducts(res.data.products);
                setTotalProducts(res.data.totalProducts);
                setSoldProducts(res.data.soldProducts);
                setAvailableProducts(res.data.availableProducts);
                setReservedProducts(res.data.reservedProducts);
                setMessageType("success");
            } else{
                setMessage(res.data.message);
                setMessageType("error");
            }
        } catch (error) {
            console.log("Fetching Product Error");
            setMessage("Fetching Products Error");
            setMessageType("error");
        }
    }
    FetchProducts();
   },[])

    return (
        <div className="manage-product-layout">
            <AdminNavbar/>
            <main className="product-information">
                <div className="manage-products-content">
                    <h2>Manage Products</h2>
                    <Link to="/create-product">
                    <button>
                        <FontAwesomeIcon icon={faAdd}/>
                        Add Product
                    </button>
                    </Link>
                    <p>Manage your artwork, collections and creative products.

                    </p>
                    <div className="manage-product-boxes">
                        <p>{totalProducts||0}</p>
                        <p>Total</p>
                    </div>
                    <div className="manage-product-boxes">
                        <p>{availableProducts||0}</p>
                        <p>Available</p>
                    </div>
                    <div className="manage-product-boxes">
                        <p>{soldProducts||0}</p>
                        <p>Sold</p>
                    </div>
                    <div className="manage-product-boxes">
                        <p>{reservedProducts||0}</p>
                        <p>Reserved</p>
                    </div>
                    <div className="search_container">
                        <select id="category" name="category">
                            <option value="">Choose Category</option>
                            <option value="fashion">Fashion</option>
                            <option value="accessories">Accessories</option>
                            <option value="prints">Prints</option>
                            <option value="collections">Collections</option>
                        </select>

                        <select id="availability" name="availability">
                            <option value="">Select Availability</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="reserved">Reserved</option>
                        </select>

                        <input type="search" id="search" name="search"
                        placeholder="Search Products....."/>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                    </div>
                </div>
                <div className="display_products">
    {products.length > 0 && (
        <div className="product-info">

            {products.map((product) => (
                <div key={product._id}>

                    {/* Product files */}
                    <div className="products-files">
                        {product.files.map((file, index) => (
                            <div key={index}>

                                {file.type === "image" && (
                                    <img
                                        src={file.url}
                                        alt={product.name}
                                    />
                                )}

                                {file.type === "video" && (
                                    <video
                                        src={file.url}
                                        controls
                                    />
                                )}

                            </div>
                        ))}
                    </div>

                    {/* Product information */}
                    <div className="product-details">
                        <p>{product.name}</p>

                        <p>{product.price}</p>

                        <p>{product.availability}</p>

                        <p>{product.description}</p>
                    </div>

                    {/* Buttons */}
                    <div className="create-products-btns">
                        <button type="button"
                        onClick={()=>handleUpdate(product)}>Update</button>
                        <button type="button"
                        onClick={()=>handleDelete(product._id)}>Delete</button>
                        
                    </div>
                </div>
            ))}

        </div>
    )}
</div>
{showUpdateForm && selectedProduct && (
    <div className="update-product-form">

        <h2>Update Product</h2>
        <label htmlFor="name">Name</label>
        <input
            type="text"
            value={selectedProduct.name}
            onChange={(e) =>
                setSelectedProduct({
                    ...selectedProduct,
                    name: e.target.value
                })
            }
            placeholder="Enter Name"
        />
        <label htmlFor="price">Price</label>
        <input
            type="number"
            value={selectedProduct.price}
            onChange={(e) =>
                setSelectedProduct({
                    ...selectedProduct,
                    price: e.target.value
                })
            }
            placeholder="Enter Price"
        />
        <label htmlFor="category">Category</label>
        <select
            value={selectedProduct.category}
            onChange={(e) =>
                setSelectedProduct({
                    ...selectedProduct,
                    category: e.target.value
                })
            }
            placeholder="Select Category"
        >
            <option value="Fashion">Fashion</option>
            <option value="Accessories">Accessories</option>
            <option value="Prints">Prints</option>
            <option value="Collections">Collections</option>
        </select>

        <label htmlFor="availability">Availability</label>
        <select
            value={selectedProduct.availability}
            onChange={(e) =>
                setSelectedProduct({
                    ...selectedProduct,
                    availability: e.target.value
                })
            }
            placeholder="Select Availability"
        >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
        </select>

        <label htmlFor="description">Description</label>
        <textarea
            value={selectedProduct.description}
            onChange={(e) =>
                setSelectedProduct({
                    ...selectedProduct,
                    description: e.target.value
                })
            }
            placeholder="Describe your Product"
        />

        <div className="update-productFiles">

    <div className="update-file-heading">
        <div>
            <h3>Product Media</h3>
            <p>Upload new artwork, photos or videos.</p>
        </div>

        <span>
            {newFiles.length} files
        </span>
    </div>

    <label
        htmlFor="updateFiles"
        className="update-upload-area"
    >
        <div className="update-upload-icon">
            <FaCloudUploadAlt />
        </div>

        <h3>Drop your files here</h3>

        <p>
            or click to browse from your computer
        </p>

        <span>
            JPG, PNG, WEBP, MP4, MOV • Up to 30MB per file
        </span>

        <input
            type="file"
            id="updateFiles"
            name="files"
            accept="image/*,video/*"
            multiple
            onChange={handleUpdateFiles}
        />
    </label>


    {/* EXISTING FILES */}

    {selectedProduct.files?.length > 0 && (
        <div className="existing-update-files">

            <h4>Current Files</h4>

            <div className="update-preview-images">

                {selectedProduct.files.map((file, index) => (

                    <div key={index}>

                        {file.type === "image" && (
                            <img
                                src={file.url}
                                alt={selectedProduct.name}
                            />
                        )}

                        {file.type === "video" && (
                            <video
                                src={file.url}
                                controls
                            />
                        )}

                    </div>

                ))}

            </div>

        </div>
    )}


    {/* NEW FILES */}

    {newFiles.length > 0 && (
        <div className="new-update-files">

            <h4>New Files</h4>

            <div className="update-preview-images">

                {newFiles.map((file, index) => (

                    <div key={index}>

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

                        <button
                            type="button"
                            onClick={() =>
                                deleteUpdateFile(index)
                            }
                        >
                            Delete <FaTrash />
                        </button>

                    </div>

                ))}

            </div>

        </div>
    )}

</div>
        <button onClick={() => handleSaveUpdate(selectedProduct)}>
            Save Changes
        </button>

        <button
            type="button"
            onClick={() => {
                setShowUpdateForm(false);
                setSelectedProduct(null);
                setNewFiles([])
            }}
        >
            Cancel
        </button>

    </div>
)}
      {message&&(
                        <p className={messageType}>
                            {message}
                        </p>
                    )}
                </main>
        </div>
    );
}

export default ManageProducts;