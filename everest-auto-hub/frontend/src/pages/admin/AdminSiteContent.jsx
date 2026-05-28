import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSave, FiX, FiPlus, FiTrash2, FiHome } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor';
import { SingleImageUploader, MultiImageUploader } from '../../components/MultiImageUploader';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (img) => img?.startsWith('/uploads') ? `${IMG_BASE}${img}` : img || null;

function Field({ label, fieldKey, value, onChange, multiline, placeholder }) {
  const s = {
    background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)',
    padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.88rem', width: '100%',
    fontFamily: 'var(--font-body)', resize: multiline ? 'vertical' : 'none', boxSizing: 'border-box', outline: 'none',
  };
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>{label}</label>
      {multiline
        ? <textarea rows={3} value={value || ''} onChange={e => onChange(fieldKey, e.target.value)} style={s} placeholder={placeholder} />
        : <input type="text" value={value || ''} onChange={e => onChange(fieldKey, e.target.value)} style={s} placeholder={placeholder} />
      }
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: '1.6rem', marginBottom: '1.2rem' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1.2rem' }}>{title}</h4>
      {children}
    </div>
  );
}

const TABS = [
  { key: 'home',        label: '🏠 Home Page' },
  { key: 'about',       label: '📖 About' },
  { key: 'services',    label: '🔧 Services' },
  { key: 'contact',     label: '📞 Contact' },
  { key: 'appointment', label: '📅 Appointment' },
  { key: 'shop',        label: '🛍️ Shop' },
  { key: 'footer',      label: '🦶 Footer' },
];

export default function AdminSiteContent() {
  const [form, setForm] = useState(null);       // site-content
  const [homeForm, setHomeForm] = useState(null); // home-content
  const [slideImages, setSlideImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    Promise.all([
      api.get('/site-content'),
      api.get('/home-content'),
    ]).then(([siteRes, homeRes]) => {
      setForm(siteRes.data);
      setHomeForm(homeRes.data);
      const slides = Array.isArray(homeRes.data.heroSlides) ? homeRes.data.heroSlides : [];
      setSlideImages(slides);
    }).catch(() => toast.error('Failed to load content'));
  }, []);

  // Site content handlers
  const handleChange = useCallback((key, value) => setForm(prev => ({ ...prev, [key]: value })), []);
  const handleUpload = useCallback((key, url) => { setForm(prev => ({ ...prev, [key]: url })); toast.success('Image uploaded'); }, []);
  const handleClear  = useCallback((key) => setForm(prev => ({ ...prev, [key]: '' })), []);

  // Home content handlers
  const handleHomeChange = useCallback((key, value) => setHomeForm(prev => ({ ...prev, [key]: value })), []);
  const handleHomeUpload = useCallback((key, url) => { setHomeForm(prev => ({ ...prev, [key]: url })); toast.success('Image uploaded'); }, []);
  const handleHomeClear  = useCallback((key) => setHomeForm(prev => ({ ...prev, [key]: '' })), []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const [siteRes, homeRes] = await Promise.all([
        api.put('/site-content', form),
        api.put('/home-content', { ...homeForm, heroSlides: slideImages }),
      ]);
      setForm(siteRes.data);
      setHomeForm(homeRes.data);
      const saved = Array.isArray(homeRes.data.heroSlides) ? homeRes.data.heroSlides : [];
      setSlideImages(saved);
      toast.success('All content saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  // Team helpers
  const updateTeamMember = (i, key, val) => {
    const team = [...(form.aboutTeam || [])];
    team[i] = { ...team[i], [key]: val };
    setForm(prev => ({ ...prev, aboutTeam: team }));
  };
  const addTeamMember    = () => setForm(prev => ({ ...prev, aboutTeam: [...(prev.aboutTeam || []), { name: '', role: '', exp: '', image: '' }] }));
  const removeTeamMember = (i) => setForm(prev => ({ ...prev, aboutTeam: prev.aboutTeam.filter((_, idx) => idx !== i) }));
  const uploadTeamImage  = async (i, file) => {
    const fd = new FormData(); fd.append('image', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateTeamMember(i, 'image', data.url);
      toast.success('Photo uploaded');
    } catch { toast.error('Upload failed'); }
  };

  // Why points helpers
  const updatePoint = (i, val) => { const pts = [...(form.apptWhyPoints || [])]; pts[i] = val; setForm(prev => ({ ...prev, apptWhyPoints: pts })); };
  const addPoint    = () => setForm(prev => ({ ...prev, apptWhyPoints: [...(prev.apptWhyPoints || []), ''] }));
  const removePoint = (i) => setForm(prev => ({ ...prev, apptWhyPoints: prev.apptWhyPoints.filter((_, idx) => idx !== i) }));

  if (!form || !homeForm) return (
    <div style={{ padding: '2rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="spinner" /> Loading...
    </div>
  );

  const inputStyle = {
    background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)',
    padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: '0.85rem',
    width: '100%', fontFamily: 'var(--font-body)', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div>
      <div className="admin-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiHome /> Site Content Manager</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)', background: tab === t.key ? 'var(--primary)' : 'var(--bg-2)', color: tab === t.key ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HOME PAGE ── */}
      {tab === 'home' && (
        <>
          <Section title="🖼️ Hero Slideshow Images">
            <MultiImageUploader
              label="Slideshow Images"
              images={slideImages}
              onChange={setSlideImages}
              hint="Upload multiple images — they auto-rotate every 5 seconds with Ken Burns zoom. If none uploaded, animated gradient slides are used."
            />
          </Section>

          <Section title="🚀 Hero Text">
            <RichTextEditor label="Badge Text" value={homeForm.heroBadge} onChange={val => handleHomeChange('heroBadge', val)} placeholder="Badge text above title..." />
            <RichTextEditor label="Subtitle" value={homeForm.heroSubtitle} onChange={val => handleHomeChange('heroSubtitle', val)} placeholder="Hero subtitle text..." />
          </Section>

          <Section title="🔧 Services Section Labels">
            <RichTextEditor label="Tag" value={homeForm.servicesSectionTag} onChange={val => handleHomeChange('servicesSectionTag', val)} placeholder="e.g. What We Do" />
            <RichTextEditor label="Title" value={homeForm.servicesSectionTitle} onChange={val => handleHomeChange('servicesSectionTitle', val)} placeholder="e.g. Our Services" />
            <RichTextEditor label="Subtitle" value={homeForm.servicesSectionSubtitle} onChange={val => handleHomeChange('servicesSectionSubtitle', val)} placeholder="Services section subtitle..." />
          </Section>

          <Section title="✅ Why Choose Us Section">
            <RichTextEditor label="Title" value={homeForm.whyTitle} onChange={val => handleHomeChange('whyTitle', val)} placeholder="e.g. Built on Trust & Expertise" />
            <RichTextEditor label="Description" value={homeForm.whySubtitle} onChange={val => handleHomeChange('whySubtitle', val)} placeholder="Why choose us description..." />
            <SingleImageUploader label="Workshop Image" fieldKey="whyImage" value={homeForm.whyImage} onUpload={handleHomeUpload} onClear={handleHomeClear} />
          </Section>

          <Section title="🛍️ Shop Banner Section">
            <RichTextEditor label="Tag" value={homeForm.shopBannerTag} onChange={val => handleHomeChange('shopBannerTag', val)} placeholder="e.g. Everest Clothing" />
            <RichTextEditor label="Title" value={homeForm.shopBannerTitle} onChange={val => handleHomeChange('shopBannerTitle', val)} placeholder="e.g. Wear Your Passion" />
            <RichTextEditor label="Description" value={homeForm.shopBannerSubtitle} onChange={val => handleHomeChange('shopBannerSubtitle', val)} placeholder="Shop banner description..." />
            <SingleImageUploader label="Banner Background Image" fieldKey="shopBannerImage" value={homeForm.shopBannerImage} onUpload={handleHomeUpload} onClear={handleHomeClear} />
          </Section>

          <Section title="📞 CTA Banner">
            <RichTextEditor label="Title" value={homeForm.ctaTitle} onChange={val => handleHomeChange('ctaTitle', val)} placeholder="e.g. Ready to Book Your Service?" />
            <RichTextEditor label="Subtitle" value={homeForm.ctaSubtitle} onChange={val => handleHomeChange('ctaSubtitle', val)} placeholder="CTA subtitle..." />
            <Field label="Phone Number" fieldKey="ctaPhone" value={homeForm.ctaPhone} onChange={handleHomeChange} />
          </Section>
        </>
      )}

      {/* ── ABOUT ── */}
      {tab === 'about' && (
        <>
          <Section title="Hero Banner">
            <RichTextEditor label="Tag" value={form.aboutHeroTag} onChange={val => handleChange('aboutHeroTag', val)} />
            <RichTextEditor label="Title" value={form.aboutHeroTitle} onChange={val => handleChange('aboutHeroTitle', val)} />
            <RichTextEditor label="Subtitle" value={form.aboutHeroSubtitle} onChange={val => handleChange('aboutHeroSubtitle', val)} />
            <MultiImageUploader
              label="Hero Background Images"
              images={Array.isArray(form.aboutHeroImage) ? form.aboutHeroImage : (form.aboutHeroImage ? [form.aboutHeroImage] : [])}
              onChange={imgs => handleChange('aboutHeroImage', imgs.length === 1 ? imgs[0] : imgs.length === 0 ? '' : imgs)}
              hint="Upload one or more images."
            />
          </Section>

          <Section title="Our Story Section">
            <RichTextEditor label="Tag" value={form.aboutWhoTag} onChange={val => handleChange('aboutWhoTag', val)} />
            <RichTextEditor label="Title" value={form.aboutWhoTitle} onChange={val => handleChange('aboutWhoTitle', val)} />
            <RichTextEditor label="Paragraph 1" value={form.aboutPara1} onChange={val => handleChange('aboutPara1', val)} placeholder="First paragraph..." />
            <RichTextEditor label="Paragraph 2" value={form.aboutPara2} onChange={val => handleChange('aboutPara2', val)} placeholder="Second paragraph..." />
            <SingleImageUploader label="Story Image" fieldKey="aboutImage" value={form.aboutImage} onUpload={handleUpload} onClear={handleClear} />
          </Section>

          <Section title="Team Section">
            <Field label="Tag" fieldKey="aboutTeamTag" value={form.aboutTeamTag} onChange={handleChange} />
            <Field label="Title" fieldKey="aboutTeamTitle" value={form.aboutTeamTitle} onChange={handleChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {(form.aboutTeam || []).map((m, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Name</label>
                      <input value={m.name} onChange={e => updateTeamMember(i, 'name', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Role</label>
                      <input value={m.role} onChange={e => updateTeamMember(i, 'role', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Experience</label>
                      <input value={m.exp} onChange={e => updateTeamMember(i, 'exp', e.target.value)} style={inputStyle} placeholder="e.g. 10 years" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {getImageUrl(m.image) ? (
                      <div style={{ position: 'relative', width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                        <img src={getImageUrl(m.image)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => updateTeamMember(i, 'image', '')}
                          style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                          <FiX size={10} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-3)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0, fontSize: '1.2rem' }}>
                        {m.name?.[0] || '?'}
                      </div>
                    )}
                    <label style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Upload Photo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadTeamImage(i, e.target.files[0])} />
                    </label>
                    <button type="button" onClick={() => removeTeamMember(i)}
                      style={{ marginLeft: 'auto', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                      <FiTrash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTeamMember}
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '10px', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                <FiPlus /> Add Team Member
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── SERVICES ── */}
      {tab === 'services' && (
        <Section title="Services Page Hero">
          <Field label="Tag" fieldKey="servicesHeroTag" value={form.servicesHeroTag} onChange={handleChange} />
          <Field label="Title" fieldKey="servicesHeroTitle" value={form.servicesHeroTitle} onChange={handleChange} />
          <Field label="Subtitle" fieldKey="servicesHeroSubtitle" value={form.servicesHeroSubtitle} onChange={handleChange} />
          <MultiImageUploader
            label="Hero Background Images"
            images={Array.isArray(form.servicesHeroImage) ? form.servicesHeroImage : (form.servicesHeroImage ? [form.servicesHeroImage] : [])}
            onChange={imgs => handleChange('servicesHeroImage', imgs.length === 1 ? imgs[0] : imgs.length === 0 ? '' : imgs)}
            hint="Upload one or more images for the services page hero."
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>
            💡 Individual services are managed in the <strong style={{ color: 'var(--text)' }}>Services</strong> section.
          </p>
        </Section>
      )}

      {/* ── CONTACT ── */}
      {tab === 'contact' && (
        <>
          <Section title="Hero Banner">
            <Field label="Tag" fieldKey="contactHeroTag" value={form.contactHeroTag} onChange={handleChange} />
            <Field label="Title" fieldKey="contactHeroTitle" value={form.contactHeroTitle} onChange={handleChange} />
            <Field label="Subtitle" fieldKey="contactHeroSubtitle" value={form.contactHeroSubtitle} onChange={handleChange} />
          </Section>
          <Section title="Contact Information">
            <Field label="Address" fieldKey="contactAddress" value={form.contactAddress} onChange={handleChange} multiline />
            <Field label="Phone 1" fieldKey="contactPhone1" value={form.contactPhone1} onChange={handleChange} placeholder="+61 2 9000 0000" />
            <Field label="Phone 2" fieldKey="contactPhone2" value={form.contactPhone2} onChange={handleChange} placeholder="+61 2 9111 1111" />
            <Field label="Email" fieldKey="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="info@everestautohub.com" />
            <Field label="Working Hours Line 1" fieldKey="contactHours1" value={form.contactHours1} onChange={handleChange} placeholder="Monday - Saturday: 8:00 AM - 7:00 PM" />
            <Field label="Working Hours Line 2" fieldKey="contactHours2" value={form.contactHours2} onChange={handleChange} placeholder="Sunday: 10:00 AM - 4:00 PM" />
          </Section>
          <Section title="Google Maps Embed (optional)">
            <Field label="Google Maps Embed URL" fieldKey="contactMapEmbed" value={form.contactMapEmbed} onChange={handleChange} placeholder="Paste Google Maps embed src URL here" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
              Go to Google Maps → Share → Embed a map → copy only the <code style={{ color: 'var(--primary)' }}>src="..."</code> URL
            </p>
            {form.contactMapEmbed && (
              <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <iframe src={form.contactMapEmbed} width="100%" height="200" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Map preview" />
              </div>
            )}
          </Section>
        </>
      )}

      {/* ── APPOINTMENT ── */}
      {tab === 'appointment' && (
        <>
          <Section title="Hero Banner">
            <Field label="Tag" fieldKey="apptHeroTag" value={form.apptHeroTag} onChange={handleChange} />
            <Field label="Title" fieldKey="apptHeroTitle" value={form.apptHeroTitle} onChange={handleChange} />
            <Field label="Subtitle" fieldKey="apptHeroSubtitle" value={form.apptHeroSubtitle} onChange={handleChange} />
            <MultiImageUploader
              label="Hero Background Images"
              images={Array.isArray(form.apptHeroImage) ? form.apptHeroImage : (form.apptHeroImage ? [form.apptHeroImage] : [])}
              onChange={imgs => handleChange('apptHeroImage', imgs.length === 1 ? imgs[0] : imgs.length === 0 ? '' : imgs)}
              hint="Upload one or more images for the appointment page hero."
            />
          </Section>
          <Section title="Why Book With Us Panel">
            <Field label="Section Title" fieldKey="apptWhyTitle" value={form.apptWhyTitle} onChange={handleChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {(form.apptWhyPoints || []).map((pt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={pt} onChange={e => updatePoint(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="e.g. Free vehicle inspection" />
                  <button type="button" onClick={() => removePoint(i)}
                    style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPoint}
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                <FiPlus /> Add Point
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Field label="Phone" fieldKey="apptPhone" value={form.apptPhone} onChange={handleChange} />
              <Field label="Email" fieldKey="apptEmail" value={form.apptEmail} onChange={handleChange} />
            </div>
          </Section>
        </>
      )}

      {/* ── SHOP ── */}
      {tab === 'shop' && (
        <Section title="Shop Page Hero">
          <Field label="Tag" fieldKey="shopHeroTag" value={form.shopHeroTag} onChange={handleChange} />
          <Field label="Title" fieldKey="shopHeroTitle" value={form.shopHeroTitle} onChange={handleChange} />
          <Field label="Subtitle" fieldKey="shopHeroSubtitle" value={form.shopHeroSubtitle} onChange={handleChange} />
          <MultiImageUploader
            label="Hero Background Images"
            images={Array.isArray(form.shopHeroImage) ? form.shopHeroImage : (form.shopHeroImage ? [form.shopHeroImage] : [])}
            onChange={imgs => handleChange('shopHeroImage', imgs.length === 1 ? imgs[0] : imgs.length === 0 ? '' : imgs)}
            hint="Upload one or more images for the shop page hero."
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>
            💡 Individual products are managed in the <strong style={{ color: 'var(--text)' }}>Products</strong> section.
          </p>
        </Section>
      )}

      {/* ── FOOTER ── */}
      {tab === 'footer' && (
        <>
          <Section title="Footer Content">
            <Field label="Tagline (below logo)" fieldKey="footerTagline" value={form.footerTagline} onChange={handleChange} multiline />
            <Field label="Phone" fieldKey="footerPhone" value={form.footerPhone} onChange={handleChange} />
            <Field label="Email" fieldKey="footerEmail" value={form.footerEmail} onChange={handleChange} />
            <Field label="Address" fieldKey="footerAddress" value={form.footerAddress} onChange={handleChange} />
            <Field label="Copyright Text" fieldKey="footerCopyright" value={form.footerCopyright} onChange={handleChange} />
          </Section>

          <Section title="📱 Social Media Links">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Paste the full URL for each platform. Leave blank to hide.
            </p>
            <Field label="Facebook URL" fieldKey="socialFacebook" value={form.socialFacebook} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
            <Field label="Instagram URL" fieldKey="socialInstagram" value={form.socialInstagram} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
            <Field label="Twitter / X URL" fieldKey="socialTwitter" value={form.socialTwitter} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
            <Field label="YouTube URL" fieldKey="socialYoutube" value={form.socialYoutube} onChange={handleChange} placeholder="https://youtube.com/@yourchannel" />
            <Field label="TikTok URL" fieldKey="socialTiktok" value={form.socialTiktok} onChange={handleChange} placeholder="https://tiktok.com/@yourhandle" />
          </Section>

          <Section title="📞 Floating Contact Button">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              These numbers appear when users click the floating phone button on your site.
            </p>
            <Field label="Phone Number (for Call button)" fieldKey="floatingPhone" value={form.floatingPhone} onChange={handleChange} placeholder="+61 2 9000 0000" />
            <Field label="WhatsApp Number (with country code, no spaces)" fieldKey="floatingWhatsapp" value={form.floatingWhatsapp} onChange={handleChange} placeholder="+61412345678" />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              WhatsApp example: +61412345678 (include country code, no spaces or dashes)
            </small>
          </Section>
        </>
      )}
    </div>
  );
}
