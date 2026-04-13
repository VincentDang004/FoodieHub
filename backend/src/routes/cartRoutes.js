const r = require("express").Router();
const c = require("../controllers/cartController");
const { verify } = require("../middleware/authMiddleware");

r.get("/me", verify, c.getMyCart);
r.post("/items", verify, c.addItem);
r.patch("/items/:id", verify, c.updateItem);
r.delete("/items/:id", verify, c.removeItem);
r.delete("/me/items", verify, c.clearMyCart);

module.exports = r;
