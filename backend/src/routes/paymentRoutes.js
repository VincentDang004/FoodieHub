const r = require("express").Router();
const c = require("../controllers/paymentController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/", verify, requireAdmin, c.getAllPayments);
r.get("/order/:orderId", verify, requireAdmin, c.getPaymentsByOrder);

module.exports = r;
