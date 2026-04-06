const r = require("express").Router();
const c = require("../controllers/orderController");
const { verify } = require("../middleware/authMiddleware");

r.get("/", verify, c.getMyOrders);
r.post("/", verify, c.createOrder);
r.get("/admin/pending", verify, c.getPendingOrdersForAdmin);
r.get("/:id", verify, c.getMyOrderById);
r.post("/:id/start-payment", verify, c.startPayment);
r.post("/:id/expire", verify, c.expireOrder);
r.patch("/:id/status", verify, c.updateOrderStatusByAdmin);

module.exports = r;
