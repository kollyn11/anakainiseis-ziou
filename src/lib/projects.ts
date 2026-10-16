import { getCollection } from 'astro:content';

/**
 * All published projects, featured first, then newest first.
 * Folders starting with "_" (like _example) are already excluded by the
 * collection loader; the filter here is a second safety net.
 */
export async function getProjects() {
  const projects = await getCollection('projects', (p) => !p.id.startsWith('_'));
  return projects.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      b.data.date.getTime() - a.data.date.getTime(),
  );
}
