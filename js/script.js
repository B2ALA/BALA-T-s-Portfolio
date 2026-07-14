/* js/script.js
   Vanilla JS powering:
   - Progress animation loop
   - Status rotator
   - Live date/time and estimated completion
   - Lightweight particle system (canvas)
   - Subtle parallax based on mouse movement
   - Accessibility: respects prefers-reduced-motion
   - Well-commented, optimized for 60fps
*/

/* -------------------------
   DOM references
   ------------------------- */
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const statusRotator = document.getElementById('statusRotator');

const liveDate = document.getElementById('liveDate');
const liveTime = document.getElementById('liveTime');
const liveDay = document.getElementById('liveDay');
const liveEst = document.getElementById('liveEst');
const liveUpdate = document.getElementById('liveUpdate');
const liveServer = document.getElementById('liveServer');
const liveNet = document.getElementById('liveNet');
const livePhase = document.getElementById('livePhase');

/* -------------------------
   Progress sequence (looping)
   ------------------------- */
const progressSequence = [61, 63, 65, 67, 69, 71, 73, 75];
let progressIndex = 0;
let progressTimer = null;

function setProgress(value) {
  // Smoothly update UI
  progressFill.style.width = `${value}%`;
  progressPercent.textContent = `${value}%`;
  // subtle pulse on fill for micro-interaction
  progressFill.animate(
    [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.02)' }, { transform: 'scaleY(1)' }],
    { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1)' }
  );
}

function startProgressLoop() {
  setProgress(progressSequence[progressIndex]);
  progressIndex = (progressIndex + 1) % progressSequence.length;
  progressTimer = setInterval(() => {
    setProgress(progressSequence[progressIndex]);
    progressIndex = (progressIndex + 1) % progressSequence.length;
  }, 1800);
}

/* -------------------------
   Status rotator (every 4s)
   ------------------------- */
const statuses = [
  "Installing New Features...",
  "Optimizing Performance...",
  "Improving Security...",
  "Testing Stability...",
  "Deploying Updates...",
  "Building Better Experience...",
  "Enhancing Performance...",
  "Synchronizing Database...",
  "Connecting Cloud Servers...",
  "Calibrating AI Modules...",
  "Launching Soon...",
  "Almost Ready..."
];
let statusIndex = 0;
function rotateStatus() {
  // fade out / in for smoothness
  statusRotator.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' })
    .onfinish = () => {
      statusRotator.textContent = statuses[statusIndex % statuses.length];
      statusRotator.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      statusIndex++;
    };
}
setInterval(rotateStatus, 4000);
rotateStatus();

/* -------------------------
   Live date/time & estimates
   ------------------------- */
function pad(n){ return n < 10 ? '0'+n : n; }

function updateLiveInfo(){
  const now = new Date();
  liveDate.textContent = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  liveTime.textContent = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  liveDay.textContent = now.toLocaleDateString(undefined, { weekday:'long' });

  // Estimated completion: simple dynamic heuristic for demo
  const minutesLeft = 30 + (progressIndex % 6) * 7;
  const est = new Date(now.getTime() + minutesLeft * 60000);
  liveEst.textContent = est.toLocaleString(undefined, { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' });

  // Last update timestamp
  liveUpdate.textContent = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  // Server / Network / Phase dynamic hints (rotate subtle statuses)
  const serverStates = ['Degraded → Upgrading', 'Restarting Services', 'Applying Patches', 'Healthy'];
  const netStates = ['Active', 'Syncing', 'Packet Loss (minor)', 'Stable'];
  const phases = ['Preparing', 'Building', 'Testing', 'Deploying', 'Verifying'];

  liveServer.textContent = serverStates[now.getSeconds() % serverStates.length];
  liveNet.textContent = netStates[Math.floor(now.getSeconds() / 2) % netStates.length];
  livePhase.textContent = phases[Math.floor(now.getMinutes() / 10) % phases.length];
}
updateLiveInfo();
setInterval(updateLiveInfo, 1000);

/* -------------------------
   Background particles (canvas)
   Lightweight, optimized for performance
   ------------------------- */
(function initParticles(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const density = Math.max(40, Math.round((w * h) / 120000)); // scale with viewport

  function rand(min, max){ return Math.random() * (max - min) + min; }

  for(let i=0;i<density;i++){
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.4, 1.8),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.03, 0.03),
      alpha: rand(0.04, 0.18)
    });
  }

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  addEventListener('resize', resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < -10) p.x = w + 10;
      if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10;
      if(p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* -------------------------
   Subtle parallax / pointer depth
   - Moves background layers and panels slightly based on pointer
   - Uses requestAnimationFrame for smoothness
   ------------------------- */
(function parallax(){
  const app = document.getElementById('app');
  const lights = document.querySelectorAll('.volumetric-lights .light');
  const gears = document.querySelectorAll('.floating-objects .gear, .floating-objects .geo');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  let mouseX = 0, mouseY = 0;
  let rx = 0, ry = 0;

  window.addEventListener('pointermove', (e) => {
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    mouseX = (e.clientX - cx) / cx;
    mouseY = (e.clientY - cy) / cy;
  }, { passive: true });

  function raf(){
    // gentle easing
    rx += (mouseX - rx) * 0.06;
    ry += (mouseY - ry) * 0.06;

    // move lights (farther layers move less)
    lights.forEach((el, i) => {
      const depth = (i + 1) * 6;
      el.style.transform = `translate3d(${rx * depth}px, ${ry * depth}px, 0)`;
    });

    // rotate gears slightly
    gears.forEach((g, i) => {
      const rot = rx * (i % 2 === 0 ? 6 : -6);
      g.style.transform = `translate3d(${rx * (i+1)}px, ${ry * (i+1)}px, 0) rotate(${rot}deg)`;
    });

    // subtle tilt on header brand
    const brand = document.querySelector('.brand');
    if(brand) brand.style.transform = `translate3d(${rx * 6}px, ${ry * 6}px, 0)`;

    requestAnimationFrame(raf);
  }
  raf();
})();

/* -------------------------
   Micro-interactions: hover glows & keyboard accessibility
   ------------------------- */
(function microInteractions(){
  // Panels tilt on mouse move inside
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => {
    let rect = null;
    panel.addEventListener('pointerenter', () => rect = panel.getBoundingClientRect());
    panel.addEventListener('pointermove', (e) => {
      if(!rect) rect = panel.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 6; // rotateX
      const ry = (px - 0.5) * -8; // rotateY
      panel.style.transform = `perspective(900px) translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    panel.addEventListener('pointerleave', () => {
      panel.style.transform = '';
      rect = null;
    });
  });

  // Buttons & brand hover glow
  const brand = document.querySelector('.brand');
  if(brand){
    brand.addEventListener('mouseenter', () => brand.style.filter = 'drop-shadow(0 12px 40px rgba(59,130,246,0.18))');
    brand.addEventListener('mouseleave', () => brand.style.filter = '');
  }
})();

/* -------------------------
   Initialization
   ------------------------- */
(function init(){
  // Respect reduced motion: if user prefers reduced motion, disable loops
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced) startProgressLoop();
  else {
    // set static progress if reduced motion
    setProgress(progressSequence[0]);
  }
})();
