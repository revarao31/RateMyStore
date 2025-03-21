import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "../styles/auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // ✅ Use navigate instead of window.location.href

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    
            console.log("✅ Login Success:", res.data); // Debugging
    
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
    
            alert("Login successful!");
    
            if (res.data.role === "admin") {
                console.log("🔹 Redirecting to Admin Dashboard...");
                window.location.href = "/admin-dashboard"; // ✅ Redirect admins
            } else {
                window.location.href = "/dashboard"; // ✅ Redirect users
            }
        } catch (err) {
            console.error("❌ Login Failed:", err);
            alert("Invalid email or password. Please try again.");
        }
    };
    
    

    return (
        <div className="auth-container">
            <h2>🔑 Login To Your Account</h2>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <p className="register-text">Don't have an account? <a href="/register">Register here</a></p>
            
        </div>
    );
}

export default Login;
