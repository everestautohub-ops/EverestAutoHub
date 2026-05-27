import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiPhone, FiMail, FiClock, FiExternalLink } from 'react-icons/fi';
import api from '../utils/api';
import RichText from '../components/RichText';
import SEO from '../components/SEO';
import './About.css';

import { getImageUrl } from '../utils/imageUrl';

const imgUrl = (img) => getImageUrl(img);

// Converts any Google Maps URL or address into a working embed
function buildEmbedUrl(src, address) {
  // If it's a proper Google embed URL already
  if (src && src.includes('google.com/maps/embed')) return { type: 'google', url: src };

  // For any other URL or address, use Google Maps query embed (works everywhere, no API key needed)
  const query = address || src || '';
  if (!query) return null;
  const encoded = encodeURIComponent(query);
  return {
    type: 'google',
    url: `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
  };
}

function buildDirectionsUrl(address) {
  if (!address) return 'https://maps.google.com';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function MapEmbed({ src, address }) {
  const embed = buildEmbedUrl(src, address);
  const directionsUrl = buildDirectionsUrl(address || src);

  if (!embed) {
    return (
      <div className="about-map-placeholder">
        <FiMapPin size={48} />
        <p>No location set</p>
        <small>Go to Admin → Site Content → Contact tab to add your address.</small>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380 }}>
      <iframe
        src={embed.url}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block', minHeight: 380 }}
        allowFullScreen
        loading="lazy"
        title="Our Location"
      />
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="map-open-btn"
        title="Open in Google Maps"
      >
        <FiExternalLink size={14} /> Open in Google Maps
      </a>
    </div>
  );
}

export default function About() {
  const [c, setC] = useState(null);

  useEffect(() => {
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};

  return (
    <div className="about-page">
      <SEO
        title="About Us — Our Story & Team"
        description="Learn about Everest Auto Hub — Australia's trusted auto workshop and clothing brand. Meet our expert mechanics and discover our story."
        url="/about"
      />
      <div className="page-hero" style={imgUrl(d.aboutHeroImage) ? { backgroundImage: `url(${imgUrl(d.aboutHeroImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <p className="section-tag">{d.aboutHeroTag || 'Our Story'}</p>
          <h1 className="section-title">About <span>Everest Auto Hub</span></h1>
          <p className="section-subtitle">{d.aboutHeroSubtitle || 'Driven by passion, built on trust'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 20px' }}>
        <div className="about-story">
          <div className="about-text">
            <p className="section-tag">{d.aboutWhoTag || 'Who We Are'}</p>
            <h2 className="section-title">{d.aboutWhoTitle || "Australia's Most Trusted Auto Workshop"}</h2>
            <RichText html={d.aboutPara1 || "Founded over a decade ago, Everest Auto Hub has grown from a small garage to one of Australia's most trusted automotive service centres."} />
            {d.aboutPara2 && <RichText html={d.aboutPara2} style={{ marginTop: '1rem' }} />}
            <Link to="/appointment" className="btn-primary" style={{ marginTop: '2rem' }}>
              Book a Service <FiArrowRight />
            </Link>
          </div>
          <div className="about-img-box">
            {imgUrl(d.aboutImage) ? (
              <img src={imgUrl(d.aboutImage)} alt="About Everest Auto Hub" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
            ) : (
              <div className="about-img-placeholder">⛰<br /><span>Everest Auto Hub</span></div>
            )}
          </div>
        </div>

        {/* Team */}
        {(d.aboutTeam?.length > 0) && (
          <div className="team-section">
            <div className="section-header">
              <p className="section-tag">{d.aboutTeamTag || 'Our Team'}</p>
              <h2 className="section-title">Meet Our <span>Experts</span></h2>
            </div>
            <div className="grid-4">
              {d.aboutTeam.map((m, i) => (
                <div key={i} className="team-card card">
                  {imgUrl(m.image) ? (
                    <img src={imgUrl(m.image)} alt={m.name} className="team-avatar-img" />
                  ) : (
                    <div className="team-avatar">{m.name?.[0] || '?'}</div>
                  )}
                  <h4>{m.name}</h4>
                  <p>{m.role}</p>
                  <span>{m.exp} experience</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Find Us / Map Section */}
        <div className="about-location">
          <div className="section-header">
            <p className="section-tag">Find Us</p>
            <h2 className="section-title">Our <span>Location</span></h2>
          </div>
          <div className="about-location-inner">
            {/* Contact info */}
            <div className="about-location-info card">
              <h3>Visit Our Workshop</h3>
              <ul className="about-contact-list">
                <li>
                  <div className="about-contact-icon"><FiMapPin /></div>
                  <div>
                    <strong>Address</strong>
                    <p>{d.contactAddress || '123 Workshop Street, Sydney NSW 2000, Australia'}</p>
                  </div>
                </li>
                <li>
                  <div className="about-contact-icon"><FiPhone /></div>
                  <div>
                    <strong>Phone</strong>
                    {d.contactPhone1 && <p><a href={`tel:${d.contactPhone1.replace(/\s/g,'')}`}>{d.contactPhone1}</a></p>}
                    {d.contactPhone2 && <p><a href={`tel:${d.contactPhone2.replace(/\s/g,'')}`}>{d.contactPhone2}</a></p>}
                  </div>
                </li>
                <li>
                  <div className="about-contact-icon"><FiMail /></div>
                  <div>
                    <strong>Email</strong>
                    <p><a href={`mailto:${d.contactEmail || 'info@everestautohub.com'}`}>{d.contactEmail || 'info@everestautohub.com'}</a></p>
                  </div>
                </li>
                <li>
                  <div className="about-contact-icon"><FiClock /></div>
                  <div>
                    <strong>Working Hours</strong>
                    {d.contactHours1 && <p>{d.contactHours1}</p>}
                    {d.contactHours2 && <p>{d.contactHours2}</p>}
                  </div>
                </li>
              </ul>
              <Link to="/contact" className="btn-outline" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                Get Directions <FiArrowRight />
              </Link>
            </div>

            {/* Map */}
            <div className="about-map-wrap">
              {d.contactMapEmbed ? (
                <MapEmbed src={d.contactMapEmbed} address={d.contactAddress} />
              ) : d.contactAddress ? (
                <MapEmbed src={null} address={d.contactAddress} />
              ) : (
                <div className="about-map-placeholder">
                  <FiMapPin size={48} />
                  <p>Map not configured yet.</p>
                  <small>Go to Admin → Site Content → Contact tab to add your Google Maps embed URL.</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}