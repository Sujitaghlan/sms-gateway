const {
  normalizeNepaliNumber,
  calculateSmsParts,
} = require("../utils/smsUtils");

const { sequelize, Wallet, SmsLog } = require("../models");
const { tryProviders } = require("../services/smsService");

async function sendSms(req, res) {
  try {
    const { phoneNumbers, message } = req.body;

    // Validate the request
    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({
        message: "phoneNumbers must be a non-empty array",
      });
    }

    if (phoneNumbers.length > 100) {
      return res.status(400).json({
        message: "You can send SMS to a maximum of 100 numbers per request",
      });
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        message: "Message must be a non-empty string",
      });
    }

    // Validate and normalize every phone number
    const normalizedNumbers = [];

    for (const number of phoneNumbers) {
      if (typeof number !== "string" && typeof number !== "number") {
        return res.status(400).json({
          message: "Each phone number must be a string or number",
        });
      }

      const normalized = normalizeNepaliNumber(String(number));

      if (!normalized) {
        return res.status(400).json({
          message: `Invalid Nepali phone number: ${number}`,
        });
      }

      normalizedNumbers.push(normalized);
    }

    // Calculate the credits required for each recipient
    const smsDetails = calculateSmsParts(message);
    const creditsRequired = smsDetails.parts * normalizedNumbers.length;
    const transaction = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({
        where: { userId: req.user.userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!wallet) {
        await transaction.rollback();

        return res.status(404).json({
          message: "Wallet not found",
        });
      }

      if (wallet.balance < creditsRequired) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Insufficient wallet credits",
          balance: wallet.balance,
          creditsRequired,
        });
      }

      wallet.balance -= creditsRequired;
      await wallet.save({ transaction });

      await transaction.commit();

      const providerResult = await tryProviders(creditsRequired);

      if (!providerResult.success) {
        // Record the failed SMS for each recipient.
        await SmsLog.bulkCreate(
          normalizedNumbers.map((phoneNumber) => ({
            userId: req.user.userId,
            phoneNumber,
            message,
            encoding: smsDetails.encoding,
            parts: smsDetails.parts,
            creditsCharged: 0,
            status: "failed",
            errorMessage: "All SMS providers failed",
          })),
        );

        // Refund the reserved credits.
        await sequelize.transaction(async (refundTransaction) => {
          const wallet = await Wallet.findOne({
            where: { userId: req.user.userId },
            transaction: refundTransaction,
            lock: refundTransaction.LOCK.UPDATE,
          });

          if (wallet) {
            wallet.balance += creditsRequired;
            await wallet.save({ transaction: refundTransaction });
          }
        });

        return res.status(502).json({
          message: "All SMS providers failed. Credits refunded.",
          creditsRefunded: creditsRequired,
        });
      }

      await SmsLog.bulkCreate(
        normalizedNumbers.map((phoneNumber) => ({
          userId: req.user.userId,
          phoneNumber,
          message,
          encoding: smsDetails.encoding,
          parts: smsDetails.parts,
          creditsCharged: smsDetails.parts,
          status: "sent",
          providerName: providerResult.provider.name,
          providerId: providerResult.provider.id,
        })),
      );

      return res.status(200).json({
        message: "SMS sent successfully (simulated)",
        recipients: normalizedNumbers,
        encoding: smsDetails.encoding,
        partsPerRecipient: smsDetails.parts,
        creditsCharged: creditsRequired,
        provider: providerResult.provider.name,
      });
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  } catch (error) {
    console.error("SMS validation error:", error);

    return res.status(500).json({
      message: "Failed to validate SMS request",
    });
  }
}

module.exports = { sendSms };
