import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./AdminDashboard.css"
import AdminNavbar from "./AdminNavbar";
import api from "./api";
import { useMessage } from "./ShowMessage";
function AdminDashboard() {
    const [user, setUser] = useState(""); 
    const [totalUsers,setTotalUsers]=useState(0);
    const [totalProducts,setTotalProducts]=useState(0);
    const [availableProducts,setAvailableProducts]=useState(0);
    const [soldProducts,setSoldProducts]=useState(0);
    const [reservedProducts,setReservdeProducts]=useState(0);
    const [totalCategories,setTotalCategories]=useState(0);
    const {showSuccess,showError}=useMessage();


    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId=localStorage.getItem("userId");
        if (!token||!userId) {
            navigate("/login"); 
            return;
        }

        api.get(`/admin-dashboard/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {
            if (res.data.success) {
                setUser(res.data.user);
                setTotalUsers(res.data.totalUsers);
                setTotalProducts(res.data.totalProducts);
                setAvailableProducts(res.data.availableProducts);
                setSoldProducts(res.data.soldProducts);
                setReservdeProducts(res.data.reservedProducts);
                setTotalCategories(res.data.totalCategories);
            } else {
                showError(res.data?.message);
            }
        })
        .catch((error) => {
            console.log("Admin Dashboard Error", error);
            showError(error.response?.data?.message || "Admin Dashboard Error");
        });

    }, [navigate]); 

    return (
        <>
            <div className="admin-dashboard">
                <AdminNavbar/>
                <main className="admin-main"> 
                    <div className="greeting"> 
                    <p className="greetings"> Welcome back, <span>{user.username}</span> </p> 
                    <p className="greeting-subtitle"> Here's what's happening with your dashboard today. </p>
                 </div> 
                 <div className="information">
                        <div className="information_card">
                            <p className="total-galleries">{totalProducts||0}</p>
                        <p>Total Products</p>
                        </div>
                        <div className="information_card">
                            <p className="total-users">{totalUsers||0}</p>
                            <p>Total Users</p>
                        </div>
                        <div className="information_card">
                            <p className="total-categories">{totalCategories||0}</p>
                            <p>Total Categories</p>
                        </div>
                        <div className="information_card">
                            <p className="available-products">
                                {availableProducts||0}
                            </p>
                            <p>Available Products</p>
                        </div>
                        <div className="information_card">
                            <p className="sold-products">
                                {soldProducts||0}
                            </p>
                            <p>Sold Products</p>
                        </div>
                        <div className="information_card">
                            <p className="reserved-products">
                                {reservedProducts||0}
                            </p>
                            <p>Reserved Products</p>
                        </div>
                        <div className="information_card">
                            <p className="total_carts">
                                
                            </p>
                        </div>
                    </div>
                 </main>
                 
            </div>
        </>
    );
}

export default AdminDashboard;