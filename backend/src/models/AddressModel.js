const { models } = require("../orm");

const { Address, User } = models;

const sampleAddresses = [
  "12 Nguyen Trai, Ben Thanh Ward, District 1, Ho Chi Minh City",
  "45 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City",
  "88 Phan Chu Trinh, Hai Chau Ward, Da Nang City",
  "120 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa",
  "25 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City",
  "9 Hung Vuong, Ninh Kieu Ward, Can Tho City",
  "210 Bach Dang, Hai Chau Ward, Da Nang City",
  "17 Nguyen Hue, Hue City, Thua Thien Hue"
];

async function ensureSchema() {
  await Address.sync();
}

async function getAll() {
  return Address.findAll({ order: [["id", "DESC"]], raw: true });
}

async function getAllWithUsers() {
  return Address.findAll({
    attributes: ["id", "user_id", "address"],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"]
      }
    ],
    order: [["id", "DESC"]],
    raw: true,
    nest: true
  });
}

async function findByUserId(userId) {
  return Address.findAll({ where: { user_id: userId }, order: [["id", "DESC"]], raw: true });
}

async function findById(id) {
  const row = await Address.findByPk(id, { raw: true });
  return row || null;
}

async function create({ user_id, address }) {
  const created = await Address.create({ user_id, address: address || "" });

  try {
    const row = await Address.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, user_id, address }) {
  await Address.update({ user_id, address: address || "" }, { where: { id } });

  try {
    const row = await Address.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Address.destroy({ where: { id } });
}

async function seedDefaults() {
  const users = await User.findAll({
    attributes: ["id"],
    order: [["id", "ASC"]],
    raw: true
  });

  if (!users.length) {
    return { created: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    const exists = await Address.count({ where: { user_id: user.id } });

    if (exists > 0) {
      skipped += 1;
      continue;
    }

    await Address.create({
      user_id: user.id,
      address: sampleAddresses[index % sampleAddresses.length]
    });
    created += 1;
  }

  return { created, skipped };
}

module.exports = {
  ensureSchema,
  getAll,
  getAllWithUsers,
  findById,
  findByUserId,
  create,
  update,
  remove,
  seedDefaults
};
