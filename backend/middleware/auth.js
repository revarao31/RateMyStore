const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ msg: "Unauthorized. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded;
        console.log("✅ Token Verified:", req.user); // Debugging
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid Token" });
    }
};

module.exports = verifyToken;
