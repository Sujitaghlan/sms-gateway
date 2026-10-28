
require("dotenv").config();

const sequelize = require("./config/connectDb");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
