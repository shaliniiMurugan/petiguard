const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../../db/database');

const user = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    verificationId: {
      type: DataTypes.STRING(255),
      allowNull: true // Stores Aadhar/PAN number
    },
    role: {
      type: DataTypes.JSON,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    },
    timestamps: true,
    tableName: 'user'
  }
);

module.exports = user;