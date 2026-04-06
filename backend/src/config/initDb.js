const bcrypt = require("bcrypt");
const db = require("./db");

function query(sql, params = []) {
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

async function ensureUsersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureOrdersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
      payment_method VARCHAR(30) DEFAULT NULL,
      payment_requested_at DATETIME DEFAULT NULL,
      payment_expires_at DATETIME DEFAULT NULL,
      payment_expired_at DATETIME DEFAULT NULL,
      approved_at DATETIME DEFAULT NULL,
      rejected_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

async function ensureOrderItemsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      food_id INT DEFAULT NULL,
      food_name VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      quantity INT NOT NULL DEFAULT 1,
      image VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);
}

async function ensureColumn(tableName, columnName, definition) {
  const columns = await query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);

  if (!columns || columns.length === 0) {
    await query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureOrdersColumns() {
  await ensureColumn("orders", "user_id", "INT NOT NULL");
  await ensureColumn("orders", "total", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("orders", "status", "VARCHAR(30) NOT NULL DEFAULT 'pending_payment'");
  await ensureColumn("orders", "payment_method", "VARCHAR(30) DEFAULT NULL");
  await ensureColumn("orders", "payment_requested_at", "DATETIME DEFAULT NULL");
  await ensureColumn("orders", "payment_expires_at", "DATETIME DEFAULT NULL");
  await ensureColumn("orders", "payment_expired_at", "DATETIME DEFAULT NULL");
  await ensureColumn("orders", "approved_at", "DATETIME DEFAULT NULL");
  await ensureColumn("orders", "rejected_at", "DATETIME DEFAULT NULL");
  await ensureColumn("orders", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
}

async function ensureOrderItemsColumns() {
  await ensureColumn("order_items", "order_id", "INT NOT NULL");
  await ensureColumn("order_items", "food_id", "INT DEFAULT NULL");
  await ensureColumn("order_items", "food_name", "VARCHAR(255) NOT NULL");
  await ensureColumn("order_items", "price", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("order_items", "quantity", "INT NOT NULL DEFAULT 1");
  await ensureColumn("order_items", "image", "VARCHAR(500) DEFAULT NULL");
  await ensureColumn("order_items", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
}

async function ensureRoleColumn() {
  const columns = await query("SHOW COLUMNS FROM users LIKE 'role'");

  if (!columns || columns.length === 0) {
    await query("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'");
  }
}

async function ensureAdminAccount() {
  const email = "admin@gmail.com";
  const passwordHash = bcrypt.hashSync("admin@123", 10);
  const users = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

  if (users.length > 0) {
    await query(
      "UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?",
      ["Administrator", passwordHash, "admin", email]
    );
    return;
  }

  await query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Administrator", email, passwordHash, "admin"]
  );
}

async function initDb() {
  try {
    await ensureUsersTable();
    await ensureRoleColumn();
    await ensureOrdersTable();
    await ensureOrderItemsTable();
    await ensureOrdersColumns();
    await ensureOrderItemsColumns();
    await ensureAdminAccount();
    console.log("Database initialized: admin account is ready");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

module.exports = initDb;
