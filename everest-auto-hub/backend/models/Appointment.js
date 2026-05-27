const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const Appointment = sequelize.define('Appointment', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, allowNull: true },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  name:      { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, allowNull: false },
  phone:     { type: DataTypes.STRING, allowNull: false },
  vehicle:   { type: DataTypes.STRING, allowNull: false },
  date:      { type: DataTypes.DATEONLY, allowNull: false },
  timeSlot:  { type: DataTypes.STRING, allowNull: false },
  message:   { type: DataTypes.TEXT },
  status:    { type: DataTypes.ENUM('pending','confirmed','completed','cancelled'), defaultValue: 'pending' },
}, { tableName: 'appointments' });

addIdAlias(Appointment);
module.exports = Appointment;
