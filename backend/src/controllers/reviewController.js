const ReviewModel = require("../models/ReviewModel");
const OrderModel = require("../models/OrderModel");

exports.getAllReviews = (req, res) => {
  ReviewModel.getAllWithDetails()
    .then((rows) => res.json(rows || []))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the tai danh sach review" });
    });
};

exports.getReviewsByFood = (req, res) => {
  ReviewModel.findByFoodIdWithUsers(req.params.foodId)
    .then((rows) => res.json(rows || []))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the tai review cua mon an" });
    });
};

exports.getMyReviews = (req, res) => {
  ReviewModel.findByUserId(req.user.id)
    .then((rows) => res.json(rows || []))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the tai review cua ban" });
    });
};

exports.createMyReview = async (req, res) => {
  const { foodId, rating, comment } = req.body;
  const normalizedRating = Number(rating);

  if (!foodId) {
    return res.status(400).json({ message: "Thieu mon an" });
  }

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    return res.status(400).json({ message: "So sao phai tu 1 den 5" });
  }

  try {
    const hasPaidOrder = await OrderModel.hasPaidOrderItem({ userId: req.user.id, foodId });
    if (!hasPaidOrder) {
      return res.status(403).json({ message: "Ban chi duoc review mon da thanh toan" });
    }

    const existing = await ReviewModel.findByUserAndFood({ user_id: req.user.id, food_id: foodId });
    if (existing) {
      return res.status(409).json({ message: "Ban da review mon nay roi" });
    }

    const review = await ReviewModel.create({
      user_id: req.user.id,
      food_id: foodId,
      rating: normalizedRating,
      comment: (comment || "").trim()
    });

    res.json({ message: "Them review thanh cong", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Khong the them review" });
  }
};

exports.updateMyReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const normalizedRating = Number(rating);

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    return res.status(400).json({ message: "So sao phai tu 1 den 5" });
  }

  try {
    const existing = await ReviewModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Khong tim thay review" });
    }

    if (String(existing.user_id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Khong co quyen sua review nay" });
    }

    const review = await ReviewModel.update({
      id,
      user_id: existing.user_id,
      food_id: existing.food_id,
      rating: normalizedRating,
      comment: (comment || "").trim()
    });

    res.json({ message: "Cap nhat review thanh cong", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Khong the cap nhat review" });
  }
};

exports.deleteMyReview = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await ReviewModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Khong tim thay review" });
    }

    if (String(existing.user_id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Khong co quyen xoa review nay" });
    }

    await ReviewModel.remove(id);
    res.json({ message: "Xoa review thanh cong" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Khong the xoa review" });
  }
};

exports.deleteReviewByAdmin = async (req, res) => {
  try {
    const existing = await ReviewModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Khong tim thay review" });
    }

    await ReviewModel.remove(req.params.id);
    res.json({ message: "Admin da xoa review thanh cong" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Khong the xoa review" });
  }
};

exports.replyReviewByAdmin = async (req, res) => {
  const { id } = req.params;
  const { admin_reply } = req.body;

  try {
    const existing = await ReviewModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Khong tim thay review" });
    }

    const review = await ReviewModel.replyByAdmin({ id, admin_reply });
    res.json({
      message: String(admin_reply || "").trim() ? "Phan hoi review thanh cong" : "Da xoa phan hoi review",
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Khong the phan hoi review" });
  }
};
