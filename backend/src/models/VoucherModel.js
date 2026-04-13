const { models } = require("../orm");

const { Voucher } = models;

const defaultVouchers = [
  { code: "GIAM10", discount: 10 },
  { code: "GIAM20", discount: 20 },
  { code: "FREESHIP5", discount: 5 }
];

async function ensureSchema() {
  await Voucher.sync();
}

async function getAll() {
  return Voucher.findAll({ order: [["id", "DESC"]], raw: true });
}

async function findByCode(code) {
  const row = await Voucher.findOne({ where: { code }, raw: true });
  return row || null;
}

async function create({ code, discount }) {
  const created = await Voucher.create({ code, discount });

  try {
    const row = await Voucher.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, code, discount }) {
  await Voucher.update({ code, discount }, { where: { id } });

  try {
    const row = await Voucher.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Voucher.destroy({ where: { id } });
}

async function seedDefaults() {
  let created = 0;
  let skipped = 0;

  for (const voucher of defaultVouchers) {
    const exists = await Voucher.findOne({ where: { code: voucher.code }, raw: true });
    if (exists) {
      skipped += 1;
      continue;
    }

    await Voucher.create(voucher);
    created += 1;
  }

  return { created, skipped };
}

module.exports = {
  ensureSchema,
  getAll,
  findByCode,
  create,
  update,
  remove,
  seedDefaults
};
