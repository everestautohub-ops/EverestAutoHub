import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Everest Auto Hub';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://everestautohub.com.au';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

// Page title map — what shows in browser tab and Google
const PAGE_TITLES = {
  '/':            'Everest Auto Hub — Expert Auto Repair & Clothing',
  '/services':    'Everest Auto Hub | Our Services',
  '/appointment': 'Everest Auto Hub | Book an Appointment',
  '/shop':        'Everest Auto Hub | Shop',
  '/about':       'Everest Auto Hub | About Us',
  '/contact':     'Everest Auto Hub | Contact Us',
  '/cart':        'Everest Auto Hub | Cart',
  '/checkout':    'Everest Auto Hub | Checkout',
  '/profile':     'Everest Auto Hub | My Profile',
  '/login':       'Everest Auto Hub | Login',
};

export default function SEO({ title, description, image, url, type = 'website', noIndex = false, schema }) {
  // Always start with "Everest Auto Hub"
  const fullTitle = title
    ? `Everest Auto Hub | ${title}`
    : (PAGE_TITLES[url] || 'Everest Auto Hub — Expert Auto Repair & Clothing');

  const metaDesc  = description || 'Everest Auto Hub — Expert auto repair, maintenance services and premium automotive lifestyle clothing.';
  const ogImage   = image || DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={metaDesc} />
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:type"         content={type} />
      <meta property="og:site_name"    content={SITE_NAME} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
