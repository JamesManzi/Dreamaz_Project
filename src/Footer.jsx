import "./Footer.css";
function Footer() {
    return (
        <footer className="isonga-footer">

            <div className="isonga-footer-container">

                {/* BRAND */}
                <div className="isonga-footer-brand">
                    <h2>
                        Dreamaz<span>Ink</span>
                    </h2>

                    <p>
                       Discover Trending Products<br/>
                       All in One Market place
                    </p>
                </div>

                {/* QUICK LINKS */}
                <div className="isonga-footer-links">
                    <h3>Explore</h3>
                    <a href="/">Home</a>
                    <a href="/fashion">Fashion</a>
                    <a href="/products">Products</a>
                    <a href="/services">Services</a>
                </div>

                {/* MARKETPLACE */}
                <div className="isonga-footer-links">
                    <h3>Marketplace</h3>
                    <a href="/seller_login">Become a Seller</a>
                    <a href="/buyer_login">Buyer Account</a>
                    <a href="/seller_login">Start Selling</a>
                </div>

                {/* SUPPORT */}
                <div className="isonga-footer-links">
                    <h3>Information</h3>
                    <a href="/about">About Us</a>
                    <a href="/contact">Contact Us</a>
                    <a href="/privacy">Privacy Policy</a>
                </div>

            </div>

            <div className="isonga-footer-bottom">
                <p>
                    © {new Date().getFullYear()} Isonga Market.
                    All rights reserved.
                </p>

                <p>
                    Buy and Sell Everywhere, Fast and Secure.
                </p>
            </div>

        </footer>
    );
}

export default Footer;
