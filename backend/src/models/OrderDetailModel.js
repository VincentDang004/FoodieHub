const { models } = require("../orm");

const { OrderDetail, Order, Food } = models;

async function ensureSchema() {
  await OrderDetail.sync();
}

async function getAll() {
  return OrderDetail.findAll({ order: [["id", "DESC"]], raw: true });
}

async function findByOrderId(orderId) {
  return OrderDetail.findAll({ where: { order_id: orderId }, order: [["id", "ASC"]], raw: true });
}

async function create({ order_id, food_id, quantity }) {
  const created = await OrderDetail.create({ order_id, food_id, quantity });

  try {
    const row = await OrderDetail.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, order_id, food_id, quantity }) {
  await OrderDetail.update({ order_id, food_id, quantity }, { where: { id } });

  try {
    const row = await OrderDetail.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await OrderDetail.destroy({ where: { id } });
}

async function bulkCreateForOrder({ order_id, items, transaction }) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  await OrderDetail.bulkCreate(
    items.map((item) => ({
      order_id,
      food_id: item.foodId || null,
      quantity: item.quantity
    })),
    { transaction }
  );

  return findByOrderId(order_id);
}

async function getAllWithDetails() {
  const rows = await OrderDetail.findAll({
    include: [
      { model: Order, attributes: ["id", "user_id", "status", "total"], required: false },
      { model: Food, attributes: ["id", "name", "price", "image"], required: false }
    ],
    order: [["id", "DESC"]]
  });

  return rows.map((row) => row.get({ plain: true }));
}

module.exports = {
  ensureSchema,
  getAll,
  getAllWithDetails,
  findByOrderId,
  create,
  update,
  remove,
  bulkCreateForOrder
};
