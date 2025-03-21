import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

function Dashboard() {
    const [stores, setStores] = useState([]);
    const [reviews, setReviews] = useState([]); // Store reviews
    const [selectedStore, setSelectedStore] = useState(null);
    const [rating, setRating] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!role) {
            alert("Unauthorized. Please log in again.");
            window.location.href = "/";
            return;
        }

        if (role === "user") {
            fetchStores();
        } else if (role === "store_owner") {
            fetchOwnerStores();
            fetchReviews(); // Fetch store reviews
        }
    }, []);

    // ✅ Fetch All Stores for Normal Users
    const fetchStores = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/stores");
            setStores(res.data);
        } catch (err) {
            console.error("❌ Error Fetching Stores:", err);
            alert("Failed to load stores. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Store for Store Owners
    const fetchOwnerStores = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Unauthorized. Please log in again.");
                window.location.href = "/";
                return;
            }

            console.log("🔍 Sending Token:", token);

            const res = await axios.get("http://localhost:5000/api/stores/my", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ Received Store Data:", res.data);

            if (!res.data || Object.keys(res.data).length === 0) {
                alert("No store found for this store owner.");
            } else {
                setStores([res.data]); // Convert single object to array
            }
        } catch (err) {
            console.error("❌ Error Fetching Store:", err);
            alert("Failed to fetch your store. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Store Reviews for Store Owners
    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/reviews/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data);
        } catch (err) {
            console.error("❌ Error Fetching Reviews:", err);
        }
    };


    // ✅ Submit Rating for Store
    const submitRating = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/ratings",
                { store_id: selectedStore, rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Rating submitted successfully!");
            setShowModal(false);
            fetchStores(); // Refresh store ratings
        } catch (err) {
            alert("Error submitting rating.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <h2>📊 {role === "admin" ? "Admin Dashboard" : role === "store_owner" ? "Store Owner Dashboard" : "User Dashboard"}</h2>

                {/* ✅ Show Loading Spinner While Fetching Data */}
                {loading ? (
                    <p>Loading stores...</p>
                ) : (
                    <>
                        {/* ✅ Normal User: See All Stores */}
                        {role === "user" && stores.length > 0 && (
                            <div>
                                <h3>🏪 All Stores</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Address</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stores.map((store) => (
                                            <tr key={store.id}>
                                                <td>{store.name}</td>
                                                <td>{store.address}</td>
                                                <td>
                                                    <button onClick={() => { setSelectedStore(store.id); setShowModal(true); }}>
                                                        Rate Store
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ✅ Store Owner: See Own Store */}
                        {role === "store_owner" && stores.length > 0 && (
                            <div className="store-owner-dashboard">
                                <h3>🏪 My Store Overview</h3>

                                {/* Store Details */}
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Address</th>
                                            <th>Total Reviews</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stores.map((store) => (
                                            <tr key={store.id}>
                                                <td>{store.name}</td>
                                                <td>{store.address}</td>
                                                <td>{store.totalReviews || 0} 📝</td> {/* Show total reviews */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Latest Reviews Section */}
                                <h3>📝 Customer Reviews</h3>
                                {reviews.length > 0 ? (
                                    <div className="reviews-container">
                                        {reviews.map((review, index) => (
                                            <div className="review-card" key={index}>
                                                <p><strong>{review.username}</strong> rated
                                                    <span className="star-rating">{"⭐".repeat(review.rating)}</span>
                                                </p>
                                                <p>"{review.comment}"</p>
                                                <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No reviews yet.</p>
                                )}

                            </div>
                        )}
                    </>
                )}

                {/* ✅ Rating Modal */}
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Rate Store</h3>
                            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                <option value="1">⭐</option>
                                <option value="2">⭐⭐</option>
                                <option value="3">⭐⭐⭐</option>
                                <option value="4">⭐⭐⭐⭐</option>
                                <option value="5">⭐⭐⭐⭐⭐</option>
                            </select>
                            <button onClick={submitRating}>Submit Rating</button>
                            <button className="close-modal" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
