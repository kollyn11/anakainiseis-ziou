import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.name,
        short_name: 'ΖΙΟΥ',
        description: 'Ανακαινίσεις, χρωματισμοί, γυψοσανίδες, θερμοπροσόψεις και μονώσεις στην Αττική.',
        lang: 'el',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#14325C',
        theme_color: '#14325C',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
