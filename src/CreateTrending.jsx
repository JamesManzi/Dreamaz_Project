import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";

import AdminNavbar from "./AdminNavbar";

function CreateTrending(){
    const [name,setName]=useState("");
    const [category,setCategory]=useState("");
    const [price,setPrice]=useState("");
    const [description,setDescription]=useState("");
    const [files,setFiles]=useState([]);
    const {showSuccess,showError}=useMessage();
    return(
        <>
        <div className="create-trendings">
            <AdminNavbar/>
            <div className="trending-form">
                <form>
                    <h2>Create Trendings</h2>
                    <label htmlFor="name">Name</label><br/>
                    <input type="text" id="name" name="name" value={name}
                    placeholder="Enter Name" required/><br/>
                    <label htmlFor="category">Category</label><br/>
                    <select>
                        <option>Fashion</option>
                        <option>Accessories</option>
                        <option>Prints</option>
                        <option>Collections</option>
                    </select><br/>
                    <label htmlFor="price">Price</label><br/>
                    <input type="number" id="price" name="price" value={price}
                    placeholder="Enter Price" required/><br/>
                    <label htmlFor="description">Description</label><br/>
                    <textarea id="description" name="description"
                    placeholder="Enter Description"/><br/>
                    <input type="file"
                    accept="image/*,video/*"/>

                    <div className="trending-btns">
                        <button type="submit">Create</button>
                        <button type="reset">Reset</button>
                    </div>
                </form>
            </div>
        </div>
        </>
    )
}

export default CreateTrending;