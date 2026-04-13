const PaymentModel = require("../models/PaymentModel");

exports.getAllPayments = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  try {
    const rows = await PaymentModel.getAllWithOrders();
    res.json(rows || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai danh sach thanh toan" });
  }
};

exports.getPaymentsByOrder = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  try {
    const rows = await PaymentModel.findByOrderId(req.params.orderId);
    res.json(rows || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai thanh toan cua don hang" });
  }
};
