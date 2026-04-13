const UserModel = require("../models/UserModel");
const OrderModel = require("../models/OrderModel");
const AddressModel = require("../models/AddressModel");
const ReviewModel = require("../models/ReviewModel");
const CartModel = require("../models/CartModel");
const CartItemModel = require("../models/CartItemModel");
const PaymentModel = require("../models/PaymentModel");
const OrderDetailModel = require("../models/OrderDetailModel");
const VoucherModel = require("../models/VoucherModel");
const FoodModel = require("../models/FoodModel");

async function initDb() {
  const shouldSyncSchema = process.env.DB_SYNC_SCHEMA === "true";
  const shouldEnsureAdmin = process.env.DB_ENSURE_ADMIN === "true";
  const shouldSeedSampleData = process.env.DB_SEED_SAMPLE_DATA === "true";

  try {
    if (shouldSyncSchema) {
      await UserModel.ensureSchema();
      await OrderModel.ensureSchema();
      await AddressModel.ensureSchema();
      await ReviewModel.ensureSchema();
    }

    await CartModel.ensureSchema();
    await CartItemModel.ensureSchema();
    await PaymentModel.ensureSchema();
    await OrderDetailModel.ensureSchema();
    await VoucherModel.ensureSchema();
    await FoodModel.ensureSchema();

    await OrderModel.ensureRuntimeSchema();
    await ReviewModel.ensureRuntimeSchema();
    await PaymentModel.ensureRuntimeSchema();
    await FoodModel.ensureRuntimeSchema();

    const normalizedPayments = await PaymentModel.normalizeLegacyPayments();
    console.log(`Payments normalized: updated ${normalizedPayments}`);

    const cleanedPayments = await PaymentModel.cleanupDuplicatePayments();
    console.log(`Payments deduplicated: removed ${cleanedPayments}`);

    await PaymentModel.ensureUniqueOrderConstraint();
    console.log("Payments unique constraint ensured");

    if (shouldEnsureAdmin) {
      await UserModel.ensureAdminAccount();
      console.log("Admin bootstrap ensured");
    }

    if (shouldSeedSampleData) {
      const seededAddresses = await AddressModel.seedDefaults();
      console.log(
        `Addresses seeded: created ${seededAddresses.created}, skipped ${seededAddresses.skipped}`
      );

      const seededReviews = await ReviewModel.seedDefaults();
      console.log(
        `Reviews seeded: created ${seededReviews.created}, skipped ${seededReviews.skipped}`
      );

      const seededVouchers = await VoucherModel.seedDefaults();
      console.log(
        `Vouchers seeded: created ${seededVouchers.created}, skipped ${seededVouchers.skipped}`
      );
    } else {
      console.log("Sample seed skipped");
    }

    const normalizedReviews = await ReviewModel.normalizeSeededComments();
    console.log(`Reviews normalized: updated ${normalizedReviews}`);

    console.log("Database initialized");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

module.exports = initDb;
