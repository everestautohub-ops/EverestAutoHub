import { useEffect, useState, useCallback } from 'react';
import { FiCalendar, FiUser, FiPhone, FiMail, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import './Appointment.css';

const ALL_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'
];

export default function Appointment() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [services, setServices] = useState([]);
  const [slotData, setSlotData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [siteContent, setSiteContent] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicle: '',
    service: '',
    date: '',
    timeSlot: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data));
    api.get('/site-content').then(r => setSiteContent(r.data)).catch(() => setSiteContent({}));
  }, []);

  // Fetch booked slots whenever date or service changes
  const fetchAvailability = useCallback(async (date, service) => {
    if (!date || !service) { setSlotData([]); return; }
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/appointments/availability?date=${date}&service=${service}`);
      setSlotData(data.slots || []);
    } catch {
      setSlotData([]);
    }
    setLoadingSlots(false);
  }, []);

  const handleChange = e => {
    const updated = { ...form, [e.target.name]: e.target.value };
    // Reset time slot if date or service changes
    if (e.target.name === 'date' || e.target.name === 'service') {
      updated.timeSlot = '';
      fetchAvailability(
        e.target.name === 'date' ? e.target.value : form.date,
        e.target.name === 'service' ? e.target.value : form.service
      );
    }
    setForm(updated);
  };

  const [timeSlotError, setTimeSlotError] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const phoneRegex = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error('Please enter a valid phone number (e.g. +61 400 000 000)');
      return;
    }
    if (!form.timeSlot) {
      setTimeSlotError(true);
      toast.error('Please select a time slot to continue');
      // Scroll to time slots
      document.querySelector('.time-slots')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setTimeSlotError(false);
    setLoading(true);
    try {
      await api.post('/appointments', {
        ...form,
        user: user?.id || user?._id,
      });
      setSuccess(true);
      toast.success('Appointment booked! Check your email for confirmation.');
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', vehicle: '', service: '', date: '', timeSlot: '', message: '' });
      setSlotData([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const sc = siteContent || {};

  return (
    <div className="appointment-page">
      <SEO
        title="Book an Appointment"
        description="Book your car service appointment at Everest Auto Hub. Choose your service, pick a date and time slot. Fast, easy and confirmed by email."
        url="/appointment"
      />
      <div className="page-hero">
        <div className="container">
          <p className="section-tag">{sc.apptHeroTag || 'Schedule a Visit'}</p>
          <h1 className="section-title">Book an <span>Appointment</span></h1>
          <p className="section-subtitle">{sc.apptHeroSubtitle || "Fill in the form below and we'll confirm your slot"}</p>
        </div>
      </div>

      <div className="container appt-container">
        <div className="appt-info">
          <h3>{sc.apptWhyTitle || 'Why Book With Us?'}</h3>
          <ul>
            {(Array.isArray(sc.apptWhyPoints) && sc.apptWhyPoints.length > 0
              ? sc.apptWhyPoints
              : ['Confirmation email sent instantly','Real-time slot availability','Expert certified mechanics','Transparent pricing','Free vehicle inspection','Cancel up to 2 hours before']
            ).map((pt, i) => <li key={i}>✅ {pt}</li>)}
          </ul>
          <div className="appt-contact">
            <p><FiPhone /> {sc.apptPhone || '+61 2 9000 0000'}</p>
            <p><FiMail /> {sc.apptEmail || 'info@everestautohub.com.au'}</p>
          </div>
        </div>

        <div className="appt-form-box card">
          {success ? (
            <div className="success-msg">
              <FiCheckCircle size={60} color="var(--primary)" />
              <h3>Appointment Booked!</h3>
              <p>A confirmation email has been sent to <strong>{form.email || user?.email}</strong>.</p>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>We'll contact you shortly to confirm your slot.</p>
              <button className="btn-primary" onClick={() => setSuccess(false)}>Book Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3>Appointment Details</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label><FiUser /> Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label><FiPhone /> Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" required />
                </div>
                <div className="form-group">
                  <label><FiMail /> Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label><FiTruck /> Vehicle</label>
                  <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="e.g. Toyota Corolla 2020" required />
                </div>
                <div className="form-group">
                  <label>Service</label>
                  <select name="service" value={form.service} onChange={handleChange} required>
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>{s.name} — {formatPrice(s.price)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><FiCalendar /> Date</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} min={today} required />
                </div>

                {/* Time Slots with availability */}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>
                    Preferred Time
                    {loadingSlots && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>Checking availability...</span>}
                    {!loadingSlots && form.date && form.service && slotData.length > 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>
                        {slotData.filter(s => !s.available).length} slot(s) full
                      </span>
                    )}
                  </label>
                  <div className="time-slots">
                    {slotData.length > 0 ? slotData.map(slot => {
                      const isSelected = form.timeSlot === slot.time;
                      const isFull = !slot.available;
                      const isLow = slot.available && slot.remaining <= 2 && slot.capacity > 1;
                      return (
                        <button
                          type="button"
                          key={slot.time}
                          disabled={isFull}
                          className={`time-slot ${isSelected ? 'active' : ''} ${isFull ? 'booked' : ''} ${isLow ? 'slot-low' : ''}`}
                          onClick={() => { if (!isFull) { setForm({ ...form, timeSlot: slot.time }); setTimeSlotError(false); } }}
                          title={isFull ? 'Fully booked' : slot.capacity > 1 ? `${slot.remaining} of ${slot.capacity} slots left` : slot.time}
                        >
                          <span className="slot-time">{slot.time}</span>
                          {isFull && <span className="slot-booked-label">Full</span>}
                          {!isFull && slot.capacity > 1 && (
                            <span className={`slot-count ${isLow ? 'slot-count-low' : ''}`}>
                              {slot.remaining} left
                            </span>
                          )}
                        </button>
                      );
                    }) : (
                      // Fallback: no slot data yet (before service+date selected)
                      ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'].map(t => (
                        <button
                          type="button"
                          key={t}
                          disabled={!form.date || !form.service}
                          className={`time-slot ${form.timeSlot === t ? 'active' : ''}`}
                          onClick={() => { setForm({ ...form, timeSlot: t }); setTimeSlotError(false); }}
                        >
                          <span className="slot-time">{t}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {timeSlotError && (
                    <small style={{ color: '#e63946', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: '0.85rem' }}>
                      ⚠️ Please select a time slot before confirming
                    </small>
                  )}
                  {(!form.date || !form.service) && (
                    <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                      Select a service and date to see available slots
                    </small>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Additional Notes</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe your issue or any special requests..." />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                disabled={loading}
              >
                {loading ? 'Booking...' : '🗓 Confirm Appointment'}
              </button>
              {!form.timeSlot && (
                <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.8rem', marginTop: 8 }}>
                  ⏰ Select a time slot above to enable booking
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
