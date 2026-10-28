
const { DataTypes } = require("sequelize");
const  sequelize  = require("../config/connectDb");

const ProviderAttempt = sequelize.define("ProviderAttempt", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  providerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  errorMessage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ProviderAttempt;
