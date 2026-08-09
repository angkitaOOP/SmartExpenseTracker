const jwt = require("jsonwebtoken");

// Verifies the Bearer token sent from the frontend and attaches
// the logged-in user's Mongo _id to req.userId so controllers can
// scope every query to that user only.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please login again." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET || "mysecretkey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token. Please login again." });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
