import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'EverestAutoHub';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://everest-auto-hub.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

/**
 * SEO component — drop into any page to set title, description, OG tags, etc.
 *
 * Props:
 *  title       — page title (appended with " | Everest Auto Hub")
 *  description — meta description (max ~160 chars)
 *  image       — OG image URL (defaults to logo)
 *  url         — canonical URL (defaults to current path)
 *  type        — OG type: "website" | "product" | "article" (default: "website")
 *  noIndex     — set true to block indexing (admin pages, cart, checkout)
 *  schema      — JSON-LD structured data object (optional)
 */
export default function SEO({ title, description, image, url, type = 'website', noIndex = false, schema }) {
  const fullTitle = title ? `${title} | EverestAutoHub` : `EverestAutoHub — Premium Auto Workshop & Clothing`;
  const metaDesc  = description || 'Everest Auto Hub — Expert auto repair, maintenance services and premium automotive lifestyle clothing in Australia.';
  const ogImage   = image || DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : undefined;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph (Facebook, WhatsApp, etc.) */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={SITE_NAME} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
