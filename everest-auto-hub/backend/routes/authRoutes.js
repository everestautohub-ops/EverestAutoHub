const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pw) => pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
const sanitize = (str) => (str ? String(str).replace(/<[^>]*>/g, '').trim() : '');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const name     = sanitize(req.body.name);
    const email    = sanitize(req.body.email)?.toLowerCase();
    const password = req.body.password;
    const phone    = sanitize(req.body.phone);

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (!isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    if (!isStrongPassword(password))
      return res.status(400).json({ message: 'Password must be at least 8 characters and include a letter and a number' });
    if (phone) {
      const phoneRegex = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Please enter a valid phone number' });
      }
    }

    const exists = await User.findOne({ where: { email } });

    if (exists && exists.isVerified)
      return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });

    if (exists && !exists.isVerified) {
      const otp = generateOTP();
      await exists.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), password: bcrypt.hashSync(password, 12), name, phone });
      sendVerificationEmail(email, name, otp).catch(err => console.error('[REGISTER] Email failed:', err.message));
      return res.status(201).json({ message: 'Verification code sent to your email', email });
    }

    const otp = generateOTP();
    await User.create({ name, email, phone, password: bcrypt.hashSync(password, 12), isVerified: false, otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    sendVerificationEmail(email, name, otp).catch(err => console.error('[REGISTER] Email failed:', err.message));
    return res.status(201).json({ message: 'Verification code sent to your email', email });
  } catch (err) {
    console.error('[REGISTER]', err.message);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const email = sanitize(req.body.email)?.toLowerCase();
    const otp   = sanitize(req.body.otp);
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ where: { email } });
    if (!user)           return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'Code expired. Please register again.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid verification code' });

    await user.update({ isVerified: true, otp: null, otpExpiry: null });
    return res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
  } catch (err) {
    console.error('[VERIFY-OTP]', err.message);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// RESEND OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const email = sanitize(req.body.email)?.toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user)           return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    await user.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    sendVerificationEmail(email, user.name, otp).catch(err => console.error('[RESEND-OTP] Email failed:', err.message));
    return res.json({ message: 'New verification code sent to your email' });
  } catch (err) {
    console.error('[RESEND-OTP]', err.message);
    return res.status(500).json({ message: 'Failed to resend code. Please try again.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const email    = sanitize(req.body.email)?.toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isVerified && user.role !== 'admin')
      return res.status(401).json({ message: 'Please verify your email before logging in', needsVerification: true, email });

    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, token: generateToken(user.id) });
  } catch (err) {
    console.error('[LOGIN]', err.message);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const email = sanitize(req.body.email)?.toLowerCase();
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account found with this email address' });

    const otp = generateOTP();
    await user.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    sendPasswordResetEmail(email, user.name, otp).catch(err => console.error('[FORGOT-PASSWORD] Email failed:', err.message));
    return res.json({ message: 'Reset code sent to your email', email });
  } catch (err) {
    console.error('[FORGOT-PASSWORD]', err.message);
    return res.status(500).json({ message: 'Failed to send reset code. Please try again.' });
  }
});

// VERIFY RESET OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const email = sanitize(req.body.email)?.toLowerCase();
    const otp   = sanitize(req.body.otp);
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid reset code' });

    return res.json({ message: 'Code verified', email });
  } catch (err) {
    console.error('[VERIFY-RESET-OTP]', err.message);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const email       = sanitize(req.body.email)?.toLowerCase();
    const otp         = sanitize(req.body.otp);
    const newPassword = req.body.newPassword;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });
    if (!isStrongPassword(newPassword)) return res.status(400).json({ message: 'Password must be at least 8 characters and include a letter and a number' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid or expired reset code' });

    await user.update({ password: bcrypt.hashSync(newPassword, 12), otp: null, otpExpiry: null, isVerified: true });
    return res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error('[RESET-PASSWORD]', err.message);
    return res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
});

// GET PROFILE
router.get('/profile', protect, async (req, res) => {
  return res.json(req.user);
});

// UPDATE PROFILE
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updates = {};
    if (req.body.name)    updates.name    = sanitize(req.body.name);
    if (req.body.phone)   updates.phone   = sanitize(req.body.phone);
    if (req.body.address) updates.address = sanitize(req.body.address);
    if (req.body.avatar)  updates.avatar  = req.body.avatar;
    if (req.body.password) {
      if (!isStrongPassword(req.body.password))
        return res.status(400).json({ message: 'Password must be at least 8 characters and include a letter and a number' });
      updates.password = bcrypt.hashSync(req.body.password, 12);
    }

    await user.update(updates);
    return res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar, token: generateToken(user.id) });
  } catch (err) {
    console.error('[UPDATE-PROFILE]', err.message);
    return res.status(500).json({ message: 'Profile update failed. Please try again.' });
  }
});

module.exports = router;
