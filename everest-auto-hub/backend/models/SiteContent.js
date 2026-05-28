const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const addIdAlias = require('../config/addIdAlias');

const SiteContent = sequelize.define('SiteContent', {
  id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // About
  aboutHeroTag:         { type: DataTypes.STRING, defaultValue: 'Our Story' },
  aboutHeroTitle:       { type: DataTypes.STRING, defaultValue: 'About Everest Auto Hub' },
  aboutHeroSubtitle:    { type: DataTypes.STRING, defaultValue: 'Driven by passion, built on trust' },
  aboutHeroImage:       { type: DataTypes.STRING, defaultValue: '' },
  aboutWhoTag:          { type: DataTypes.STRING, defaultValue: 'Who We Are' },
  aboutWhoTitle:        { type: DataTypes.STRING, defaultValue: "Australia's Most Trusted Auto Workshop" },
  aboutPara1:           { type: DataTypes.TEXT, defaultValue: "Founded over a decade ago, Everest Auto Hub has grown from a small garage to one of Australia's most trusted automotive service centres." },
  aboutPara2:           { type: DataTypes.TEXT, defaultValue: "Beyond auto services, we launched our own clothing brand — Everest Clothing." },
  aboutImage:           { type: DataTypes.STRING, defaultValue: '' },
  aboutTeamTag:         { type: DataTypes.STRING, defaultValue: 'Our Team' },
  aboutTeamTitle:       { type: DataTypes.STRING, defaultValue: 'Meet Our Experts' },
  // Team stored as JSON array
  aboutTeam:            { type: DataTypes.JSON, defaultValue: [
    { name: 'Rajesh Sharma', role: 'Head Mechanic',     exp: '15 years' },
    { name: 'Bikash Thapa',  role: 'Engine Specialist', exp: '10 years' },
    { name: 'Suman Rai',     role: 'Electrical Expert', exp: '8 years'  },
    { name: 'Dipak Gurung',  role: 'Body & Paint',      exp: '12 years' },
  ]},
  // Services page
  servicesHeroTag:      { type: DataTypes.STRING, defaultValue: 'What We Offer' },
  servicesHeroTitle:    { type: DataTypes.STRING, defaultValue: 'Our Services' },
  servicesHeroSubtitle: { type: DataTypes.STRING, defaultValue: 'Professional auto care from certified mechanics' },
  servicesHeroImage:    { type: DataTypes.STRING, defaultValue: '' },
  // Contact
  contactHeroTag:       { type: DataTypes.STRING, defaultValue: 'Get In Touch' },
  contactHeroTitle:     { type: DataTypes.STRING, defaultValue: 'Contact Us' },
  contactHeroSubtitle:  { type: DataTypes.STRING, defaultValue: "We're here to help" },
  contactAddress:       { type: DataTypes.TEXT, defaultValue: '123 Workshop Street, Sydney NSW 2000, Australia' },
  contactPhone1:        { type: DataTypes.STRING, defaultValue: '+61 2 9000 0000' },
  contactPhone2:        { type: DataTypes.STRING, defaultValue: '+61 2 9111 1111' },
  contactEmail:         { type: DataTypes.STRING, defaultValue: 'info@everestautohub.com' },
  contactHours1:        { type: DataTypes.STRING, defaultValue: 'Monday - Saturday: 8:00 AM - 7:00 PM' },
  contactHours2:        { type: DataTypes.STRING, defaultValue: 'Sunday: 10:00 AM - 4:00 PM' },
  contactMapEmbed:      { type: DataTypes.TEXT, defaultValue: '' },
  // Appointment
  apptHeroTag:          { type: DataTypes.STRING, defaultValue: 'Schedule a Visit' },
  apptHeroTitle:        { type: DataTypes.STRING, defaultValue: 'Book an Appointment' },
  apptHeroSubtitle:     { type: DataTypes.STRING, defaultValue: "Fill in the form below and we'll confirm your slot" },
  apptHeroImage:        { type: DataTypes.STRING, defaultValue: '' },
  apptWhyTitle:         { type: DataTypes.STRING, defaultValue: 'Why Book With Us?' },
  apptWhyPoints:        { type: DataTypes.JSON, defaultValue: ['Confirmation email sent instantly','Real-time slot availability','Expert certified mechanics','Transparent pricing','Free vehicle inspection','Cancel up to 2 hours before'] },
  apptPhone:            { type: DataTypes.STRING, defaultValue: '+61 2 9000 0000' },
  apptEmail:            { type: DataTypes.STRING, defaultValue: 'info@everestautohub.com.au' },
  // Shop
  shopHeroTag:          { type: DataTypes.STRING, defaultValue: 'Everest Clothing' },
  shopHeroTitle:        { type: DataTypes.STRING, defaultValue: 'Our Shop' },
  shopHeroSubtitle:     { type: DataTypes.STRING, defaultValue: 'Premium automotive lifestyle clothing' },
  shopHeroImage:        { type: DataTypes.STRING, defaultValue: '' },
  // Footer
  footerTagline:        { type: DataTypes.STRING, defaultValue: "Australia's premier auto workshop & lifestyle brand." },
  footerPhone:          { type: DataTypes.STRING, defaultValue: '+61 2 9000 0000' },
  footerEmail:          { type: DataTypes.STRING, defaultValue: 'info@everestautohub.com.au' },
  footerAddress:        { type: DataTypes.STRING, defaultValue: 'Sydney, NSW, Australia' },
  footerCopyright:      { type: DataTypes.STRING, defaultValue: '© 2024 Everest Auto Hub. All rights reserved.' },
  defaultCurrency:      { type: DataTypes.STRING, defaultValue: 'AUD' },
  // Social media links
  socialFacebook:       { type: DataTypes.STRING, defaultValue: '' },
  socialInstagram:      { type: DataTypes.STRING, defaultValue: '' },
  socialTwitter:        { type: DataTypes.STRING, defaultValue: '' },
  socialYoutube:        { type: DataTypes.STRING, defaultValue: '' },
  socialTiktok:         { type: DataTypes.STRING, defaultValue: '' },
  // Floating contact button
  floatingPhone:        { type: DataTypes.STRING, defaultValue: '' },
  floatingWhatsapp:     { type: DataTypes.STRING, defaultValue: '' },
}, { tableName: 'site_content' });

// Ensure JSON array fields are always arrays, never strings
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
};

const origToJSON = SiteContent.prototype.toJSON;
SiteContent.prototype.toJSON = function () {
  const values = origToJSON ? origToJSON.call(this) : { ...this.dataValues };
  values._id          = values.id;
  values.aboutTeam    = safeArray(values.aboutTeam);
  values.apptWhyPoints = safeArray(values.apptWhyPoints);
  return values;
};

addIdAlias(SiteContent);
module.exports = SiteContent;
