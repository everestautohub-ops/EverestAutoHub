const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const User = sequelize.define('User', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:       { type: DataTypes.STRING, allowNull: false },
  email:      { type: DataTypes.STRING, allowNull: false, unique: true },
  password:   { type: DataTypes.STRING, allowNull: false },
  role:       { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  phone:      { type: DataTypes.STRING },
  address:    { type: DataTypes.TEXT },
  avatar:     { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp:        { type: DataTypes.STRING },
  otpExpiry:  { type: DataTypes.DATE },
}, { tableName: 'users' });

User.prototype.matchPassword = function (enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

addIdAlias(User);
module.exports = User;
