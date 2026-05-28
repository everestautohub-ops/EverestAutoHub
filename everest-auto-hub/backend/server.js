const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

dotenv.config();

const sequelize = require('./config/db');

// Import all models so Sequelize knows about them for sync + associations
const User        = require('./models/User');
const Service     = require('./models/Service');
const Product     = require('./models/Product');
const Order       = require('./models/Order');
const Appointment = require('./models/Appointment');
const Review      = require('./models/Review');
const Notice      = require('./models/Notice');
const HomeContent = require('./models/HomeContent');
const SiteContent = require('./models/SiteContent');

// ─── Associations ─────────────────────────────────────────────────────────────
Order.belongsTo(User,        { foreignKey: 'userId',    as: 'user' });
User.hasMany(Order,          { foreignKey: 'userId',    as: 'orders' });

Appointment.belongsTo(User,    { foreignKey: 'userId',    as: 'user' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
User.hasMany(Appointment,      { foreignKey: 'userId',    as: 'appointments' });

Review.belongsTo(User,    { foreignKey: 'userId',   as: 'user' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Review,      { foreignKey: 'userId',   as: 'reviews' });
Product.hasMany(Review,   { foreignKey: 'productId', as: 'reviews' });

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://everest-auto-hub.vercel.app',
  'https://everestautohub.com.au',
  'https://www.everestautohub.com.au',
  'http://everestautohub.com.au',
  'http://www.everestautohub.com.au',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts. Please try again in 15 minutes.' }, standardHeaders: true, legacyHeaders: false });
const forgotLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { message: 'Too many reset attempts. Please wait 10 minutes.' }, standardHeaders: true, legacyHeaders: false });
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 200, message: { message: 'Too many requests. Please slow down.' } });

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', forgotLimiter);
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/services',     require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/products',     require('./routes/productRoutes'));
app.use('/api/orders',       require('./routes/orderRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/upload',       require('./routes/uploadRoutes'));
app.use('/api/home-content', require('./routes/homeContentRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));
app.use('/api/notices',      require('./routes/noticeRoutes'));
app.use('/api/payment',      require('./routes/paymentRoutes'));

app.get('/', (req, res) => res.json({ message: 'Everest Auto Hub API Running (MySQL)' }));

// ─── Error Handling Middleware ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ─── Connect to MySQL then start server ───────────────────────────────────────
sequelize.authenticate()
  .then(async () => {
    console.log('✅ MySQL Connected');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ alter: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database tables synced');

    setInterval(async () => {
      try {
        const { Op } = require('sequelize');
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const count = await User.destroy({ where: { isVerified: false, createdAt: { [Op.lt]: cutoff } } });
        if (count > 0) console.log(`🧹 Cleaned ${count} unverified users`);
      } catch (err) {
        console.error('Cleanup error:', err.message);
      }
    }, 60 * 60 * 1000);

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
    process.exit(1);
  });

module.exports = app;