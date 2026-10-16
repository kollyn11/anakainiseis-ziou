/** JSON-LD builders. All business facts come from src/config/site.ts. */
import { site } from '../config/site';
import { services } from '../data/services';
import { faq } from '../data/faq';

export const abs = (path: string) => new URL(path, site.url).href;

export const businessId = abs('/#business');
export const websiteId = abs('/#website');

export function businessSchema() {
  const business: Record<string, unknown> = {
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId,
    name: site.name,
    alternateName: site.nameLatin,
    slogan: site.tagline,
    url: abs('/'),
    logo: abs('/icon-512.png'),
    image: abs('/og-image.png'),
    telephone: site.phone.international,
    email: site.email,
    foundingDate: String(site.foundingYear),
    sameAs: [site.instagram.url],
    areaServed: [
      { '@type': 'AdministrativeArea', name: site.region },
      ...site.areas.map((name) => ({ '@type': 'City', name })),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Υπηρεσίες',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.description,
          areaServed: site.region,
          provider: { '@id': businessId },
        },
      })),
    },
  };

  if (site.address) {
    business.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.region,
      addressCountry: 'GR',
    };
  }
  if (site.ownerName) {
    business.founder = { '@type': 'Person', name: site.ownerName };
  }
  return business;
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: abs('/'),
    name: site.name,
    inLanguage: 'el-GR',
    publisher: { '@id': businessId },
  };
}

export function faqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': abs('/#faq'),
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
