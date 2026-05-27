const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const Service = sequelize.define('Service', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:         { type: DataTypes.STRING, allowNull: false },
  description:  { type: DataTypes.TEXT, allowNull: false },
  price:        { type: DataTypes.FLOAT, allowNull: false },
  duration:     { type: DataTypes.STRING },
  icon:         { type: DataTypes.STRING },
  image:        { type: DataTypes.STRING },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
  slotsPerHour: { type: DataTypes.INTEGER, defaultValue: 1 }, // max bookings per time slot
}, { tableName: 'services' });

addIdAlias(Service);
module.exports = Service;
