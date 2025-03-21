const express = require("express");
const pool = require("../config/db");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// ✅ Get all users (Admin Only)
router.get("/users", verifyToken, async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied. Admins only." });
    }
    try {
        const [users] = await pool.query("SELECT id, name, email, role FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete a user (Admin Only)
router.delete("/users/:id", verifyToken, async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied. Admins only." });
    }
    try {
        await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ msg: "User deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get all stores (Admin Only)
router.get("/stores", verifyToken, async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied. Admins only." });
    }
    try {
        const [stores] = await pool.query(`
            SELECT stores.id, stores.name, stores.address, users.name AS owner_name
            FROM stores
            JOIN users ON stores.owner_id = users.id
        `);
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete a store (Admin Only)
router.delete("/stores/:id", verifyToken, async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied. Admins only." });
    }
    try {
        await pool.query("DELETE FROM stores WHERE id = ?", [req.params.id]);
        res.json({ msg: "Store deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
