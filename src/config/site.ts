/**
 * Single source of truth for all business data.
 * Every page, component, meta tag and JSON-LD block reads from here.
 * Change a value once and it updates everywhere.
 */

export const site = {
  /** Canonical site URL — change this when the custom domain is connected (e.g. https://anakainiseis-ziou.gr). */
  url: 'https://anakainiseis-ziou.netlify.app',

  /** GitHub repository (owner/name) the CMS at /admin saves projects to. */
  repo: 'kollyn11/anakainiseis-ziou',

  name: 'ΖΙΟΥ Ανακαινίσεις',
  nameLatin: 'Ziou Renovations',
  slug: 'anakainiseis-ziou',
  tagline: 'Χτίζουμε σωστά.',
  foundingYear: 2025,

  phone: {
    display: '698 776 1914',
    /** E.164 format, used for tel:, Viber and WhatsApp links. */
    e164: '+306987761914',
    /** International display format used in structured data. */
    international: '+30 698 776 1914',
  },

  email: 'zioufanis@gmail.com',

  instagram: {
    handle: 'anakainiseis_ziou',
    url: 'https://www.instagram.com/anakainiseis_ziou/',
  },

  /** Areas served, in display order. */
  areas: ['Αθήνα', 'Δυτική Αττική', 'Ελευσίνα'],
  region: 'Αττική',

  // TODO(owner): Owner's full name. Not rendered anywhere while null.
  ownerName: null as string | null,

  // TODO(owner): Business address (street, number, postal code, city). Not rendered anywhere while null.
  // When filled in, also add it to the Google Business Profile with exactly the same spelling.
  address: null as null | {
    street: string;
    postalCode: string;
    locality: string;
  },

  // TODO(owner): Tax ID (ΑΦΜ) if you want it shown in the footer. Not rendered while null.
  vatId: null as string | null,
} as const;

export const links = {
  tel: `tel:${site.phone.e164}`,
  mailto: `mailto:${site.email}`,
  viber: `viber://chat?number=${encodeURIComponent(site.phone.e164)}`,
  whatsapp: `https://wa.me/${site.phone.e164.replace('+', '')}`,
} as const;
