const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDb");

const SmsLog = sequelize.define("SmsLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  encoding: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  creditsCharged: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("pending", "sent", "failed"),
    allowNull: false,
    defaultValue: "pending",
  },
  providerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = SmsLog;
