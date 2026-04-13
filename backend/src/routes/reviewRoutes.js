const r = require("express").Router();
const c = require("../controllers/reviewController");
const { verify, requireAdmin } = require("../middleware/authMiddleware");

r.get("/reviews/food/:foodId", c.getReviewsByFood);
r.get("/reviews/me", verify, c.getMyReviews);
r.post("/reviews", verify, c.createMyReview);
r.put("/reviews/:id", verify, c.updateMyReview);
r.delete("/reviews/:id", verify, c.deleteMyReview);
r.get("/reviews", verify, requireAdmin, c.getAllReviews);
r.patch("/reviews/admin/:id/reply", verify, requireAdmin, c.replyReviewByAdmin);
r.delete("/reviews/admin/:id", verify, requireAdmin, c.deleteReviewByAdmin);

module.exports = r;
