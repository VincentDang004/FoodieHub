const r = require("express").Router();
const c = require("../controllers/foodController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/", c.getFoods);
r.post("/", verify, requireAdmin, c.createFood);
r.put("/:id", verify, requireAdmin, c.updateFood);
r.delete("/:id", verify, requireAdmin, c.deleteFood);

module.exports = r;
