const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const safeJson = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
  return fallback;
};

const Order = sequelize.define('Order', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:                { type: DataTypes.INTEGER, allowNull: true },
  items:                 { type: DataTypes.JSON, allowNull: false },
  shippingAddress:       { type: DataTypes.JSON, allowNull: false },
  paymentMethod:         { type: DataTypes.STRING, defaultValue: 'COD' },
  totalPrice:            { type: DataTypes.FLOAT, allowNull: false },
  status:                { type: DataTypes.ENUM('pending','processing','shipped','delivered','cancelled'), defaultValue: 'pending' },
  isPaid:                { type: DataTypes.BOOLEAN, defaultValue: false },
  stripePaymentIntentId: { type: DataTypes.STRING, defaultValue: '' },
}, { tableName: 'orders' });

const origToJSON = Order.prototype.toJSON;
Order.prototype.toJSON = function () {
  const values = origToJSON ? origToJSON.call(this) : { ...this.dataValues };
  values._id            = values.id;
  values.items          = safeJson(values.items, []);
  values.shippingAddress = safeJson(values.shippingAddress, {});
  return values;
};

addIdAlias(Order);
module.exports = Order;
