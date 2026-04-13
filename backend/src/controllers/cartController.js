const CartModel = require("../models/CartModel");
const CartItemModel = require("../models/CartItemModel");
const FoodModel = require("../models/FoodModel");

async function loadCart(userId) {
  return CartModel.getCartSnapshotByUserId(userId);
}

exports.getMyCart = async (req, res) => {
  try {
    const cart = await loadCart(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai gio hang" });
  }
};

exports.addItem = async (req, res) => {
  const foodId = Number(req.body.foodId);
  const quantity = Math.max(1, Number(req.body.quantity || 1));

  if (!foodId) {
    return res.status(400).json({ message: "Thieu mon an" });
  }

  try {
    const foods = await FoodModel.getAll();
    const food = foods.find((item) => Number(item.id) === foodId);

    if (!food) {
      return res.status(404).json({ message: "Khong tim thay mon an" });
    }

    const cart = await CartModel.ensureCart(req.user.id);
    const existing = await CartItemModel.findByCartAndFood({ cart_id: cart.id, food_id: foodId });

    if (existing) {
      await CartItemModel.update({
        id: existing.id,
        cart_id: existing.cart_id,
        food_id: existing.food_id,
        quantity: Number(existing.quantity || 0) + quantity
      });
    } else {
      await CartItemModel.create({ cart_id: cart.id, food_id: foodId, quantity });
    }

    const snapshot = await loadCart(req.user.id);
    res.json({ message: "Them vao gio thanh cong", cart: snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the them vao gio hang" });
  }
};

exports.updateItem = async (req, res) => {
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "So luong phai lon hon 0" });
  }

  try {
    const row = await CartItemModel.findWithFoodById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Khong tim thay mon trong gio" });
    }

    const cart = await CartModel.ensureCart(req.user.id);
    if (String(row.cart_id) !== String(cart.id)) {
      return res.status(403).json({ message: "Khong co quyen cap nhat gio hang nay" });
    }

    await CartItemModel.update({
      id: row.id,
      cart_id: row.cart_id,
      food_id: row.food_id,
      quantity
    });

    const snapshot = await loadCart(req.user.id);
    res.json({ message: "Cap nhat gio hang thanh cong", cart: snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat gio hang" });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const row = await CartItemModel.findWithFoodById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Khong tim thay mon trong gio" });
    }

    const cart = await CartModel.ensureCart(req.user.id);
    if (String(row.cart_id) !== String(cart.id)) {
      return res.status(403).json({ message: "Khong co quyen xoa mon nay" });
    }

    await CartItemModel.remove(req.params.id);
    const snapshot = await loadCart(req.user.id);
    res.json({ message: "Xoa mon thanh cong", cart: snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the xoa mon khoi gio hang" });
  }
};

exports.clearMyCart = async (req, res) => {
  try {
    await CartModel.clearByUserId(req.user.id);
    const snapshot = await loadCart(req.user.id);
    res.json({ message: "Da xoa toan bo gio hang", cart: snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the xoa gio hang" });
  }
};
