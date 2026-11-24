
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./Home";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import Setting from "./Setting";
import CreateUsers from "./CreateUsers";
import ManageUsers from "./ManageUsers";
import GalleryDetails from "./GalleryDetails";
import Register from "./Register";
import Fashion from "./Fashion";
import Accessories from "./Accessories";
import Prints from "./Prints";
import Collections from "./Collections";
import About from "./About";
import CreateProduct from "./CreateProduct";
import ManageProducts from "./ManageProducts";
import ProductDetails from "./ProductDetails";
import Dashboard from "./Dashboard";
import FashionAnimation from "./FashionAnimation";
import CreateTrending from "./CreateTrending";
import FashionDetails from "./FashionDetails";
import PrintsDetails from "./PrintsDetails";
import Hero from "./Hero";
import TrendingDetails from "./TrendingDetails";
import Cart from "./Cart";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import MyOrders from "./MyOrders";
import BuyerProfile from "./BuyerProfile";
import ManageOrders from "./ManageOrders";
import BuyerOrders from "./BuyerOrders";
import ManageTrendings from "./ManageTrendings";
import Privacy from "./Privacy";

function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

console.log("Google Client ID loaded:", Boolean(googleClientId));
    if (!googleClientId) {
        console.error("VITE_GOOGLE_CLIENT_ID is missing from frontend .env");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId || ""}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />

                    {/* Authentication */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Admin */}
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="/create-users" element={<CreateUsers />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/create-product" element={<CreateProduct />} />
                    <Route path="/manage-products" element={<ManageProducts />} />
                    <Route path="/createTrending" element={<CreateTrending />} />
                    <Route path="/manage-trendings" element={<ManageTrendings />} />
                    <Route path="/manageOrders" element={<ManageOrders />} />

                    {/* Buyer */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/buyerProfile" element={<BuyerProfile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/myOrders" element={<MyOrders />} />
                    <Route path="/orders" element={<BuyerOrders />} />

                    {/* Products and collections */}
                    <Route path="/gallery/:id" element={<GalleryDetails />} />
                    <Route path="/fashion" element={<Fashion />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/prints" element={<Prints />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/productDetails" element={<ProductDetails />} />
                    <Route path="/fashionAnimation" element={<FashionAnimation />} />
                    <Route path="/fashion/:id" element={<FashionDetails />} />
                    <Route path="/prints/:id" element={<PrintsDetails />} />
                    <Route path="/hero" element={<Hero />} />
                    <Route path="/trending/:id" element={<TrendingDetails />} />
                    <Route path="/privacy" element={<Privacy/>}/>
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
