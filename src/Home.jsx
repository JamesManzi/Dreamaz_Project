
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import api from "./api";
import "./Home.css";
import Footer from "./Footer";
function Home() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/loadProducts");

                const allProducts = Array.isArray(res.data)
                    ? res.data
                    : res.data.products || [];

                setProducts(allProducts);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Unable to load artworks. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Get all available categories from products
    const categories = useMemo(() => {
        const allCategories = products
            .map(product => product.category)
            .filter(Boolean);

        return ["All", ...new Set(allCategories)];
    }, [products]);

    // Search and filter all products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const name = product.name || product.title || "";
            const description = product.description || "";
            const category = product.category || "";

            const matchesSearch =
                name.toLowerCase().includes(search.toLowerCase()) ||
                description.toLowerCase().includes(search.toLowerCase()) ||
                category.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                selectedCategory === "All" ||
                category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategory]);

    // Trending uses products from ALL categories
    const trendingProducts = products.slice(0, 8);

    const getImage = (product) => {
        if (product.image) return product.image;
        if (product.imageUrl) return product.imageUrl;
        if (product.files?.length) {
            return product.files[0].url || product.files[0];
        }
        return null;
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return "Price unavailable";
        return `${Number(price).toLocaleString()} RWF`;
    };

    const ProductCard = ({ product }) => (
        <div className="art-card">
            <Link to={`/products/${product._id}`} className="art-image-link">
                <div className="art-image">
                    {getImage(product) ? (
                        <img
                            src={getImage(product)}
                            alt={product.name || product.title || "Artwork"}
                        />
                    ) : (
                        <div className="no-art-image">Artwork</div>
                    )}
                </div>
            </Link>

            <div className="art-info">
                <span className="art-category">
                    {product.category || "Artwork"}
                </span>

                <h3>{product.name || product.title || "Untitled Artwork"}</h3>

                <p>
                    {product.description || "Discover this unique artwork."}
                </p>

                <div className="art-card-bottom">
                    <strong>{formatPrice(product.price)}</strong>
                    <Link to={`/products/${product._id}`}>
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <header className="home-header">
                <Navbar />

                <div className="home-login">
                    <Link to="/login" className="home-btn2">
                        Login
                    </Link>
                </div>
            </header>

            <main className="home-page">

                {/* Hero section */}
                <section className="home-hero">
                    <div className="hero-content">
                        <span className="hero-small-title">
                            WELCOME TO DREAMAZ INK
                        </span>

                        <h1>
                            Art That Tells
                            <span> A Story.</span>
                        </h1>

                        <p>
                            Discover unique artworks, creative designs and
                            beautiful pieces made to inspire your world.
                        </p>

                        <a href="#all-artworks" className="hero-button">
                            Explore Artworks
                        </a>
                    </div>
                </section>

                {/* Trending section */}
                <section className="home-section">
                    <div className="section-heading">
                        <div>
                            <span>DISCOVER SOMETHING SPECIAL</span>
                            <h2>Trending Artworks</h2>
                            <p>Explore popular creations across all categories.</p>
                        </div>

                        <a href="#all-artworks" className="view-all">
                            View All
                        </a>
                    </div>

                    {loading ? (
                        <p className="home-status">Loading trending artworks...</p>
                    ) : trendingProducts.length === 0 ? (
                        <p className="home-status">No artworks available yet.</p>
                    ) : (
                        <div className="art-grid">
                            {trendingProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Categories */}
                {!loading && categories.length > 1 && (
                    <section className="category-section">
                        <div className="section-heading">
                            <div>
                                <span>FIND YOUR STYLE</span>
                                <h2>Explore Categories</h2>
                            </div>
                        </div>

                        <div className="category-list">
                            {categories.filter(category => category !== "All").map(category => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        document.getElementById("all-artworks")
                                            ?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* All artworks */}
                <section className="home-section all-artworks" id="all-artworks">
                    <div className="section-heading">
                        <div>
                            <span>THE DREAMAZ COLLECTION</span>
                            <h2>Explore All Artworks</h2>
                            <p>Find the perfect artwork for your space and style.</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="art-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search artworks, categories or descriptions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Category filters */}
                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={
                                    selectedCategory === category ? "active" : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {error && <p className="home-status error">{error}</p>}

                    {loading ? (
                        <p className="home-status">Loading all artworks...</p>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-artworks">
                            <h3>No artworks found</h3>
                            <p>Try another search or category.</p>
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setSelectedCategory("All");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="results-count">
                                Showing {filteredProducts.length} artwork(s)
                            </p>

                            <div className="art-grid">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <Footer/>

            </main>
        </>
    );
}

export default Home;
