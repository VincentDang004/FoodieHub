const express = require("express");
const multer = require("multer");
const path = require("path");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post("/", verify, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Chua chon file" });
  }

  res.json({ message: "Upload thanh cong", file: req.file.filename });
});

module.exports = router;
