const r = require("express").Router();
const c = require("../controllers/voucherController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/", c.getVouchers);
r.get("/validate", c.validateVoucher);
r.post("/", verify, requireAdmin, c.createVoucher);
r.put("/:id", verify, requireAdmin, c.updateVoucher);
r.delete("/:id", verify, requireAdmin, c.deleteVoucher);

module.exports = r;
