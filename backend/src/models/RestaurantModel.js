const { models } = require("../orm");

const { Restaurant } = models;

async function getAll() {
  return Restaurant.findAll({ order: [["id", "DESC"]], raw: true });
}

async function create({ name, address }) {
  const created = await Restaurant.create({ name, address: address || "" });

  try {
    const row = await Restaurant.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, name, address }) {
  try {
    await Restaurant.update({ name, address: address || "" }, { where: { id } });
    const row = await Restaurant.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Restaurant.destroy({ where: { id } });
}

module.exports = {
  getAll,
  create,
  update,
  remove
};
