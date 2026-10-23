/**
 * Work photos for the projects section (src/assets/erga/<category>/).
 *
 * Labelling rules, applied to file names:
 * - "before" photo: name contains before / πριν / πρίν (any case)
 * - "after" photo:  name contains after / μετα / μετά (any case)
 * - a pair = one before + one after with the same number in the name (e.g. 3_before.jpg, 3_after.jpg)
 * Only complete pairs get ΠΡΙΝ/ΜΕΤΑ badges; every other photo is shown as is, without a label.
 */
import type { ImageMetadata } from 'astro';
import { workPhotoAlt, workCategories } from '../data/work-photos';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/erga/*/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

export interface WorkPhoto {
  key: string; // "<category>/<file name without extension>"
  category: string; // display name, e.g. "Χρωματισμοί"
  image: ImageMetadata;
  alt: string;
}

export interface WorkPair {
  number: string;
  category: string;
  before: WorkPhoto;
  after: WorkPhoto;
}

const kindOf = (name: string): 'before' | 'after' | null => {
  const n = name.toLowerCase();
  if (/before|πριν|πρίν/.test(n)) return 'before';
  if (/after|μετα|μετά/.test(n)) return 'after';
  return null;
};

export function getWorkPhotos() {
  const photos = Object.entries(files)
    .map(([path, mod]) => {
      const [, folder, base] = path.match(/\/erga\/([^/]+)\/([^/]+)\.\w+$/)!;
      const key = `${folder}/${base}`;
      return {
        key,
        base,
        folder,
        photo: {
          key,
          category: workCategories[folder] ?? folder,
          image: mod.default,
          alt: workPhotoAlt[key] ?? '',
        } satisfies WorkPhoto,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key, 'el', { numeric: true }));

  // Group candidates by folder + number. A pair needs exactly one "before" and one "after";
  // two "before" files with the same number would be ambiguous, so none of them is labelled.
  type Entry = (typeof photos)[number];
  const slots = new Map<string, { before: Entry[]; after: Entry[] }>();
  for (const p of photos) {
    const kind = kindOf(p.base);
    const number = p.base.match(/\d+/)?.[0];
    if (!kind || !number) continue;
    const id = `${p.folder}#${number}`;
    const slot = slots.get(id) ?? { before: [], after: [] };
    slot[kind].push(p);
    slots.set(id, slot);
  }

  const pairs: WorkPair[] = [];
  const paired = new Set<string>();
  for (const [id, slot] of slots) {
    if (slot.before.length !== 1 || slot.after.length !== 1) continue;
    const [before] = slot.before;
    const [after] = slot.after;
    pairs.push({ number: id.split('#')[1], category: before.photo.category, before: before.photo, after: after.photo });
    paired.add(before.key).add(after.key);
  }
  pairs.sort((a, b) => Number(a.number) - Number(b.number));

  const singles = photos.filter((p) => !paired.has(p.key)).map((p) => p.photo);
  return { pairs, singles };
}
