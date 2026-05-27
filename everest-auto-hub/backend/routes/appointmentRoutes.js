const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { sendAppointmentEmail } = require('../utils/sendEmail');

const sanitize = (str) => (str ? String(str).replace(/<[^>]*>/g, '').trim() : '');

// CHECK SLOT AVAILABILITY (public)
// Returns { slots: [{ time, booked, capacity, available, remaining }] }
router.get('/availability', async (req, res) => {
  try {
    const { date, service } = req.query;
    if (!date || !service) return res.status(400).json({ message: 'date and service are required' });

    const serviceDoc = await Service.findByPk(service);
    if (!serviceDoc) return res.status(404).json({ message: 'Service not found' });

    const capacity = serviceDoc.slotsPerHour || 1;

    // Count bookings per time slot for this service+date
    const bookings = await Appointment.findAll({
      where: { serviceId: service, date, status: { [Op.ne]: 'cancelled' } },
      attributes: ['timeSlot'],
    });

    // Build a count map
    const countMap = {};
    bookings.forEach(a => {
      countMap[a.timeSlot] = (countMap[a.timeSlot] || 0) + 1;
    });

    // Return slot info for each time slot
    const ALL_SLOTS = [
      '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
      '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
    ];

    const slots = ALL_SLOTS.map(time => {
      const booked = countMap[time] || 0;
      const remaining = Math.max(0, capacity - booked);
      return { time, booked, capacity, remaining, available: remaining > 0 };
    });

    res.json({ slots, capacity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BOOK APPOINTMENT
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, vehicle, service, date, timeSlot, message } = req.body;

    if (!name || !email || !phone || !vehicle || !service || !date || !timeSlot)
      return res.status(400).json({ message: 'All fields are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Invalid email address' });
    const phoneRegex = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const bookingDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (bookingDate < today) return res.status(400).json({ message: 'Cannot book appointments in the past' });

    const serviceDoc = await Service.findByPk(service);
    if (!serviceDoc || !serviceDoc.isActive) return res.status(400).json({ message: 'Selected service is not available' });

    // Slot capacity check — count existing bookings for this slot
    const slotCount = await Appointment.count({
      where: { serviceId: service, date, timeSlot, status: { [Op.ne]: 'cancelled' } },
    });
    const capacity = serviceDoc.slotsPerHour || 1;
    if (slotCount >= capacity)
      return res.status(409).json({ message: `The ${timeSlot} slot is fully booked. Please choose a different time.` });

    const appointment = await Appointment.create({
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      phone: sanitize(phone),
      vehicle: sanitize(vehicle),
      serviceId: service,
      date,
      timeSlot,
      message: sanitize(message || ''),
      userId: req.body.user || null,
    });

    sendAppointmentEmail(appointment.email, appointment, serviceDoc.name, 'booked').catch(e =>
      console.error('[EMAIL] Booking confirmation failed:', e.message)
    );
    res.status(201).json({ appointment, message: 'Appointment booked! A confirmation email has been sent.' });
  } catch (err) {
    console.error('[APPOINTMENT]', err.message);
    res.status(500).json({ message: 'Booking failed. Please try again.' });
  }
});

// GET MY APPOINTMENTS
router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { email: req.user.email },
      include: [{ model: Service, as: 'service', attributes: ['name', 'price', 'duration'] }],
      order: [['date', 'DESC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CANCEL OWN APPOINTMENT
router.put('/cancel/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ where: { id: req.params.id, email: req.user.email } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Appointment is already cancelled' });

    const apptDateTime = new Date(appointment.date);
    const [time, period] = appointment.timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    apptDateTime.setHours(hours, minutes, 0, 0);

    if ((apptDateTime - new Date()) / (1000 * 60 * 60) < 2)
      return res.status(400).json({ message: 'Appointments can only be cancelled at least 2 hours in advance' });

    await appointment.update({ status: 'cancelled' });
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL APPOINTMENTS (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, date } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (date) where.date = date;

    const appointments = await Appointment.findAll({
      where,
      include: [{ model: Service, as: 'service', attributes: ['name', 'price', 'duration'] }],
      order: [['date', 'ASC'], ['timeSlot', 'ASC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STATUS (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: Service, as: 'service', attributes: ['name'] }],
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    await appointment.update({ status: req.body.status });

    if (['confirmed', 'cancelled', 'completed'].includes(req.body.status)) {
      sendAppointmentEmail(
        appointment.email,
        appointment,
        appointment.service?.name || 'Service',
        req.body.status
      ).catch(e => console.error('[EMAIL] Status update email failed:', e.message));
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
