import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiCheckCircle, FiPhone, FiCalendar, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GiCarWheel, GiAutoRepair, GiMechanicGarage } from 'react-icons/gi';
import { motion } from 'framer-motion';
import api from '../utils/api';
import BrandLogo from '../components/BrandLogo';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';
import './Home.css';

const whyUsFeatures = [
  { icon: <GiAutoRepair size={32} />, title: 'Expert Technicians', desc: 'Certified mechanics with years of hands-on experience.' },
  { icon: <GiCarWheel size={32} />, title: 'Quality Parts', desc: 'We use only genuine and high-quality replacement parts.' },
  { icon: <GiMechanicGarage size={32} />, title: 'Modern Equipment', desc: 'State-of-the-art diagnostic and repair equipment.' },
  { icon: <FiCheckCircle size={32} />, title: 'Warranty Guaranteed', desc: 'All our services come with a satisfaction guarantee.' },
];

// Fallback gradient slides used when no images are uploaded
const FALLBACK_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a0808 60%, #0d0d0d 100%)',
    accent: 'rgba(249,115,22,0.18)',
  },
  {
    gradient: 'linear-gradient(135deg, #0a0a14 0%, #0d1a2a 60%, #0a0a14 100%)',
    accent: 'rgba(76,201,240,0.12)',
  },
  {
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 60%, #0a0a0a 100%)',
    accent: 'rgba(233,196,106,0.12)',
  },
];

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Hero Slideshow ────────────────────────────────────────────────────────────
function HeroSlideshow({ slides }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setPrev(current);
    setCurrent(idx);
    setAnimating(true);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 1000);
  }, [current, animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const back = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  return (
    <div className="hero-slideshow">
      {/* Render all slides, only active ones are visible */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === current ? 'active' : ''} ${i === prev ? 'leaving' : ''}`}
          style={slide.url
            ? { backgroundImage: `url(${slide.url})` }
            : { background: slide.gradient }
          }
        >
          {/* Ken Burns zoom layer */}
          <div className="hero-slide-zoom" />
          {/* Accent glow */}
          <div className="hero-slide-accent" style={{ background: `radial-gradient(ellipse at 70% 50%, ${slide.accent || 'rgba(249,115,22,0.12)'} 0%, transparent 65%)` }} />
        </div>
      ))}

      {/* Dark overlay always on top of slides */}
      <div className="hero-slide-overlay" />

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button className="hero-nav hero-nav-prev" onClick={back} aria-label="Previous slide">
            <FiChevronLeft size={22} />
          </button>
          <button className="hero-nav hero-nav-next" onClick={next} aria-label="Next slide">
            <FiChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/services')
      .then(r => setServices(r.data.slice(0, 6)))
      .catch(err => console.error('Failed to fetch services:', err));
    api.get('/products/featured').then(r => {
      const safeArr = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v || '[]') : []);
      setProducts(r.data.slice(0, 4).map(p => ({ ...p, images: safeArr(p.images) })));
    }).catch(err => console.error('Failed to fetch products:', err));
    api.get('/reviews')
      .then(r => setReviews(r.data.slice(0, 3)))
      .catch(err => console.error('Failed to fetch reviews:', err));
    api.get('/home-content', { params: { _t: Date.now() } }).then(r => {
      setContent(r.data);
      // heroSlides is the dedicated JSON array for the slideshow
      const slides = Array.isArray(r.data.heroSlides) ? r.data.heroSlides : [];
      // Also include whyImage and shopBannerImage as extra slides if available
      const extras = [r.data.whyImage, r.data.shopBannerImage]
        .filter(Boolean)
        .map(img => img.startsWith('/uploads') ? `${IMG_BASE}${img}` : img);
      const allUrls = [
        ...slides.map(img => img.startsWith('/uploads') ? `${IMG_BASE}${img}` : img),
        ...extras.filter(u => !slides.includes(u)),
      ];
      setHeroSlides(allUrls.length > 0
        ? allUrls.map(url => ({ url, accent: 'rgba(249,115,22,0.12)' }))
        : FALLBACK_SLIDES
      );
    }).catch(() => setHeroSlides(FALLBACK_SLIDES));
  }, []);



  const c = content || {};
  const heroBadge    = c.heroBadge    || "🇦🇺 Australia's Premier Auto Workshop";
  const heroSubtitle = c.heroSubtitle || "Expert auto repair, maintenance & your favorite automotive lifestyle brand. We keep your ride smooth and your style sharp.";

  const servicesSectionTag      = c.servicesSectionTag      || 'What We Do';
  const servicesSectionTitle    = c.servicesSectionTitle    || 'Our Services';
  const servicesSectionSubtitle = c.servicesSectionSubtitle || 'Professional auto care services to keep your vehicle in peak condition';

  const whyTitle    = c.whyTitle    || 'Built on Trust & Expertise';
  const whySubtitle = c.whySubtitle || "At Everest Auto Hub, we combine technical expertise with genuine care for your vehicle.";
  const whyImage    = getImageUrl(c.whyImage);

  const shopBannerTag      = c.shopBannerTag      || 'Everest Clothing';
  const shopBannerTitle    = c.shopBannerTitle    || 'Wear Your Passion';
  const shopBannerSubtitle = c.shopBannerSubtitle || 'Exclusive automotive lifestyle clothing.';
  const shopBannerImage    = getImageUrl(c.shopBannerImage);

  const ctaTitle    = c.ctaTitle    || 'Ready to Book Your Service?';
  const ctaSubtitle = c.ctaSubtitle || 'Schedule your appointment today and get your vehicle back in top shape.';
  const ctaPhone    = c.ctaPhone    || '+61 2 9000 0000';

  const renderText = (text, className, style) => {
    if (!text) return null;
    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    if (isHtml) return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: text }} />;
    return <span className={className} style={style}>{text}</span>;
  };

  return (
    <div className="home">
      <SEO
        title="Premium Auto Workshop & Clothing"
        description="Everest Auto Hub — Expert auto repair, maintenance services and premium automotive lifestyle clothing. Book your appointment today."
        url="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AutoRepair',
          name: 'Everest Auto Hub',
          description: 'Expert auto repair, maintenance services and premium automotive lifestyle clothing.',
          url: 'https://everest-auto-hub.vercel.app',
          telephone: ctaPhone,
          address: { '@type': 'PostalAddress', addressCountry: 'AU' },
        }}
      />      {/* Hero */}
      <section className="hero">
        {/* Slideshow background */}
        {heroSlides.length > 0 && <HeroSlideshow slides={heroSlides} />}

        <motion.div 
          className="container hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-badge">
            <span>{heroBadge}</span>
          </div>
          <h1 className="hero-title">
            <BrandLogo size="hero" />
          </h1>
          <div className="hero-subtitle">
            {renderText(heroSubtitle)}
          </div>
          <div className="hero-actions">
            <Link to="/appointment" className="btn-primary">
              <FiCalendar /> Book Appointment
            </Link>
            <Link to="/services" className="btn-outline">
              Our Services <FiArrowRight />
            </Link>
          </div>
        </motion.div>
        <div className="hero-scroll">
          <div className="scroll-indicator" />
        </div>
      </section>

      {/* Services */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">{servicesSectionTag}</p>
            <h2 className="section-title">{servicesSectionTitle.includes('Services')
              ? <>{servicesSectionTitle.replace('Services', '')}<span>Services</span></>
              : servicesSectionTitle}
            </h2>
            <div className="section-subtitle">{renderText(servicesSectionSubtitle)}</div>
          </div>
          <motion.div 
            className="grid-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {services.map(s => (
              <motion.div 
                key={s._id} 
                className="service-card card"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
              >
                {getImageUrl(s.image) ? (
                  <div className="service-card-img">
                    <img src={getImageUrl(s.image)} alt={s.name} />
                  </div>
                ) : (
                  <div className="service-icon">🔧</div>
                )}
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="service-footer">
                  <span className="service-price">{formatPrice(s.price)}</span>
                  <span className="service-duration">{s.duration}</span>
                </div>
                <Link to="/appointment" className="service-book">Book Now <FiArrowRight /></Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="section-cta">
            <Link to="/services" className="btn-outline">View All Services <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-text">
              <p className="section-tag">Why Everest Auto Hub</p>
              <h2 className="section-title">{whyTitle}</h2>
              <div style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
                {renderText(whySubtitle)}
              </div>
              <motion.div 
                className="why-features"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.1 } }
                }}
              >
                {whyUsFeatures.map((w, i) => (
                  <motion.div 
                    key={i} 
                    className="why-feature"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                    }}
                  >
                    <div className="why-icon">{w.icon}</div>
                    <div>
                      <h4>{w.title}</h4>
                      <p>{w.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <Link to="/appointment" className="btn-primary" style={{ marginTop: '1.5rem' }}>
                <FiPhone /> Call Us Now
              </Link>
            </div>
            <motion.div 
              className="why-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="why-img-box">
                {whyImage ? (
                  <img src={whyImage} alt="Workshop" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                ) : (
                  <div className="why-img-placeholder">
                    <GiMechanicGarage size={120} />
                    <p>Everest Auto Hub Workshop</p>
                  </div>
                )}
                <div className="why-badge-float" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop Banner */}
      <section className="shop-banner" style={shopBannerImage ? { backgroundImage: `url(${shopBannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <div className="shop-banner-inner">
            <div className="shop-banner-text">
              <p className="section-tag">{shopBannerTag}</p>
              <h2 className="section-title">
                {shopBannerTitle.includes('Passion')
                  ? <>Wear Your <span>Passion</span></>
                  : shopBannerTitle}
              </h2>
              <div>{renderText(shopBannerSubtitle)}</div>
              <Link to="/shop" className="btn-primary">
                <FiShoppingBag /> Shop Now
              </Link>
            </div>
            <div className="shop-banner-products">
              {products.map(p => (
                <Link to={`/shop/${p._id}`} key={p._id} className="mini-product-card">
                  <div className="mini-product-img">
                    {getImageUrl(p.images?.[0]) ? (
                      <img src={getImageUrl(p.images[0])} alt={p.name} />
                    ) : (
                      <div className="img-placeholder">👕</div>
                    )}
                  </div>
                  <div className="mini-product-info">
                    <span>{p.name}</span>
                    <strong>{formatPrice(p.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="section reviews-section">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">Testimonials</p>
              <h2 className="section-title">What Our <span>Customers</span> Say</h2>
            </div>
            <motion.div 
              className="grid-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {reviews.map(r => (
                <motion.div 
                  key={r._id} 
                  className="review-card card"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                  }}
                >
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} fill={i < r.rating ? '#ffd60a' : 'none'} color={i < r.rating ? '#ffd60a' : '#555'} />
                    ))}
                  </div>
                  <p className="review-comment">"{r.comment}"</p>
                  <div className="review-author">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div>
                      <strong>{r.name}</strong>
                      <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2>{ctaTitle.includes('Service')
                ? <>{ctaTitle.replace('Service?', '')}<span>Service?</span></>
                : ctaTitle}
              </h2>
              <div>{renderText(ctaSubtitle)}</div>
            </div>
            <div className="cta-actions">
              <Link to="/appointment" className="btn-primary">
                <FiCalendar /> Book Now
              </Link>
              <a href={`tel:${ctaPhone.replace(/\s/g, '')}`} className="btn-outline">
                <FiPhone /> {ctaPhone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
