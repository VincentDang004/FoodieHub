const OrderDetailModel = require("../models/OrderDetailModel");

exports.getAllOrderDetails = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  try {
    const rows = await OrderDetailModel.getAllWithDetails();
    res.json(rows || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai chi tiet don hang" });
  }
};
