
require("dotenv").config();

const { sequelize, SmsProvider } = require("./models");

async function seedProviders() {
  try {
    await sequelize.authenticate();

    const providers = [
      {
        name: "Provider A",
        priority: 1,
        balance: 10000,
        failureRate: 0.30,
        isActive: true
      },
      {
        name: "Provider B",
        priority: 2,
        balance: 10000,
        failureRate: 0.15,
        isActive: true
      },
      {
        name: "Provider C",
        priority: 3,
        balance: 10000,
        failureRate: 0.05,
        isActive: true
      }
    ];

    for (const provider of providers) {
      await SmsProvider.findOrCreate({
        where: { name: provider.name },
        defaults: provider
      });
    }

    console.log("Mock SMS providers seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await sequelize.close();
  }
}

seedProviders();
