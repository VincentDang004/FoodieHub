const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Chua dang nhap" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    req.user = jwt.verify(token, "secret123");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token loi" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Chua dang nhap" });
  }

  if (req.user.role === "admin") {
    return next();
  }

  db.query("SELECT role FROM users WHERE id = ? LIMIT 1", [req.user.id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Khong the kiem tra quyen admin" });
    }

    if (!rows || rows.length === 0 || rows[0].role !== "admin") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    req.user.role = "admin";
    next();
  });
};
