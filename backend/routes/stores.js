const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken"); // ✅ Ensure jwt is required
const router = express.Router();


// Get all stores
router.get("/", async (req, res) => {
    try {
        const [stores] = await pool.query("SELECT * FROM stores");
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new store
router.post("/", async (req, res) => {
    const { name, address, owner_id } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)",
            [name, address, owner_id]
        );
        res.json({ id: result.insertId, name, address, owner_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    console.log("Received Authorization Header:", authHeader); // ✅ Debugging

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ No token provided!");
        return res.status(401).json({ msg: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        console.log("✅ Token Verified:", decoded); // ✅ Debugging
        next();
    } catch (err) {
        console.error("❌ Token Verification Failed:", err);
        res.status(401).json({ msg: "Invalid Token" });
    }
};



// Store owner can fetch their store
// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ msg: "Unauthorized. No token provided." });
//     }

//     const token = authHeader.split(" ")[1]; // Extract token from Bearer

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(401).json({ msg: "Invalid Token" });
//     }
// };

// Store owner can fetch their store
// router.get("/my", verifyToken, async (req, res) => {
//     if (req.user.role !== "store_owner") {
//         return res.status(403).json({ msg: "Access Denied. Only store owners can access this." });
//     }

//     try {
//         const [store] = await pool.query("SELECT * FROM stores WHERE owner_id = ?", [req.user.id]);

//         if (!store || store.length === 0) {
//             return res.status(404).json({ msg: "No store found for this owner." });
//         }

//         res.json(store[0]); // ✅ Return store object instead of array
//     } catch (err) {
//         console.error("Database Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });


router.get("/my", verifyToken, async (req, res) => {
    if (req.user.role !== "store_owner") {
        return res.status(403).json({ msg: "Access Denied. Only store owners can access this." });
    }

    try {
        const [store] = await pool.query(`
            SELECT s.*, COUNT(r.id) AS totalReviews 
            FROM stores s 
            LEFT JOIN ratings r ON s.id = r.store_id 
            WHERE s.owner_id = ?
            GROUP BY s.id`, [req.user.id]);

        if (!store || store.length === 0) {
            return res.status(404).json({ msg: "No store found for this owner." });
        }

        res.json(store[0]); // Return store object
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
