const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const Review = sequelize.define('Review', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:     { type: DataTypes.INTEGER, allowNull: true },
  productId:  { type: DataTypes.INTEGER, allowNull: true },
  name:       { type: DataTypes.STRING, allowNull: false },
  rating:     { type: DataTypes.INTEGER, allowNull: false },
  comment:    { type: DataTypes.TEXT, allowNull: false },
  title:      { type: DataTypes.STRING, defaultValue: '' },
  type:       { type: DataTypes.ENUM('service','product','general'), defaultValue: 'general' },
  verified:   { type: DataTypes.BOOLEAN, defaultValue: false },
  helpful:    { type: DataTypes.INTEGER, defaultValue: 0 },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'reviews' });

addIdAlias(Review);
module.exports = Review;
