const { models } = require("../orm");

const { Category } = models;

async function getAll() {
  return Category.findAll({ order: [["id", "DESC"]], raw: true });
}

async function create({ name }) {
  try {
    const created = await Category.create({ name });
    const row = await Category.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, name }) {
  try {
    await Category.update({ name }, { where: { id } });
    const row = await Category.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Category.destroy({ where: { id } });
}

module.exports = {
  getAll,
  create,
  update,
  remove
};
