const db = require("../config/db");

const PAYMENT_WINDOW_MS = 30000;

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
}

function groupOrders(rows) {
  const map = new Map();

  rows.forEach((row) => {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        total: Number(row.total),
        status: row.status,
        paymentMethod: row.payment_method || "",
        paymentRequestedAt: row.payment_requested_at,
        paymentExpiresAt: row.payment_expires_at,
        paymentExpiredAt: row.payment_expired_at,
        approvedAt: row.approved_at,
        rejectedAt: row.rejected_at,
        createdAt: row.created_at,
        items: []
      });
    }

    if (row.item_id) {
      map.get(row.id).items.push({
        id: row.item_id,
        foodId: row.food_id,
        name: row.food_name,
        price: Number(row.price),
        quantity: row.quantity,
        image: row.image || ""
      });
    }
  });

  return Array.from(map.values());
}

async function fetchOrders(whereClause, params = []) {
  const rows = await runQuery(
    `
      SELECT
        o.*,
        u.name AS user_name,
        u.email AS user_email,
        oi.id AS item_id,
        oi.food_id,
        oi.food_name,
        oi.price,
        oi.quantity,
        oi.image
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${whereClause}
      ORDER BY o.created_at DESC, oi.id ASC
    `,
    params
  );

  return groupOrders(rows);
}

exports.createOrder = (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Khong co mon an de dat hang" });
  }

  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  db.beginTransaction((beginErr) => {
    if (beginErr) {
      console.error(beginErr);
      return res.status(500).json({ message: "Khong the tao don hang" });
    }

    db.query(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
      [req.user.id, total, "pending_payment"],
      (orderErr, orderResult) => {
        if (orderErr) {
          return db.rollback(() => {
            console.error(orderErr);
            res.status(500).json({ message: "Khong the tao don hang" });
          });
        }

        const orderId = orderResult.insertId;
        const values = items.map((item) => [
          orderId,
          item.foodId || null,
          item.name,
          item.price,
          item.quantity,
          item.image || ""
        ]);

        db.query(
          "INSERT INTO order_items (order_id, food_id, food_name, price, quantity, image) VALUES ?",
          [values],
          (itemErr) => {
            if (itemErr) {
              return db.rollback(() => {
                console.error(itemErr);
                res.status(500).json({ message: "Khong the tao chi tiet don hang" });
              });
            }

            db.commit(async (commitErr) => {
              if (commitErr) {
                return db.rollback(() => {
                  console.error(commitErr);
                  res.status(500).json({ message: "Khong the luu don hang" });
                });
              }

              try {
                const orders = await fetchOrders("WHERE o.id = ?", [orderId]);
                res.json(orders[0]);
              } catch (fetchErr) {
                console.error(fetchErr);
                res.status(500).json({ message: "Tao don thanh cong nhung khong tai lai duoc du lieu" });
              }
            });
          }
        );
      }
    );
  });
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await fetchOrders("WHERE o.user_id = ?", [req.user.id]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai danh sach don hang" });
  }
};

exports.getMyOrderById = async (req, res) => {
  try {
    const orders = await fetchOrders("WHERE o.id = ? AND o.user_id = ?", [req.params.id, req.user.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai don hang" });
  }
};

exports.startPayment = async (req, res) => {
  try {
    const orders = await fetchOrders("WHERE o.id = ? AND o.user_id = ?", [req.params.id, req.user.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    const order = orders[0];
    const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MS);

    await runQuery(
      `
        UPDATE orders
        SET
          status = ?,
          payment_method = ?,
          payment_requested_at = NOW(),
          payment_expires_at = ?,
          payment_expired_at = NULL
        WHERE id = ? AND user_id = ?
      `,
      ["awaiting_approval", "qr", expiresAt, req.params.id, req.user.id]
    );

    const refreshed = await fetchOrders("WHERE o.id = ? AND o.user_id = ?", [req.params.id, req.user.id]);
    res.json(refreshed[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the bat dau thanh toan" });
  }
};

exports.expireOrder = async (req, res) => {
  try {
    await runQuery(
      `
        UPDATE orders
        SET status = ?, payment_expired_at = NOW()
        WHERE id = ? AND user_id = ? AND status = ?
      `,
      ["payment_expired", req.params.id, req.user.id, "awaiting_approval"]
    );

    const refreshed = await fetchOrders("WHERE o.id = ? AND o.user_id = ?", [req.params.id, req.user.id]);
    if (refreshed.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(refreshed[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat het han don hang" });
  }
};

exports.getPendingOrdersForAdmin = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  try {
    await runQuery(
      `
        UPDATE orders
        SET status = ?, payment_expired_at = NOW()
        WHERE status = ? AND payment_expires_at IS NOT NULL AND payment_expires_at < NOW()
      `,
      ["payment_expired", "awaiting_approval"]
    );

    const orders = await fetchOrders("WHERE o.status = ?", ["awaiting_approval"]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai danh sach cho duyet" });
  }
};

exports.updateOrderStatusByAdmin = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Khong co quyen truy cap" });
  }

  const { status } = req.body;
  if (!["paid", "payment_rejected"].includes(status)) {
    return res.status(400).json({ message: "Trang thai khong hop le" });
  }

  try {
    await runQuery(
      `
        UPDATE orders
        SET
          status = ?,
          approved_at = CASE WHEN ? = 'paid' THEN NOW() ELSE approved_at END,
          rejected_at = CASE WHEN ? = 'payment_rejected' THEN NOW() ELSE rejected_at END
        WHERE id = ? AND status = ?
      `,
      [status, status, status, req.params.id, "awaiting_approval"]
    );

    const orders = await fetchOrders("WHERE o.id = ?", [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat trang thai don hang" });
  }
};
