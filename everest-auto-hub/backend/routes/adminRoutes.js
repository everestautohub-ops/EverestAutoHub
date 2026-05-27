const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [users, appointments, orders, products] = await Promise.all([
      User.count({ where: { role: 'user', isVerified: true } }),
      Appointment.count(),
      Order.count(),
      Product.count({ where: { isActive: true } }),
    ]);

    // Revenue from delivered orders
    const orderRevenueResult = await Order.findOne({
      where: { status: 'delivered' },
      attributes: [[fn('SUM', col('totalPrice')), 'total']],
      raw: true,
    });
    const orderRevenue = parseFloat(orderRevenueResult?.total || 0);

    // Revenue from completed appointments
    const completedAppointments = await Appointment.findAll({
      where: { status: 'completed' },
      include: [{ model: Service, as: 'service', attributes: ['price'] }],
    });
    const appointmentRevenue = completedAppointments.reduce((sum, a) => sum + (a.service?.price || 0), 0);
    const totalRevenue = orderRevenue + appointmentRevenue;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.findAll({
      where: { status: 'delivered', createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('SUM', col('totalPrice')), 'revenue'],
        [fn('COUNT', col('id')), 'orders'],
      ],
      group: [fn('YEAR', col('createdAt')), fn('MONTH', col('createdAt'))],
      order: [[fn('YEAR', col('createdAt')), 'ASC'], [fn('MONTH', col('createdAt')), 'ASC']],
      raw: true,
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyData = monthlyOrders.map(m => ({
      month: `${monthNames[m.month - 1]} ${m.year}`,
      revenue: parseFloat(m.revenue),
      orders: parseInt(m.orders),
    }));

    const [pendingAppointments, pendingOrders] = await Promise.all([
      Appointment.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'pending' } }),
    ]);

    res.json({ users, appointments, orders, products, revenue: totalRevenue, orderRevenue, appointmentRevenue, pendingAppointments, pendingOrders, monthlyData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Notification counts
router.get('/notification-counts', protect, adminOnly, async (req, res) => {
  try {
    const [pendingOrders, pendingAppointments, pendingReviews, recentOrdersList, recentApptList, recentReviewsList] = await Promise.all([
      Order.count({ where: { status: 'pending' } }),
      Appointment.count({ where: { status: 'pending' } }),
      Review.count({ where: { isApproved: false } }),
      Order.findAll({ where: { status: 'pending' }, order: [['createdAt', 'DESC']], limit: 5 }),
      Appointment.findAll({ where: { status: 'pending' }, order: [['createdAt', 'DESC']], limit: 5, include: [{ model: Service, as: 'service', attributes: ['name'] }] }),
      Review.findAll({ where: { isApproved: false }, order: [['createdAt', 'DESC']], limit: 5 }),
    ]);

    const recent = [
      ...recentOrdersList.map(o => ({ type: 'order', icon: '🛒', title: `New order from ${o.shippingAddress?.name || 'Customer'}`, sub: `${o.totalPrice?.toFixed(2)}`, time: o.createdAt, link: '/admin/orders' })),
      ...recentApptList.map(a => ({ type: 'appointment', icon: '📅', title: `Appointment: ${a.name}`, sub: `${a.service?.name || 'Service'} — ${a.timeSlot}`, time: a.createdAt, link: '/admin/appointments' })),
      ...recentReviewsList.map(r => ({ type: 'review', icon: '⭐', title: `New review from ${r.name}`, sub: `${r.rating}/5 — "${r.comment?.slice(0, 40)}..."`, time: r.createdAt, link: '/admin/reviews' })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    res.json({ counts: { pendingOrders, pendingAppointments, pendingReviews }, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all verified users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isVerified: true },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
