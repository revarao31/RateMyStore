const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
    const { name, email, password, role, storeName, storeAddress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        // Insert user into the database
        const [userResult] = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );

        // If the user is a store owner, create a store
        if (role === "store_owner") {
            const ownerId = userResult.insertId;
            await pool.query(
                "INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)",
                [storeName, storeAddress, ownerId]
            );
        }

        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ msg: "Invalid email or password." });
        }

        const user = users[0];

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid email or password." });
        }

        // ✅ Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, role: user.role });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
