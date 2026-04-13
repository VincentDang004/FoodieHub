const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    req.user = jwt.verify(token, "secret123");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token lỗi" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  if (req.user.role === "admin") {
    return next();
  }

  UserModel.findRoleById(req.user.id)
    .then((role) => {
      if (role !== "admin") {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

      req.user.role = "admin";
      next();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Không thể kiểm tra quyền admin" });
    });
};
