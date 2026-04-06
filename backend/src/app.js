const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const initDb = require("./config/initDb");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("src/uploads"));
app.use("/images", express.static("src/uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api", restaurantRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

initDb();

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
