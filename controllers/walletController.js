
const { Wallet } = require("../models");

async function getWallet(req, res) {
  try {
    const wallet = await Wallet.findOne({
      where: { userId: req.user.userId }
    });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found"
      });
    }

    return res.status(200).json({
      balance: wallet.balance
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      message: "Failed to retrieve wallet"
    });
  }
}

module.exports = { getWallet };
