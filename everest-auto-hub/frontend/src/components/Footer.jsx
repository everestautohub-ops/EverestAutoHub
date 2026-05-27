import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import BrandLogo from './BrandLogo';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Footer.css';

export default function Footer() {
  const [c, setC] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <footer className="footer">
      {/* Newsletter strip */}
      <div className="footer-newsletter">
        <div className="container">
          <div>
            <h4>Stay in the Loop</h4>
            <p>Get service reminders, offers and automotive tips.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <BrandLogo size="md" />
            <p>{d.footerTagline || "Australia's trusted auto workshop and lifestyle brand. We keep your vehicle running and your style on point."}</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/appointment">Book Appointment</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Oil Change</Link></li>
              <li><Link to="/services">Brake Service</Link></li>
              <li><Link to="/services">Engine Diagnostics</Link></li>
              <li><Link to="/services">Tire Service</Link></li>
              <li><Link to="/services">AC Service</Link></li>
              <li><Link to="/services">Full Car Service</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Info</h4>
            <ul>
              <li><FiMapPin /> {d.footerAddress || '123 Workshop Street, Sydney NSW 2000, Australia'}</li>
              <li><FiPhone /> <a href={`tel:${(d.footerPhone || '+61290000000').replace(/\s/g,'')}`}>{d.footerPhone || '+61 2 9000 0000'}</a></li>
              <li><FiMail /> <a href={`mailto:${d.footerEmail || 'info@everestautohub.com.au'}`}>{d.footerEmail || 'info@everestautohub.com.au'}</a></li>
              <li><FiClock /> Mon–Sat: 8AM – 7PM</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>{d.footerCopyright || '© 2024 Everest Auto Hub. All rights reserved.'}</p>
          <p>Designed with ❤️ for car enthusiasts</p>
        </div>
      </div>
    </footer>
  );
}
