const r = require("express").Router();
const c = require("../controllers/restaurantController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/restaurants", c.getRestaurants);
r.post("/restaurants", verify, requireAdmin, c.createRestaurant);
r.put("/restaurants/:id", verify, requireAdmin, c.updateRestaurant);
r.delete("/restaurants/:id", verify, requireAdmin, c.deleteRestaurant);

r.get("/categories", c.getCategories);
r.post("/categories", verify, requireAdmin, c.createCategory);
r.put("/categories/:id", verify, requireAdmin, c.updateCategory);
r.delete("/categories/:id", verify, requireAdmin, c.deleteCategory);

module.exports = r;
