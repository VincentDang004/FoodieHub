const OrderModel = require("../models/OrderModel");
const VoucherModel = require("../models/VoucherModel");

const PAYMENT_WINDOW_MS = 30000;

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, voucherCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Khong co mon an de dat hang" });
  }

  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ message: "Vui long chon dia chi giao hang" });
  }

  try {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    let activeVoucher = null;

    if (voucherCode && String(voucherCode).trim()) {
      activeVoucher = await VoucherModel.findByCode(String(voucherCode).trim().toUpperCase());
      if (!activeVoucher) {
        return res.status(404).json({ message: "Ma giam gia khong hop le" });
      }
    }

    const discountPercent = Number(activeVoucher?.discount || 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(0, subtotal - discountAmount);

    const orderId = await OrderModel.createOrderWithItems({
      userId: req.user.id,
      items,
      subtotal,
      discountPercent,
      discountAmount,
      total,
      shippingAddress: shippingAddress.trim(),
      voucherCode: activeVoucher?.code || ""
    });

    const orders = await OrderModel.fetchOrders("WHERE o.id = ?", [orderId]);
    res.json(orders[0]);
  } catch (error) {
    console.error(error.cause || error);

    if (error && error.kind === "order_items_insert_failed") {
      return res.status(500).json({ message: "Khong the tao chi tiet don hang" });
    }

    res.status(500).json({ message: "Khong the tao don hang" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.fetchOrders("WHERE o.user_id = ?", [req.user.id]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai danh sach don hang" });
  }
};

exports.getMyOrderById = async (req, res) => {
  try {
    const orders = await OrderModel.fetchOrders("WHERE o.id = ? AND o.user_id = ?", [
      req.params.id,
      req.user.id
    ]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai don hang" });
  }
};

exports.startPayment = async (req, res) => {
  try {
    const orders = await OrderModel.fetchOrders("WHERE o.id = ? AND o.user_id = ?", [
      req.params.id,
      req.user.id
    ]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    const order = orders[0];
    console.log("startPayment request", {
      orderId: req.params.id,
      userId: req.user.id,
      status: order.status
    });

    if (order.status === "paid") {
      return res.status(400).json({ message: "Don hang da duoc thanh toan" });
    }

    if (order.status === "awaiting_approval") {
      return res.json(order);
    }

    const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MS);

    await OrderModel.startPayment({ orderId: req.params.id, userId: req.user.id, expiresAt });

    const refreshed = await OrderModel.fetchOrders("WHERE o.id = ? AND o.user_id = ?", [
      req.params.id,
      req.user.id
    ]);
    res.json(refreshed[0]);
  } catch (error) {
    if (error.message === "order_not_eligible_for_payment") {
      const refreshed = await OrderModel.fetchOrders("WHERE o.id = ? AND o.user_id = ?", [
        req.params.id,
        req.user.id
      ]);

      if (refreshed.length > 0 && refreshed[0].status === "awaiting_approval") {
        return res.json(refreshed[0]);
      }
    }

    console.error(error);
    res.status(500).json({ message: "Khong the bat dau thanh toan" });
  }
};

exports.expireOrder = async (req, res) => {
  try {
    await OrderModel.expireOrder({ orderId: req.params.id, userId: req.user.id });

    const refreshed = await OrderModel.fetchOrders("WHERE o.id = ? AND o.user_id = ?", [
      req.params.id,
      req.user.id
    ]);
    if (refreshed.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(refreshed[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat het han don hang" });
  }
};

exports.getPendingOrdersForAdmin = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  try {
    await OrderModel.expireOverdueAwaitingApproval();

    const orders = await OrderModel.fetchOrders("WHERE o.status = ?", ["awaiting_approval"]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai danh sach cho duyet" });
  }
};

exports.updateOrderStatusByAdmin = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  const { status } = req.body;
  if (!["paid", "payment_rejected"].includes(status)) {
    return res.status(400).json({ message: "Trang thai khong hop le" });
  }

  try {
    await OrderModel.updateOrderStatusByAdmin({ orderId: req.params.id, status });

    const orders = await OrderModel.fetchOrders("WHERE o.id = ?", [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat trang thai don hang" });
  }
};
