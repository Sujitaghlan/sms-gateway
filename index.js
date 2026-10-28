
require("dotenv").config();

const express = require("express");
const { sequelize } = require("./models");

const app = express();
app.use(express.json());

const routes = require("./routes");

app.get("/", (req, res) => {
  res.json({
    message: "Mini SMS Gateway API is running",
  });
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync();
    console.log("Database models synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
