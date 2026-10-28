require("dotenv").config();

const { sequelize } = require("./models");

async function createTables() {
  try {
    await sequelize.authenticate();

    console.log("Connected database:", sequelize.config.database);
    console.log("Connected host:", sequelize.config.host);
    console.log("Connected port:", sequelize.config.port);

    await sequelize.sync();
   
    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  } finally {
    await sequelize.close();
  }
}

createTables();
