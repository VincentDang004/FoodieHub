const r = require("express").Router();
const c = require("../controllers/orderDetailController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/", verify, requireAdmin, c.getAllOrderDetails);

module.exports = r;
