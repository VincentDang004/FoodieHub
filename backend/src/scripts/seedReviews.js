const ReviewModel = require("../models/ReviewModel");

async function run() {
  try {
    await ReviewModel.ensureRuntimeSchema();
    const result = await ReviewModel.seedDefaults();
    console.log(`Review seed completed. Created: ${result.created}, skipped: ${result.skipped}`);
    process.exit(0);
  } catch (error) {
    console.error("Review seed failed:", error);
    process.exit(1);
  }
}

run();
