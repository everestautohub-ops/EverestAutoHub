const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const HomeContent = sequelize.define('HomeContent', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  heroBadge:             { type: DataTypes.STRING, defaultValue: "🇦🇺 Australia's Premier Auto Workshop" },
  heroSubtitle:          { type: DataTypes.TEXT, defaultValue: "Expert auto repair, maintenance & your favorite automotive lifestyle brand." },
  heroImage:             { type: DataTypes.STRING, defaultValue: '' },
  // Hero slideshow — JSON array of { url, caption, accent }
  heroSlides:            { type: DataTypes.JSON, defaultValue: [] },
  // Animation style: 'kenburns' | 'fade' | 'zoom-out' | 'slide'
  heroAnimation:         { type: DataTypes.STRING, defaultValue: 'kenburns' },
  // Slide interval in seconds
  heroInterval:          { type: DataTypes.INTEGER, defaultValue: 5 },
  whyTitle:              { type: DataTypes.STRING, defaultValue: 'Built on Trust & Expertise' },
  whySubtitle:           { type: DataTypes.TEXT, defaultValue: "At Everest Auto Hub, we combine technical expertise with genuine care for your vehicle." },
  whyImage:              { type: DataTypes.STRING, defaultValue: '' },
  shopBannerTag:         { type: DataTypes.STRING, defaultValue: 'Everest Clothing' },
  shopBannerTitle:       { type: DataTypes.STRING, defaultValue: 'Wear Your Passion' },
  shopBannerSubtitle:    { type: DataTypes.TEXT, defaultValue: 'Exclusive automotive lifestyle clothing.' },
  shopBannerImage:       { type: DataTypes.STRING, defaultValue: '' },
  ctaTitle:              { type: DataTypes.STRING, defaultValue: 'Ready to Book Your Service?' },
  ctaSubtitle:           { type: DataTypes.TEXT, defaultValue: 'Schedule your appointment today.' },
  ctaPhone:              { type: DataTypes.STRING, defaultValue: '+61 2 9000 0000' },
  servicesSectionTag:    { type: DataTypes.STRING, defaultValue: 'What We Do' },
  servicesSectionTitle:  { type: DataTypes.STRING, defaultValue: 'Our Services' },
  servicesSectionSubtitle: { type: DataTypes.TEXT, defaultValue: 'Professional auto care services' },
}, { tableName: 'home_content' });

// Ensure heroSlides is always an array
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
};

const origToJSON = HomeContent.prototype.toJSON;
HomeContent.prototype.toJSON = function () {
  const values = origToJSON ? origToJSON.call(this) : { ...this.dataValues };
  values._id        = values.id;
  values.heroSlides = safeArray(values.heroSlides);
  return values;
};

addIdAlias(HomeContent);
module.exports = HomeContent;
