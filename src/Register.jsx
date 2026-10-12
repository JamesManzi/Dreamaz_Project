import {Link} from "react-router-dom";
import "./Register.css";
function Register(){
    return(
        <>
        <div className="register-page">
            <div className="register-text">
  <div className="welcome-text">
    <h2>Welcome To Dreamaz Ink</h2>

    <p>
      Discover a world of creativity with quality art materials made for
      artists, students, and creative minds. Create your account and enjoy
      a simple and inspiring shopping experience.
    </p>

    <ul className="register-features">
      <li>Explore a wide range of art materials</li>
      <li>Find quality products for your creative projects</li>
      <li>Save your favorite products for later</li>
      <li>Manage your orders easily</li>
      <li>Enjoy a simple and secure shopping experience</li>
    </ul>

    <p className="register-bottom-text">
      Create your account today and start bringing your ideas to life.
    </p>
  </div>
</div>
            <div className="register-container">
                <h2>Register</h2>
                <form>
                    <label htmlFor="username">Username</label><br/>
                    <input type="text" name="username" id="username"
                    placeholder="Enter Username" required/><br/>
                    <label htmlFor="email">Email</label><br/>
                    <input type="email" name="email" id="email"
                    placeholder="Enter Email" required/><br/>
                    <label htmlFor="password">Password</label><br/>
                    <input type="password" name="password" id="password"
                    placeholder="Enter Password" required/><br/>
                    <button type="submit" className="register-btn">Register</button>
                    <div className="register-text">
                        <p>Arleady Have Account?
                            <Link to="/login">Login</Link>
                        </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Register;