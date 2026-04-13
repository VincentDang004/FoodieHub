const r = require("express").Router();
const c = require("../controllers/addressController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/addresses/me", verify, c.getMyAddresses);
r.post("/addresses/me", verify, c.createMyAddress);
r.put("/addresses/:id", verify, c.updateMyAddress);
r.delete("/addresses/:id", verify, c.deleteMyAddress);
r.get("/addresses", verify, requireAdmin, c.getAllAddresses);
r.put("/addresses/admin/:id", verify, requireAdmin, c.updateAddressByAdmin);
r.delete("/addresses/admin/:id", verify, requireAdmin, c.deleteAddressByAdmin);

module.exports = r;
