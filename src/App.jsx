import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./Home";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import Setting from "./Setting";
import CreateUsers from "./CreateUsers";
import ManageUsers from "./ManageUsers";
import Messages from "./Messages";
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
import CreateContent from "./CreateContent";
import ManageContents from "./ManageContents";
function App(){
  return(
    <>
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/setting" element={<Setting/>}/>
    <Route path="/create-users" element={<CreateUsers/>}/>
    <Route path="/manage-users" element={<ManageUsers/>}/>
    <Route path="/create-product" element={<CreateProduct/>}/>
    <Route path="/manage-products" element={<ManageProducts/>}/>
    <Route path="/messages" element={<Messages/>}/>
    <Route path="/gallery/:id" element={<GalleryDetails/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/fashion" element={<Fashion/>}/>
    <Route path="/accessories" element={<Accessories/>}/>
    <Route path="/prints" element={<Prints/>}/>
    <Route path="/collections" element={<Collections/>}/>
    <Route path="/about"  element={<About/>}/>
    <Route path="/productDetails" element={<ProductDetails/>}/>
    <Route path="/createContent" element={<CreateContent/>}/>
    <Route path="/manageContents" element={<ManageContents/>}/>
  </Routes>
  </BrowserRouter>
    </>
  )
}

export default App;