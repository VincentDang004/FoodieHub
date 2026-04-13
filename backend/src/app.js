const express = require("express");
const cors = require("cors");
const { sequelize } = require("./orm");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const addressRoutes = require("./routes/addressRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderDetailRoutes = require("./routes/orderDetailRoutes");
const initDb = require("./config/initDb");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("src/uploads"));
app.use("/images", express.static("src/uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api", restaurantRoutes);
app.use("/api", addressRoutes);
app.use("/api", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/order-details", orderDetailRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("Sequelize connected");
    return initDb();
  })
  .catch((error) => {
    console.error("Sequelize connection failed:", error);
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
