/* js/script.js
   Media loader + sync logic for Phase 1→5 integration
   - Injects video/gif/lottie into .media-container
   - Adds badge overlay and floating animation (CSS)
   - Syncs media playback to progress sequence when requested
   - No external network calls; assets must be placed locally
*/

/* Utilities */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Progress sequence used across the UI */
const progressSequence = [61,63,65,67,69,71,73,75];
let progressIndex = 0;

/* DOM refs for progress sync */
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');

/* Helper: set global progress UI */
function setGlobalProgress(value) {
  if (!progressFill || !progressPercent) return;
  progressFill.style.width = `${value}%`;
  progressPercent.textContent = `${value}%`;
}

/* Map a 0..1 ratio to the progressSequence (returns integer percent) */
function mapRatioToProgress(ratio) {
  // Map ratio to index in progressSequence, then interpolate to next value
  const len = progressSequence.length;
  if (len === 0) return 0;
  const pos = ratio * (len - 1);
  const i = Math.floor(pos);
  const t = pos - i;
  const a = progressSequence[i];
  const b = progressSequence[Math.min(i + 1, len - 1)];
  return Math.round(a + (b - a) * t);
}

/* Create badge element */
function createBadge(text) {
  const badge = document.createElement('div');
  badge.className = 'media-badge';
  badge.textContent = text || 'LIVE';
  // choose style by text heuristics
  const t = (text || '').toLowerCase();
  if (t.includes('active')) badge.classList.add('media-badge--active');
  else if (t.includes('work') || t.includes('working')) badge.classList.add('media-badge--working');
  else if (t.includes('upgrad')) badge.classList.add('media-badge--upgrading');
  return badge;
}

/* Inject media element into container */
function injectMedia(container) {
  const type = (container.dataset.assetType || '').toLowerCase();
  const src = container.dataset.assetSrc || '';
  const badgeText = container.dataset.badge || '';
  const shouldSync = container.dataset.sync === 'progress';

  // clear container
  container.innerHTML = '';

  // add badge
  const badge = createBadge(badgeText);
  container.appendChild(badge);

  // create wrapper for the actual media element
  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'media-inner';
  mediaWrapper.style.width = '100%';
  mediaWrapper.style.height = '100%';
  mediaWrapper.style.position = 'relative';
  mediaWrapper.style.zIndex = '2';
  container.appendChild(mediaWrapper);

  // helper to attach sync listeners
  function attachSync(mediaEl) {
    if (!shouldSync) return;
    // if media has duration, map currentTime/duration to progress
    if (mediaEl.tagName === 'VIDEO' || mediaEl.tagName === 'AUDIO') {
      mediaEl.addEventListener('timeupdate', () => {
        if (!mediaEl.duration || isNaN(mediaEl.duration) || mediaEl.duration === Infinity) return;
        const ratio = Math.min(1, Math.max(0, mediaEl.currentTime / mediaEl.duration));
        const p = mapRatioToProgress(ratio);
        setGlobalProgress(p);
      });
      // when video loops, optionally advance progressIndex to keep global loop moving
      mediaEl.addEventListener('ended', () => {
        // no-op: video loops automatically; progress will update on timeupdate
      });
    } else if (mediaEl.tagName === 'CANVAS' && window.lottie) {
      // Lottie: use frame events if available
      try {
        const anim = mediaEl.__lottieInstance;
        if (anim && anim.totalFrames) {
          anim.addEventListener('enterFrame', (e) => {
            const ratio = (e.currentTime || 0) / anim.totalFrames;
            const p = mapRatioToProgress(ratio);
            setGlobalProgress(p);
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // create media based on type
  if (type === 'video' || /\.webm|\.mp4|\.mov$/i.test(src)) {
    // create <video> element
    const video = document.createElement('video');
    video.className = 'media-element';
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    // autoplay policy: attempt to play
    video.addEventListener('canplay', () => {
      if (!prefersReduced) {
        const p = video.play();
        if (p && p.catch) p.catch(() => { /* autoplay blocked; user interaction required */ });
      }
    });
    mediaWrapper.appendChild(video);
    attachSync(video);
    return video;
  }

  if (type === 'gif' || /\.gif$/i.test(src)) {
    // GIF fallback: use <img>
    const img = document.createElement('img');
    img.className = 'media-element';
    img.src = src;
    img.alt = container.getAttribute('aria-label') || 'Animation';
    img.setAttribute('aria-hidden', 'true');
    mediaWrapper.appendChild(img);
    // GIFs cannot be time-synced reliably; skip sync
    return img;
  }

  if (type === 'lottie' || /\.json$/i.test(src)) {
    // Lottie: requires lottie.min.js to be loaded locally (window.lottie)
    if (window.lottie) {
      // create a canvas/div for lottie
      const lottieHolder = document.createElement('div');
      lottieHolder.style.width = '100%';
      lottieHolder.style.height = '100%';
      lottieHolder.style.pointerEvents = 'none';
      mediaWrapper.appendChild(lottieHolder);

      // load animation
      const anim = window.lottie.loadAnimation({
        container: lottieHolder,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: src
      });

      // attach instance for sync
      lottieHolder.__lottieInstance = anim;
      attachSync(lottieHolder);

      return lottieHolder;
    } else {
      // fallback: show a poster placeholder and a small note in console
      const fallback = document.createElement('div');
      fallback.className = 'media-element';
      fallback.style.display = 'flex';
      fallback.style.alignItems = 'center';
      fallback.style.justifyContent = 'center';
      fallback.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
      fallback.style.color = 'rgba(255,255,255,0.7)';
      fallback.style.fontWeight = '700';
      fallback.textContent = 'Lottie asset (lottie.min.js not loaded)';
      mediaWrapper.appendChild(fallback);
      console.warn('Lottie requested but window.lottie is not available. Include lottie.min.js locally to enable Lottie playback.');
      return fallback;
    }
  }

  // Default fallback: show a neutral poster box
  const poster = document.createElement('div');
  poster.className = 'media-element';
  poster.style.display = 'flex';
  poster.style.alignItems = 'center';
  poster.style.justifyContent = 'center';
  poster.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
  poster.style.color = 'rgba(255,255,255,0.7)';
  poster.style.fontWeight = '700';
  poster.textContent = 'Media asset not found';
  mediaWrapper.appendChild(poster);
  console.warn('Media container: unknown asset type or missing src:', type, src);
  return poster;
}

/* Initialize all media containers on the page */
function initMediaContainers() {
  const containers = document.querySelectorAll('.media-container');
  containers.forEach(container => {
    // ensure container has role and accessible label
    if (!container.getAttribute('role')) container.setAttribute('role', 'img');
    if (!container.getAttribute('aria-label')) container.setAttribute('aria-label', 'Live animation');

    // inject media element
    injectMedia(container);

    // add subtle entrance animation
    container.style.opacity = 0;
    container.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' });
  });
}

/* Run initialization on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  initMediaContainers();

  // If you want the global progress to still cycle when no media is playing,
  // keep the existing progress loop (61..75). Otherwise, media timeupdate will drive it.
  // Here we keep both: if media sync is active it will override; otherwise loop runs.
  (function startProgressLoop() {
    let idx = 0;
    setInterval(() => {
      // only update if no media is currently driving progress (simple heuristic)
      const anySyncing = Array.from(document.querySelectorAll('.media-container')).some(c => c.dataset.sync === 'progress' && c.querySelector('video'));
      if (!anySyncing) {
        const v = progressSequence[idx % progressSequence.length];
        setGlobalProgress(v);
        idx++;
      }
    }, 1800);
  })();
});
