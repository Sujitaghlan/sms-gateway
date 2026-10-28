
const sequelize = require("../config/connectDb");
const User = require("./User");
const Wallet = require("./Wallet");
const SmsProvider = require("./SmsProvider");
const SmsLog = require("./SmsLog");
const ProviderAttempt = require("./ProviderAttempt");

User.hasOne(Wallet, {
  foreignKey: {
    name: "userId",
    allowNull: false,
    unique: true
  },
  onDelete: "CASCADE"
});

Wallet.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
    unique: true
  }
});

SmsProvider.hasMany(ProviderAttempt, {
  foreignKey: "providerId",
  onDelete: "CASCADE",
});

ProviderAttempt.belongsTo(SmsProvider, {
  foreignKey: "providerId",
});

module.exports = {
  sequelize,
  User,
  Wallet,
  SmsProvider,
  SmsLog,
  ProviderAttempt,
};
