
const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDb");

const Wallet = sequelize.define("Wallet", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
});

module.exports = Wallet;
