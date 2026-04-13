const { models } = require("../orm");

const { Review, User, Food } = models;
const reviewAttributes = ["id", "user_id", "food_id", "rating", "comment", "admin_reply", "admin_replied_at"];

const sampleComments = [
  "M\u00f3n \u0103n r\u1ea5t ngon, giao \u0111\u1ebfn v\u1eabn c\u00f2n n\u00f3ng.",
  "V\u1ecb v\u1eeba mi\u1ec7ng, ph\u1ea7n \u0103n \u0111\u1ea7y \u0111\u1eb7n.",
  "\u0110\u00f3ng g\u00f3i g\u1ecdn g\u00e0ng, ch\u1ea5t l\u01b0\u1ee3ng \u1ed5n \u0111\u1ecbnh.",
  "Gi\u00e1 h\u1ee3p l\u00fd so v\u1edbi kh\u1ea9u ph\u1ea7n v\u00e0 ch\u1ea5t l\u01b0\u1ee3ng.",
  "S\u1ebd \u0111\u1eb7t l\u1ea1i l\u1ea7n sau, gia \u0111\u00ecnh m\u00ecnh r\u1ea5t th\u00edch.",
  "N\u01b0\u1edbc s\u1ed1t \u0111\u1eadm \u0111\u00e0, m\u00f3n \u0103n nh\u00ecn r\u1ea5t b\u1eaft m\u1eaft.",
  "Kh\u1ea9u v\u1ecb kh\u00e1 \u1ed5n, giao h\u00e0ng nhanh.",
  "M\u00f3n n\u00e0y \u0103n bu\u1ed5i tr\u01b0a r\u1ea5t h\u1ee3p, kh\u00f4ng b\u1ecb ng\u1ea5y."
];

const normalizedCommentPairs = [
  [
    "Mon an rat ngon, giao den van con nong.",
    "M\u00f3n \u0103n r\u1ea5t ngon, giao \u0111\u1ebfn v\u1eabn c\u00f2n n\u00f3ng."
  ],
  [
    "Vi vua mieng, phan an day dan.",
    "V\u1ecb v\u1eeba mi\u1ec7ng, ph\u1ea7n \u0103n \u0111\u1ea7y \u0111\u1eb7n."
  ],
  [
    "Dong goi gon gang, chat luong on dinh.",
    "\u0110\u00f3ng g\u00f3i g\u1ecdn g\u00e0ng, ch\u1ea5t l\u01b0\u1ee3ng \u1ed5n \u0111\u1ecbnh."
  ],
  [
    "Gia hop ly so voi khau phan va chat luong.",
    "Gi\u00e1 h\u1ee3p l\u00fd so v\u1edbi kh\u1ea9u ph\u1ea7n v\u00e0 ch\u1ea5t l\u01b0\u1ee3ng."
  ],
  [
    "Se dat lai lan sau, gia dinh minh rat thich.",
    "S\u1ebd \u0111\u1eb7t l\u1ea1i l\u1ea7n sau, gia \u0111\u00ecnh m\u00ecnh r\u1ea5t th\u00edch."
  ],
  [
    "Nuoc sot dam da, mon an nhin rat bat mat.",
    "N\u01b0\u1edbc s\u1ed1t \u0111\u1eadm \u0111\u00e0, m\u00f3n \u0103n nh\u00ecn r\u1ea5t b\u1eaft m\u1eaft."
  ],
  [
    "Khau vi kha on, giao hang nhanh.",
    "Kh\u1ea9u v\u1ecb kh\u00e1 \u1ed5n, giao h\u00e0ng nhanh."
  ],
  [
    "Mon nay an buoi trua rat hop, khong bi ng\u00e1\u00c2\u00ba\u00c2\u00a5y.",
    "M\u00f3n n\u00e0y \u0103n bu\u1ed5i tr\u01b0a r\u1ea5t h\u1ee3p, kh\u00f4ng b\u1ecb ng\u1ea5y."
  ],
  [
    "Mon nay an buoi trua rat hop, khong bi ngay.",
    "M\u00f3n n\u00e0y \u0103n bu\u1ed5i tr\u01b0a r\u1ea5t h\u1ee3p, kh\u00f4ng b\u1ecb ng\u1ea5y."
  ],
  [
    "MĂ³n Äƒn ráº¥t ngon, giao Ä‘áº¿n váº«n cĂ²n nĂ³ng.",
    "M\u00f3n \u0103n r\u1ea5t ngon, giao \u0111\u1ebfn v\u1eabn c\u00f2n n\u00f3ng."
  ],
  [
    "Vá»‹ vá»«a miá»‡ng, pháº§n Äƒn Ä‘áº§y Ä‘áº·n.",
    "V\u1ecb v\u1eeba mi\u1ec7ng, ph\u1ea7n \u0103n \u0111\u1ea7y \u0111\u1eb7n."
  ],
  [
    "ÄĂ³ng gĂ³i gá»n gĂ ng, cháº¥t lÆ°á»£ng á»•n Ä‘á»‹nh.",
    "\u0110\u00f3ng g\u00f3i g\u1ecdn g\u00e0ng, ch\u1ea5t l\u01b0\u1ee3ng \u1ed5n \u0111\u1ecbnh."
  ],
  [
    "GiĂ¡ há»£p lĂ½ so vá»›i kháº©u pháº§n vĂ  cháº¥t lÆ°á»£ng.",
    "Gi\u00e1 h\u1ee3p l\u00fd so v\u1edbi kh\u1ea9u ph\u1ea7n v\u00e0 ch\u1ea5t l\u01b0\u1ee3ng."
  ],
  [
    "Sáº½ Ä‘áº·t láº¡i láº§n sau, gia Ä‘Ă¬nh mĂ¬nh ráº¥t thĂ­ch.",
    "S\u1ebd \u0111\u1eb7t l\u1ea1i l\u1ea7n sau, gia \u0111\u00ecnh m\u00ecnh r\u1ea5t th\u00edch."
  ],
  [
    "NÆ°á»›c sá»‘t Ä‘áº­m Ä‘Ă , mĂ³n Äƒn nhĂ¬n ráº¥t báº¯t máº¯t.",
    "N\u01b0\u1edbc s\u1ed1t \u0111\u1eadm \u0111\u00e0, m\u00f3n \u0103n nh\u00ecn r\u1ea5t b\u1eaft m\u1eaft."
  ],
  [
    "Kháº©u vá»‹ khĂ¡ á»•n, giao hĂ ng nhanh.",
    "Kh\u1ea9u v\u1ecb kh\u00e1 \u1ed5n, giao h\u00e0ng nhanh."
  ],
  [
    "MĂ³n nĂ y Äƒn buá»•i trÆ°a ráº¥t há»£p, khĂ´ng bá»‹ ngáº¥y.",
    "M\u00f3n n\u00e0y \u0103n bu\u1ed5i tr\u01b0a r\u1ea5t h\u1ee3p, kh\u00f4ng b\u1ecb ng\u1ea5y."
  ]
];

async function ensureSchema() {
  await Review.sync();
}

async function ensureRuntimeSchema() {
  const queryInterface = Review.sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("reviews");
  const attributes = Review.getAttributes();

  if (!table.admin_reply) {
    await queryInterface.addColumn("reviews", "admin_reply", {
      type: attributes.admin_reply.type,
      allowNull: true
    });
  }

  if (!table.admin_replied_at) {
    await queryInterface.addColumn("reviews", "admin_replied_at", {
      type: attributes.admin_replied_at.type,
      allowNull: true
    });
  }
}

async function normalizeSeededComments() {
  let updated = 0;

  for (const [legacyComment, normalizedComment] of normalizedCommentPairs) {
    const [affectedRows] = await Review.update(
      { comment: normalizedComment },
      { where: { comment: legacyComment } }
    );
    updated += Number(affectedRows || 0);
  }

  return updated;
}

async function getAll() {
  return Review.findAll({ attributes: reviewAttributes, order: [["id", "DESC"]], raw: true });
}

async function getAllWithDetails() {
  return Review.findAll({
    attributes: reviewAttributes,
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Food, attributes: ["id", "name"] }
    ],
    order: [["id", "DESC"]],
    raw: true,
    nest: true
  });
}

async function findByFoodId(foodId) {
  return Review.findAll({ where: { food_id: foodId }, attributes: reviewAttributes, order: [["id", "DESC"]], raw: true });
}

async function findById(id) {
  const row = await Review.findByPk(id, { attributes: reviewAttributes, raw: true });
  return row || null;
}

async function findByFoodIdWithUsers(foodId) {
  return Review.findAll({
    where: { food_id: foodId },
    attributes: reviewAttributes,
    include: [{ model: User, attributes: ["id", "name", "email"] }],
    order: [["id", "DESC"]],
    raw: true,
    nest: true
  });
}

async function findByUserId(userId) {
  return Review.findAll({ where: { user_id: userId }, attributes: reviewAttributes, order: [["id", "DESC"]], raw: true });
}

async function findByUserAndFood({ user_id, food_id }) {
  const row = await Review.findOne({ where: { user_id, food_id }, raw: true });
  return row || null;
}

async function seedDefaults() {
  const users = await User.findAll({
    attributes: ["id", "name"],
    order: [["id", "ASC"]],
    raw: true
  });
  const foods = await Food.findAll({
    attributes: ["id", "name"],
    order: [["id", "ASC"]],
    raw: true
  });

  if (!users.length || !foods.length) {
    return { created: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < foods.length; index += 1) {
    const food = foods[index];
    const exists = await Review.count({ where: { food_id: food.id } });

    if (exists > 0) {
      skipped += 1;
      continue;
    }

    const reviewsPerFood = Math.min(3, users.length);

    for (let offset = 0; offset < reviewsPerFood; offset += 1) {
      const user = users[(index + offset) % users.length];
      await Review.create({
        user_id: user.id,
        food_id: food.id,
        rating: 4 + ((index + offset) % 2),
        comment: sampleComments[(index + offset) % sampleComments.length]
      });
      created += 1;
    }
  }

  return { created, skipped };
}

async function create({ user_id, food_id, rating, comment }) {
  const created = await Review.create({ user_id, food_id, rating, comment: comment || "" });

  try {
    const row = await Review.findByPk(created.id, { attributes: reviewAttributes, raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, user_id, food_id, rating, comment }) {
  await Review.update(
    { user_id, food_id, rating, comment: comment || "" },
    { where: { id } }
  );

  try {
    const row = await Review.findByPk(id, { attributes: reviewAttributes, raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function replyByAdmin({ id, admin_reply }) {
  const normalizedReply = String(admin_reply || "").trim();

  await Review.update(
    {
      admin_reply: normalizedReply || null,
      admin_replied_at: normalizedReply ? new Date() : null
    },
    { where: { id } }
  );

  try {
    const row = await Review.findByPk(id, { attributes: reviewAttributes, raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Review.destroy({ where: { id } });
}

module.exports = {
  ensureSchema,
  ensureRuntimeSchema,
  normalizeSeededComments,
  getAll,
  getAllWithDetails,
  findByFoodId,
  findById,
  findByFoodIdWithUsers,
  findByUserId,
  findByUserAndFood,
  create,
  update,
  replyByAdmin,
  remove,
  seedDefaults
};
