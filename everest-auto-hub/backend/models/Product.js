const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const Product = sequelize.define('Product', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:          { type: DataTypes.STRING, allowNull: false },
  description:   { type: DataTypes.TEXT, allowNull: false },
  price:         { type: DataTypes.FLOAT, allowNull: false },
  originalPrice: { type: DataTypes.FLOAT },
  category:      { type: DataTypes.STRING, allowNull: false },
  images:        { type: DataTypes.JSON, defaultValue: [] },
  sizes:         { type: DataTypes.JSON, defaultValue: [] },
  colors:        { type: DataTypes.JSON, defaultValue: [] },
  tags:          { type: DataTypes.JSON, defaultValue: [] },
  stock:         { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured:    { type: DataTypes.BOOLEAN, defaultValue: false },
  brand:         { type: DataTypes.STRING, defaultValue: 'Everest Auto Hub' },
  rating:        { type: DataTypes.FLOAT, defaultValue: 0 },
  numReviews:    { type: DataTypes.INTEGER, defaultValue: 0 },
  soldCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'products' });

// Ensure JSON array fields are always arrays, never strings
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
};

const originalToJSON = Product.prototype.toJSON;
Product.prototype.toJSON = function () {
  const values = originalToJSON ? originalToJSON.call(this) : { ...this.dataValues };
  values._id    = values.id;
  values.images = safeArray(values.images);
  values.sizes  = safeArray(values.sizes);
  values.colors = safeArray(values.colors);
  values.tags   = safeArray(values.tags);
  return values;
};

addIdAlias(Product);
module.exports = Product;
