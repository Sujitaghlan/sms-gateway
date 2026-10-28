
const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDb");

const SmsProvider = sequelize.define("SmsProvider", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    validate: { min: 1 }
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10000,
    validate: { min: 0 }
  },
  failureRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.1,
    validate: { min: 0, max: 1 }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = SmsProvider;
