import { useState, useEffect } from "react";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./FashionAnimation.css";

function FashionAnimation() {
    const [fashions, setFashions] = useState([]);
    const { showError } = useMessage();

    useEffect(() => {
        const FetchFashion = async () => {
            try {
                const res = await api.get("/fashionAnimation");

                if (res.data.success) {
                    setFashions(res.data.fashionProducts);
                } else {
                    showError(res.data.message);
                }

            } catch (error) {
                console.log("Fetching content Error", error);
                showError(
                    error.response?.data?.message ||
                    "Fetching Fashion Error"
                );
            }
        };

        FetchFashion();
    }, []);

    return (
        <>
            <h2>Welcome to Fashion Page</h2>

            {fashions.map((fashion) => (
                <div key={fashion._id}>
                    <div className="fashion-animations">

                        {fashion.files?.map((file, index) => (
                            <div key={index}>

                                {file.type==="image" && (
                                    <img
                                        src={file.url}
                                        alt={file.name || "Fashion"}
                                    />
                                )}

                                {file.type==="video" && (
                                    <video
                                        src={file.url}
                                        controls
                                    />
                                )}

                            </div>
                        ))}

                    </div>
                </div>
            ))}
        </>
    );
}

export default FashionAnimation;