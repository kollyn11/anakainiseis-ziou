import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { serviceNames } from './data/services';

/**
 * Projects (Έργα): one folder per project in src/content/projects/,
 * holding an index.md plus its photos. Folders starting with "_" are
 * ignored, so `_example/` documents the format without being published.
 * The folder name becomes the URL: /erga/<folder-name>/
 */
const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: ['*/index.md', '!_*/**'],
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(3),
        location: z.string().min(2),
        date: z.coerce.date(),
        services: z.array(z.enum(serviceNames)).min(1),
        cover: image(),
        coverAlt: z.string().min(3),
        gallery: z
          .array(z.object({ image: image(), alt: z.string().min(3) }))
          .default([]),
        before: image().optional(),
        after: image().optional(),
        beforeAfterAlt: z.string().optional(),
        summary: z.string().min(10),
        featured: z.boolean().default(false),
      })
      .refine((p) => Boolean(p.before) === Boolean(p.after), {
        message: 'Το "before" και το "after" μπαίνουν μαζί — συμπληρώστε και τα δύο ή κανένα.',
      }),
});

export const collections = { projects };
