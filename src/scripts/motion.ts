/**
 * Page motion: Lenis smooth scrolling + the scroll-driven header runner,
 * both driven from one requestAnimationFrame loop.
 *
 * - Lenis smooths wheel scrolling; touch scrolling stays native (Lenis default).
 * - prefers-reduced-motion: Lenis switches smoothing off itself and the runner stays in its drawn pose.
 * - In-page anchor links (#x and /#x on the home page) scroll smoothly; Lenis honours the
 *   CSS scroll-padding-top in global.css, which keeps sections clear of the sticky header.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createRunner, type Runner } from './runner';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const lenis = new Lenis({
  autoRaf: false, // driven by the loop below
  lerp: 0.12,
  wheelMultiplier: 1,
  respectReducedMotion: true,
});


// ---------------------------------------------------------------- anchors
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link || link.classList.contains('skip-link') || link.target === '_blank') return;

  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;

  e.preventDefault();
  history.pushState(null, '', url.hash);
  lenis.scrollTo(target, {

    onComplete: () => {
      // Move keyboard focus to the section without jumping the scroll position again
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    },
  });
});

// ---------------------------------------------------------------- runner
const runners: Runner[] = Array.from(document.querySelectorAll<SVGSVGElement>('[data-runner]'), createRunner);

// ---------------------------------------------------------------- loop
let lastTime = performance.now();
let lastScroll = window.scrollY;
let velocity = 0; // px/s, smoothed

function frame(time: number) {
  lenis.raf(time);

  const dt = Math.max(1, time - lastTime);
  const y = window.scrollY;
  // Measure from the real scroll position so wheel, touch, keyboard and scrollbar drags all count
  const instant = ((y - lastScroll) / dt) * 1000;
  velocity += (instant - velocity) * 0.35;
  lastScroll = y;
  lastTime = time;

  // With reduced motion the runner gets no input, so it stays in (or eases back to) its drawn pose
  const drive = reducedMotion.matches ? 0 : velocity;
  for (const r of runners) r.update(drive, dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

