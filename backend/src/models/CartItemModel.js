const { models } = require("../orm");

const { CartItem, Food } = models;

async function ensureSchema() {
  await CartItem.sync();
}

async function getAll() {
  return CartItem.findAll({ order: [["id", "DESC"]], raw: true });
}

async function findByCartId(cartId) {
  return CartItem.findAll({ where: { cart_id: cartId }, order: [["id", "ASC"]], raw: true });
}

async function create({ cart_id, food_id, quantity }) {
  const created = await CartItem.create({ cart_id, food_id, quantity });

  try {
    const row = await CartItem.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, cart_id, food_id, quantity }) {
  await CartItem.update({ cart_id, food_id, quantity }, { where: { id } });

  try {
    const row = await CartItem.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await CartItem.destroy({ where: { id } });
}

async function findByCartAndFood({ cart_id, food_id }) {
  const row = await CartItem.findOne({ where: { cart_id, food_id }, raw: true });
  return row || null;
}

async function findWithFoodById(id) {
  const row = await CartItem.findByPk(id, {
    include: [{ model: Food, attributes: ["id", "name", "price", "image"], required: false }]
  });

  return row ? row.get({ plain: true }) : null;
}

module.exports = {
  ensureSchema,
  getAll,
  findByCartId,
  findByCartAndFood,
  findWithFoodById,
  create,
  update,
  remove
};
