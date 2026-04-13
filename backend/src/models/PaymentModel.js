const { sequelize, models } = require("../orm");

const { Payment, Order, User } = models;

async function findCanonicalPayment(order_id) {
  const rows = await Payment.findAll({
    where: { order_id },
    order: [["id", "DESC"]]
  });

  if (!rows.length) {
    return null;
  }

  const canonical = rows[0];
  const duplicates = rows.slice(1);

  if (duplicates.length > 0) {
    await Payment.destroy({ where: { id: duplicates.map((row) => row.id) } });
  }

  return canonical;
}

async function ensureSchema() {
  await Payment.sync();
}

async function ensureRuntimeSchema() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("payments");
  const attributes = Payment.getAttributes();

  for (const column of ["status", "note", "requested_at", "reviewed_at"]) {
    if (!table[column]) {
      await queryInterface.addColumn("payments", column, {
        type: attributes[column].type,
        allowNull: true
      });
    }
  }
}

async function ensureUniqueOrderConstraint() {
  const queryInterface = sequelize.getQueryInterface();
  const indexes = await queryInterface.showIndex("payments");
  const hasUniqueOrderIndex = indexes.some((index) => {
    if (!index.unique) {
      return false;
    }

    const fieldNames = (index.fields || []).map((field) => field.attribute || field.name);
    return fieldNames.length === 1 && fieldNames[0] === "order_id";
  });

  if (!hasUniqueOrderIndex) {
    await queryInterface.addIndex("payments", ["order_id"], {
      name: "uniq_payments_order_id",
      unique: true
    });
  }
}

async function getAll() {
  return Payment.findAll({ order: [["id", "DESC"]], raw: true });
}

async function findByOrderId(orderId) {
  return Payment.findAll({ where: { order_id: orderId }, order: [["id", "DESC"]], raw: true });
}

async function getAllWithOrders() {
  const rows = await Payment.findAll({
    include: [
      {
        model: Order,
        attributes: ["id", "user_id", "total", "status", "shipping_address"],
        include: [{ model: User, attributes: ["id", "name", "email"], required: false }],
        required: false
      }
    ],
    order: [["id", "DESC"]]
  });

  return rows.map((row) => row.get({ plain: true }));
}

async function create({ order_id, method }) {
  const created = await Payment.create({ order_id, method: method || "", status: "created" });

  try {
    const row = await Payment.findByPk(created.id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function update({ id, order_id, method }) {
  await Payment.update({ order_id, method: method || "" }, { where: { id } });

  try {
    const row = await Payment.findByPk(id, { raw: true });
    return row || null;
  } catch (error) {
    return null;
  }
}

async function remove(id) {
  await Payment.destroy({ where: { id } });
}

async function createOrUpdateForOrder({ order_id, method }) {
  const existing = await findCanonicalPayment(order_id);

  if (existing) {
    await existing.update({
      method: method || "",
      status: "awaiting_approval",
      requested_at: new Date(),
      reviewed_at: null,
      note: null
    });
    return existing.get({ plain: true });
  }

  const created = await Payment.create({
    order_id,
    method: method || "",
    status: "awaiting_approval",
    requested_at: new Date(),
    reviewed_at: null,
    note: null
  });
  return created.get({ plain: true });
}

async function updateStatusByOrder({ order_id, status, note = null }) {
  const existing = await findCanonicalPayment(order_id);

  if (!existing) {
    const created = await Payment.create({
      order_id,
      method: "qr",
      status,
      note,
      requested_at: new Date(),
      reviewed_at: status === "awaiting_approval" ? null : new Date()
    });
    return created.get({ plain: true });
  }

  await existing.update({
    method: existing.method || "qr",
    status,
    note,
    reviewed_at: status === "awaiting_approval" ? null : new Date()
  });
  return existing.get({ plain: true });
}

function deriveLegacyPaymentStatus(orderStatus) {
  if (orderStatus === "paid") return "paid";
  if (orderStatus === "payment_rejected") return "payment_rejected";
  if (orderStatus === "payment_expired") return "payment_expired";
  if (orderStatus === "awaiting_approval") return "awaiting_approval";
  return "created";
}

function deriveLegacyPaymentNote(orderStatus) {
  if (orderStatus === "paid") return "Admin approved payment";
  if (orderStatus === "payment_rejected") return "Admin rejected payment";
  if (orderStatus === "payment_expired") return "Order expired automatically";
  if (orderStatus === "awaiting_approval") return "Waiting for admin approval";
  return "Recovered from legacy payment record";
}

async function normalizeLegacyPayments() {
  const rows = await Payment.findAll({
    include: [
      {
        model: Order,
        attributes: [
          "status",
          "created_at",
          "payment_requested_at",
          "approved_at",
          "rejected_at",
          "payment_expired_at"
        ],
        required: false
      }
    ],
    order: [["id", "ASC"]]
  });

  let updated = 0;

  for (const row of rows) {
    const plain = row.get({ plain: true });
    const nextStatus = plain.status || deriveLegacyPaymentStatus(plain.Order?.status);
    const nextRequestedAt = plain.requested_at || plain.Order?.payment_requested_at || plain.Order?.created_at || new Date();
    const nextReviewedAt =
      plain.reviewed_at ||
      plain.Order?.approved_at ||
      plain.Order?.rejected_at ||
      plain.Order?.payment_expired_at ||
      null;
    const nextMethod = plain.method || "qr";
    const nextNote = plain.note || deriveLegacyPaymentNote(plain.Order?.status);

    const needsUpdate =
      plain.status !== nextStatus ||
      plain.method !== nextMethod ||
      String(plain.note || "") !== String(nextNote || "") ||
      String(plain.requested_at || "") !== String(nextRequestedAt || "") ||
      String(plain.reviewed_at || "") !== String(nextReviewedAt || "");

    if (!needsUpdate) {
      continue;
    }

    await row.update({
      method: nextMethod,
      status: nextStatus,
      note: nextNote,
      requested_at: nextRequestedAt,
      reviewed_at: nextReviewedAt
    });
    updated += 1;
  }

  return updated;
}

async function cleanupDuplicatePayments() {
  const rows = await Payment.findAll({
    attributes: ["order_id"],
    group: ["order_id"],
    raw: true
  });

  let removed = 0;

  for (const row of rows) {
    const payments = await Payment.findAll({
      where: { order_id: row.order_id },
      order: [["id", "DESC"]]
    });

    if (payments.length > 1) {
      const duplicateIds = payments.slice(1).map((payment) => payment.id);
      await Payment.destroy({ where: { id: duplicateIds } });
      removed += duplicateIds.length;
    }
  }

  return removed;
}

module.exports = {
  ensureSchema,
  ensureRuntimeSchema,
  ensureUniqueOrderConstraint,
  normalizeLegacyPayments,
  cleanupDuplicatePayments,
  getAll,
  getAllWithOrders,
  findByOrderId,
  create,
  update,
  remove,
  createOrUpdateForOrder,
  updateStatusByOrder
};
