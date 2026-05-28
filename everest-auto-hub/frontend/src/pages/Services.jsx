import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './Services.css';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [c, setC] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/services')
      .then(r => { setServices(r.data); setLoading(false); })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        toast.error('Failed to load services. Please check connection.');
        setLoading(false);
      });
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};


  return (
    <div className="services-page">
      <SEO
        title="Our Services"
        description="Professional auto repair and maintenance services including oil change, brake service, engine diagnostics, tire rotation, AC service and full car service."
        url="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Everest Auto Hub Services',
          itemListElement: services.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.name,
            description: s.description,
          })),
        }}
      />
      <div className="page-hero" style={d.servicesHeroImage ? { backgroundImage: `url(${getImageUrl(d.servicesHeroImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <p className="section-tag">{d.servicesHeroTag || 'What We Offer'}</p>
          <h1 className="section-title">Our <span>Services</span></h1>
          <p className="section-subtitle">{d.servicesHeroSubtitle || 'Professional auto care from certified mechanics'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        {loading ? <div className="spinner" /> : (
          <motion.div 
            className="grid-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {services.map(s => (
              <motion.div 
                key={s._id} 
                className="service-detail-card card"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
              >
                {getImageUrl(s.image) ? (
                  <div className="sdc-img"><img src={getImageUrl(s.image)} alt={s.name} /></div>
                ) : (
                  <div className="sdc-icon">🔧</div>
                )}
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="sdc-meta">
                  <span><FiDollarSign /> {formatPrice(s.price)}</span>
                  <span><FiClock /> {s.duration}</span>
                </div>
                <Link to="/appointment" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                  Book This Service <FiArrowRight />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
