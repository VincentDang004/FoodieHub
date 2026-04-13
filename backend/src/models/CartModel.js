const { models } = require("../orm");

const { Cart, CartItem, Food } = models;

async function ensureSchema() {
  await Cart.sync();
}

async function ensureCart(userId) {
  let cart = await Cart.findOne({ where: { user_id: userId }, raw: true });

  if (!cart) {
    const created = await Cart.create({ user_id: userId });
    cart = await Cart.findByPk(created.id, { raw: true });
  }

  return cart;
}

async function getAll() {
  return Cart.findAll({ order: [["id", "DESC"]], raw: true });
}

async function findByUserId(userId) {
  return Cart.findAll({ where: { user_id: userId }, order: [["id", "DESC"]], raw: true });
}

async function create({ user_id }) {
  const created = await Cart.create({ user_id });

  try {
    const row = await Cart.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, user_id }) {
  await Cart.update({ user_id }, { where: { id } });

  try {
    const row = await Cart.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Cart.destroy({ where: { id } });
}

async function getCartSnapshotByUserId(userId) {
  const cart = await ensureCart(userId);

  const itemRows = await CartItem.findAll({
    where: { cart_id: cart.id },
    include: [{ model: Food, attributes: ["id", "name", "price", "image"], required: false }],
    order: [["id", "ASC"]]
  });

  const items = itemRows.map((row) => {
    const plain = row.get({ plain: true });
    return {
      id: plain.id,
      cartId: plain.cart_id,
      foodId: plain.food_id,
      quantity: plain.quantity,
      name: plain.Food?.name || "",
      price: Number(plain.Food?.price || 0),
      image: plain.Food?.image || ""
    };
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.user_id,
    total,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    items
  };
}

async function clearByUserId(userId) {
  const cart = await ensureCart(userId);
  await CartItem.destroy({ where: { cart_id: cart.id } });
}

module.exports = {
  ensureSchema,
  ensureCart,
  getAll,
  findByUserId,
  create,
  update,
  remove,
  getCartSnapshotByUserId,
  clearByUserId
};
