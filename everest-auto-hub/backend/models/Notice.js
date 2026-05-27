const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const Notice = sequelize.define('Notice', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title:     { type: DataTypes.STRING, allowNull: false },
  message:   { type: DataTypes.TEXT, defaultValue: '' },
  image:     { type: DataTypes.STRING, defaultValue: '' },
  type:      { type: DataTypes.ENUM('info','offer','warning','event'), defaultValue: 'info' },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'notices' });

addIdAlias(Notice);
module.exports = Notice;
