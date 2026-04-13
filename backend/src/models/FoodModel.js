const { Op } = require("sequelize");
const { sequelize, models } = require("../orm");

const { Food, Restaurant, Category } = models;

const foodIncludes = [
  { model: Category, attributes: ["id", "name"], required: false },
  { model: Restaurant, attributes: ["id", "name", "address"], required: false }
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferRestaurant(restaurants, food) {
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return null;
  }

  const foodName = normalizeText(food?.name);
  const rules = [
    { keywords: ["banh mi"], restaurantKeywords: ["banh mi"] },
    { keywords: ["com"], restaurantKeywords: ["com"] },
    { keywords: ["pho", "bun", "mi xao", "mi"], restaurantKeywords: ["viet", "nha hang"] }
  ];

  for (const rule of rules) {
    if (!rule.keywords.some((keyword) => foodName.includes(keyword))) {
      continue;
    }

    const matchedRestaurant = restaurants.find((restaurant) => {
      const restaurantName = normalizeText(restaurant.name);
      return rule.restaurantKeywords.some((keyword) => restaurantName.includes(keyword));
    });

    if (matchedRestaurant) {
      return matchedRestaurant;
    }
  }

  return restaurants[Number(food?.id || 0) % restaurants.length];
}

async function attachRestaurant(rows) {
  const restaurants = await Restaurant.findAll({
    attributes: ["id", "name", "address"],
    order: [["id", "ASC"]],
    raw: true
  });

  return rows.map((row) => {
    const plain = row.get({ plain: true });
    const fallbackRestaurant = plain.Restaurant || inferRestaurant(restaurants, plain);

    return {
      ...plain,
      category_id: plain.category_id || plain.Category?.id || null,
      Category: plain.Category || null,
      restaurant_id: plain.restaurant_id || fallbackRestaurant?.id || null,
      Restaurant: fallbackRestaurant || null
    };
  });
}

async function ensureSchema() {
  await Food.sync();
}

async function ensureRuntimeSchema() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("foods");
  const attributes = Food.getAttributes();

  if (!table.restaurant_id) {
    await queryInterface.addColumn("foods", "restaurant_id", {
      type: attributes.restaurant_id.type,
      allowNull: true
    });
  }

  if (!table.category_id) {
    await queryInterface.addColumn("foods", "category_id", {
      type: attributes.category_id.type,
      allowNull: true
    });
  }
}

async function getAll({ categoryId } = {}) {
  const where = {};

  if (categoryId) {
    where.category_id = categoryId;
  }

  const rows = await Food.findAll({
    where,
    include: foodIncludes,
    order: [["id", "DESC"]]
  });
  return attachRestaurant(rows);
}

async function searchByNameParts(parts) {
  const where = {
    [Op.or]: parts.map((part) => ({ name: { [Op.like]: `%${part}%` } }))
  };

  const rows = await Food.findAll({
    where,
    include: foodIncludes
  });
  return attachRestaurant(rows);
}

async function create({ name, price, image, category_id, restaurant_id }) {
  const created = await Food.create({
    name,
    price,
    image: image || "",
    category_id: category_id || null,
    restaurant_id: restaurant_id || null
  });

  try {
    const row = await Food.findByPk(created.id, {
      include: foodIncludes
    });
    return row ? row.get({ plain: true }) : null;
  } catch (error) {
    return null;
  }
}

async function update({ id, name, price, image, category_id, restaurant_id }) {
  await Food.update(
    { name, price, image: image || "", category_id: category_id || null, restaurant_id: restaurant_id || null },
    { where: { id } }
  );

  try {
    const row = await Food.findByPk(id, {
      include: foodIncludes
    });
    return row ? row.get({ plain: true }) : null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Food.destroy({ where: { id } });
}

module.exports = {
  ensureSchema,
  ensureRuntimeSchema,
  getAll,
  searchByNameParts,
  create,
  update,
  remove
};
