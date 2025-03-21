import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/adminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchUsers();
        fetchStores();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("❌ Error Fetching Users:", err);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/stores", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStores(res.data);
        } catch (err) {
            console.error("❌ Error Fetching Stores:", err);
        }
    };

    // ✅ Delete User
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("User deleted successfully!");
            fetchUsers();
        } catch (err) {
            alert("Error deleting user.");
        }
    };

    // ✅ Delete Store
    const deleteStore = async (storeId) => {
        if (!window.confirm("Are you sure you want to delete this store?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/stores/${storeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Store deleted successfully!");
            fetchStores();
        } catch (err) {
            alert("Error deleting store.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="admin-dashboard">
                <h2>👑 Admin Dashboard</h2>

                {/* ✅ Users Section */}
                <h3>📌 All Users</h3>
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => deleteUser(user.id)}>🗑 Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ✅ Stores Section */}
                <h3>🏪 All Stores</h3>
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>Owner</th>
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <td>{store.name}</td>
                                <td>{store.owner_name}</td>
                                <td>{store.address}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => deleteStore(store.id)}>🗑 Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
