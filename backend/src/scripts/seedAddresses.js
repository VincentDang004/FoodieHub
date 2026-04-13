const AddressModel = require("../models/AddressModel");
const UserModel = require("../models/UserModel");
const { sequelize } = require("../orm");

async function run() {
  try {
    await sequelize.authenticate();
    await UserModel.ensureSchema();
    await AddressModel.ensureSchema();
    await UserModel.ensureAdminAccount();

    const result = await AddressModel.seedDefaults();
    console.log(
      `Address seed completed. Created: ${result.created}, skipped: ${result.skipped}`
    );
    process.exit(0);
  } catch (error) {
    console.error("Address seed failed:", error);
    process.exit(1);
  }
}

run();
