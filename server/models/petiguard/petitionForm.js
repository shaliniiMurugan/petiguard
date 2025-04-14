const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../../db/database');

const PetitionForm = sequelize.define('PetitionForm', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,primaryKey:true },
  petitionId: { type: DataTypes.STRING, allowNull: false },
  petitionType: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },

  name: { type: DataTypes.STRING, allowNull: false },
  fatherHusbandName: { type: DataTypes.STRING, allowNull: false },
  mobileNumber: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.STRING, allowNull: false },
  community: { type: DataTypes.STRING, allowNull: false },
  specialCategory: { type: DataTypes.STRING },

  doorNumber: { type: DataTypes.STRING, allowNull: false },
  street: { type: DataTypes.STRING, allowNull: false },
  area: { type: DataTypes.STRING, allowNull: false },
  district: { type: DataTypes.STRING, allowNull: false },
  // taluk: { type: DataTypes.STRING, allowNull: false },
  revenueVillage: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'pending'
  },
  assigned_official_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  attachmentPath: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }// Path to stored file
}, { timestamps: true });

module.exports = PetitionForm;
