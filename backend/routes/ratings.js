const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get all ratings
router.get("/", async (req, res) => {
    try {
        const [ratings] = await pool.query(`
            SELECT r.id, u.name AS user_name, s.name AS store_name, r.rating 
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            JOIN stores s ON r.store_id = s.id
        `);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update a rating
router.post("/", async (req, res) => {
    const { user_id, store_id, rating } = req.body;
    try {
        // Check if the user has already rated the store
        const [existing] = await pool.query(
            "SELECT * FROM ratings WHERE user_id = ? AND store_id = ?",
            [user_id, store_id]
        );

        if (existing.length > 0) {
            // Update the existing rating
            await pool.query(
                "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
                [rating, user_id, store_id]
            );
            res.json({ message: "Rating updated successfully!" });
        } else {
            // Insert a new rating
            await pool.query(
                "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
                [user_id, store_id, rating]
            );
            res.json({ message: "Rating submitted successfully!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid Token" });
    }
};

// Submit or Update Rating
router.get("/my", verifyToken, async (req, res) => {
    if (req.user.role !== "store_owner") {
        return res.status(403).json({ msg: "Access Denied. Only store owners can access this." });
    }

    try {
        const [reviews] = await pool.query(`
            SELECT r.id, r.rating, r.comment, r.timestamp, u.name AS username
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id IN (
                SELECT id FROM stores WHERE owner_id = ?
            )
            ORDER BY r.timestamp DESC
        `, [req.user.id]);

        res.json(reviews);
    } catch (err) {
        console.error("❌ Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
