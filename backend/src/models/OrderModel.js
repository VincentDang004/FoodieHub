const { Op } = require("sequelize");
const { sequelize, models } = require("../orm");
const PaymentModel = require("./PaymentModel");
const OrderDetailModel = require("./OrderDetailModel");

const { User, Order, OrderItem } = models;

function buildWhere(whereClause, params) {
  const clause = (whereClause || "").trim();

  if (clause === "WHERE o.id = ?") {
    return { id: params[0] };
  }

  if (clause === "WHERE o.user_id = ?") {
    return { user_id: params[0] };
  }

  if (clause === "WHERE o.id = ? AND o.user_id = ?") {
    return { id: params[0], user_id: params[1] };
  }

  if (clause === "WHERE o.status = ?") {
    return { status: params[0] };
  }

  throw new Error(`Unsupported fetchOrders whereClause: ${whereClause}`);
}

async function fetchOrders(whereClause, params = []) {
  const where = buildWhere(whereClause, params);

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, attributes: ["name", "email"], required: true },
      { model: OrderItem, required: false }
    ],
    order: [
      ["created_at", "DESC"],
      [OrderItem, "id", "ASC"]
    ]
  });

  return orders.map((order) => {
    const plain = order.get({ plain: true });

    return {
      id: plain.id,
      userId: plain.user_id,
      userName: plain.User?.name,
      userEmail: plain.User?.email,
      subtotal: Number(plain.subtotal || plain.total || 0),
      voucherCode: plain.voucher_code || "",
      discountPercent: Number(plain.discount_percent || 0),
      discountAmount: Number(plain.discount_amount || 0),
      total: Number(plain.total),
      shippingAddress: plain.shipping_address || "",
      status: plain.status,
      paymentMethod: plain.payment_method || "",
      paymentRequestedAt: plain.payment_requested_at,
      paymentExpiresAt: plain.payment_expires_at,
      paymentExpiredAt: plain.payment_expired_at,
      approvedAt: plain.approved_at,
      rejectedAt: plain.rejected_at,
      createdAt: plain.created_at,
      items: (plain.OrderItems || []).map((item) => ({
        id: item.id,
        foodId: item.food_id,
        name: item.food_name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || ""
      }))
    };
  });
}

async function ensureOrdersTable() {
  await Order.sync();
}

async function ensureShippingAddressColumn() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("orders");

  if (!table.shipping_address) {
    await queryInterface.addColumn("orders", "shipping_address", {
      type: Order.getAttributes().shipping_address.type,
      allowNull: true
    });
  }
}

async function ensureOrderMetadataColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("orders");
  const attributes = Order.getAttributes();

  for (const column of ["subtotal", "voucher_code", "discount_percent", "discount_amount"]) {
    if (!table[column]) {
      await queryInterface.addColumn("orders", column, {
        type: attributes[column].type,
        allowNull: true
      });
    }
  }
}

async function ensurePaymentLifecycleColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("orders");
  const attributes = Order.getAttributes();

  for (const column of [
    "payment_method",
    "payment_requested_at",
    "payment_expires_at",
    "payment_expired_at",
    "approved_at",
    "rejected_at"
  ]) {
    if (!table[column]) {
      await queryInterface.addColumn("orders", column, {
        type: attributes[column].type,
        allowNull: true
      });
    }
  }
}

async function ensureOrderItemsTable() {
  await OrderItem.sync();
}

async function ensureSchema() {
  await ensureOrdersTable();
  await ensureShippingAddressColumn();
  await ensureOrderMetadataColumns();
  await ensurePaymentLifecycleColumns();
  await ensureOrderItemsTable();
}

async function ensureRuntimeSchema() {
  await ensureShippingAddressColumn();
  await ensureOrderMetadataColumns();
  await ensurePaymentLifecycleColumns();
}

async function createOrderWithItems({
  userId,
  items,
  subtotal,
  discountPercent,
  discountAmount,
  total,
  shippingAddress,
  voucherCode
}) {
  return sequelize.transaction(async (transaction) => {
    let createdOrder;

    try {
      createdOrder = await Order.create(
        {
          user_id: userId,
          subtotal,
          voucher_code: voucherCode || null,
          discount_percent: discountPercent || 0,
          discount_amount: discountAmount || 0,
          total,
          shipping_address: shippingAddress || "",
          status: "pending_payment"
        },
        { transaction }
      );
    } catch (error) {
      const wrapped = new Error("order_insert_failed");
      wrapped.kind = "order_insert_failed";
      wrapped.cause = error;
      throw wrapped;
    }

    const orderId = createdOrder.id;

    try {
      await OrderItem.bulkCreate(
        items.map((item) => ({
          order_id: orderId,
          food_id: item.foodId || null,
          food_name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ""
        })),
        { transaction }
      );

      await OrderDetailModel.bulkCreateForOrder({ order_id: orderId, items, transaction });
    } catch (error) {
      const wrapped = new Error("order_items_insert_failed");
      wrapped.kind = "order_items_insert_failed";
      wrapped.cause = error;
      throw wrapped;
    }

    return orderId;
  });
}

async function startPayment({ orderId, userId, expiresAt }) {
  const [updated] = await Order.update(
    {
      status: "awaiting_approval",
      payment_method: "qr",
      payment_requested_at: new Date(),
      payment_expires_at: expiresAt,
      payment_expired_at: null
    },
    {
      where: {
        id: orderId,
        user_id: userId,
        status: { [Op.in]: ["pending_payment", "payment_rejected", "payment_expired"] }
      }
    }
  );

  if (!updated) {
    throw new Error("order_not_eligible_for_payment");
  }

  await PaymentModel.createOrUpdateForOrder({ order_id: orderId, method: "qr" });
}

async function expireOrder({ orderId, userId }) {
  await Order.update(
    { status: "payment_expired", payment_expired_at: new Date() },
    { where: { id: orderId, user_id: userId, status: "awaiting_approval" } }
  );

  await PaymentModel.updateStatusByOrder({
    order_id: orderId,
    status: "payment_expired",
    note: "Order expired before admin approval"
  });
}

async function expireOverdueAwaitingApproval() {
  await Order.update(
    { status: "payment_expired", payment_expired_at: new Date() },
    {
      where: {
        status: "awaiting_approval",
        payment_expires_at: { [Op.ne]: null, [Op.lt]: new Date() }
      }
    }
  );

  const expiredOrders = await Order.findAll({
    attributes: ["id"],
    where: {
      status: "payment_expired",
      payment_expired_at: { [Op.ne]: null }
    },
    raw: true
  });

  for (const order of expiredOrders) {
    await PaymentModel.updateStatusByOrder({
      order_id: order.id,
      status: "payment_expired",
      note: "Order expired automatically"
    });
  }
}

async function updateOrderStatusByAdmin({ orderId, status }) {
  const updateFields = { status };

  if (status === "paid") {
    updateFields.approved_at = new Date();
  }

  if (status === "payment_rejected") {
    updateFields.rejected_at = new Date();
  }

  await Order.update(updateFields, { where: { id: orderId, status: "awaiting_approval" } });
  await PaymentModel.updateStatusByOrder({
    order_id: orderId,
    status,
    note: status === "paid" ? "Admin approved payment" : "Admin rejected payment"
  });
}

async function hasPaidOrderItem({ userId, foodId }) {
  const count = await OrderItem.count({
    include: [
      {
        model: Order,
        required: true,
        where: { user_id: userId, status: "paid" }
      }
    ],
    where: { food_id: foodId }
  });

  return count > 0;
}

module.exports = {
  ensureSchema,
  ensureRuntimeSchema,
  fetchOrders,
  createOrderWithItems,
  startPayment,
  expireOrder,
  expireOverdueAwaitingApproval,
  updateOrderStatusByAdmin,
  hasPaidOrderItem
};
