const bcrypt = require("bcrypt");
const { models } = require("../orm");

const { User } = models;

async function ensureSchema() {
  await User.sync();
}

async function ensureAdminAccount() {
  const email = "admin@gmail.com";
  const passwordHash = bcrypt.hashSync("admin@123", 10);
  const user = await User.findOne({ where: { email } });

  if (user) {
    await user.update({ name: "Administrator", password: passwordHash, role: "admin" });
    return;
  }

  await User.create({ name: "Administrator", email, password: passwordHash, role: "admin" });
}

async function hasAdminAccount() {
  const count = await User.count({ where: { role: "admin" } });
  return count > 0;
}

async function createUser({ name, email, passwordHash, role = "user" }) {
  const user = await User.create({ name, email, password: passwordHash, role });
  return user.id;
}

async function findByEmail(email) {
  const user = await User.findOne({ where: { email }, raw: true });
  return user || null;
}

async function findRoleById(id) {
  const user = await User.findByPk(id, { attributes: ["role"], raw: true });
  return user ? user.role : null;
}

module.exports = {
  ensureSchema,
  ensureAdminAccount,
  hasAdminAccount,
  createUser,
  findByEmail,
  findRoleById
};
