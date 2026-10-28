const { SmsProvider, ProviderAttempt } = require("../models");
const { Op } = require("sequelize");

async function getProviderHealth(req, res) {
  try {
    const providers = await SmsProvider.findAll({
      order: [["priority", "ASC"]],
    });

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const results = await Promise.all(
      providers.map(async (provider) => {
        const attempts = await ProviderAttempt.findAll({
          where: {
            providerId: provider.id,
            createdAt: { [Op.gte]: last24Hours },
          },
          attributes: ["success"],
        });

        const total = attempts.length;
        const successful = attempts.filter((attempt) => attempt.success).length;

        const successRate = total === 0 ? null : (successful / total) * 100;
        let healthStatus;

        if (provider.balance <= 0) {
          healthStatus = "unhealthy";
        } else if (total === 0) {
          healthStatus = "unknown";
        } else if (successRate >= 90) {
          healthStatus = "healthy";
        } else if (successRate >= 50) {
          healthStatus = "degraded";
        } else {
          healthStatus = "unhealthy";
        }

        return {
          id: provider.id,
          name: provider.name,
          priority: provider.priority,
          balance: provider.balance,
          isActive: provider.isActive,
          totalMessages: total,
          successfulMessages: successful,
          successRate:
            successRate === null ? null : Number(successRate.toFixed(2)),
          healthStatus,
        };
      }),
    );

    return res.status(200).json({
      period: "Last 24 hours",
      providers: results,
    });
  } catch (error) {
    console.error("Provider health error:", error);

    return res.status(500).json({
      message: "Failed to retrieve provider health",
    });
  }
}

module.exports = { getProviderHealth };
