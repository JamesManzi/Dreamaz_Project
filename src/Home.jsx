import { Link } from "react-router-dom";
import "./Home.css";
import Navbar from "./Navbar";
function Home(){
    return(
        <>
        <header>
            <div className="navbar">
                <Navbar/>
                <div className="home_btns">
                    <Link to="/register">
                    <button type="button" className="home-btn1">Register</button>
                    </Link>
                    <Link to="/login">
                    <button type="button" className="home-btn2">Login </button>
                    </Link>
                    </div>
            </div>
        </header>
        </>
    )
}

export default Home;