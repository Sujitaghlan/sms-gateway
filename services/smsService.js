
const { sequelize, SmsProvider, ProviderAttempt } = require("../models");

async function tryProviders(creditsRequired = 1) {
  const providers = await SmsProvider.findAll({
    where: { isActive: true },
    order: [["priority", "ASC"]],
  });

  const attempts = [];

  for (const provider of providers) {
    let success = false;
    let errorMessage = null;

    try {
      // Lock the provider row while checking and deducting its balance.
      await sequelize.transaction(async (transaction) => {
        const lockedProvider = await SmsProvider.findByPk(provider.id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (
          !lockedProvider ||
          !lockedProvider.isActive ||
          lockedProvider.balance < creditsRequired
        ) {
          errorMessage = "Provider has insufficient balance or is inactive";
          return;
        }

        // Simulate provider delivery.
        if (Math.random() < lockedProvider.failureRate) {
          errorMessage = "Simulated provider failure";
          return;
        }

        lockedProvider.balance -= creditsRequired;

        await lockedProvider.save({ transaction });

        provider.balance = lockedProvider.balance;
        provider.name = lockedProvider.name;
        success = true;
      });
    } catch (error) {
      errorMessage = "Provider processing error";
    }

    await ProviderAttempt.create({
      providerId: provider.id,
      providerName: provider.name,
      success,
      errorMessage,
    });

    attempts.push({
      providerId: provider.id,
      providerName: provider.name,
      success,
      error: errorMessage,
    });

    if (success) {
      return { success: true, provider, attempts };
    }

    console.log(`${provider.name} failed. Trying next provider...`);
  }

  return { success: false, provider: null, attempts };
}

module.exports = { tryProviders };
