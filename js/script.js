/* js/script.js
   Phase 1 runtime:
   - Particle engine (canvas)
   - Parallax driver (pointer)
   - Live dashboard plumbing (progress, status rotator, live info)
   - Demo SVG part animation hooks (crane arm, trolley, hook)
   - Micro-interactions (panel tilt, hover glow)
   - Prefers-reduced-motion support
*/

/* =========================
   Utilities
   ========================= */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================
   DOM references
   ========================= */
const constructionScene = document.getElementById('constructionScene');
const electricalScene = document.getElementById('electricalScene');
const infraScene = document.getElementById('infraScene');

const constructionProps = document.getElementById('constructionProps');
const electricalProps = document.getElementById('electricalProps');
const infraProps = document.getElementById('infraProps');

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

/* =========================
   Progress & Status
   ========================= */
const progressSequence = [61,63,65,67,69,71,73,75];
let progressIndex = 0;
function setProgress(v){
  progressFill.style.width = `${v}%`;
  progressPercent.textContent = `${v}%`;
  // subtle pulse
  try {
    progressFill.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.02)' }, { transform: 'scaleY(1)' }], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1)' });
  } catch(e){}
}
function startProgressLoop(){
  setProgress(progressSequence[progressIndex]);
  progressIndex = (progressIndex + 1) % progressSequence.length;
  setInterval(()=> {
    setProgress(progressSequence[progressIndex]);
    progressIndex = (progressIndex + 1) % progressSequence.length;
  }, 1800);
}

/* Status rotator */
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
function rotateStatus(){
  if(prefersReduced) { statusRotator.textContent = statuses[statusIndex % statuses.length]; statusIndex++; return; }
  statusRotator.animate([{ opacity:1 }, { opacity:0 }], { duration:300, fill:'forwards' }).onfinish = () => {
    statusRotator.textContent = statuses[statusIndex % statuses.length];
    statusRotator.animate([{ opacity:0 }, { opacity:1 }], { duration:300, fill:'forwards' });
    statusIndex++;
  };
}
setInterval(rotateStatus, 4000);
rotateStatus();

/* Live info updater */
function updateLiveInfo(){
  const now = new Date();
  liveDate.textContent = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  liveTime.textContent = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  liveDay.textContent = now.toLocaleDateString(undefined, { weekday:'long' });
  const minutesLeft = 30 + (progressIndex % 6) * 7;
  const est = new Date(now.getTime() + minutesLeft * 60000);
  liveEst.textContent = est.toLocaleString(undefined, { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' });
  liveUpdate.textContent = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  const serverStates = ['Degraded → Upgrading', 'Restarting Services', 'Applying Patches', 'Healthy'];
  const netStates = ['Active', 'Syncing', 'Packet Loss (minor)', 'Stable'];
  const phases = ['Preparing', 'Building', 'Testing', 'Deploying', 'Verifying'];

  liveServer.textContent = serverStates[now.getSeconds() % serverStates.length];
  liveNet.textContent = netStates[Math.floor(now.getSeconds() / 2) % netStates.length];
  livePhase.textContent = phases[Math.floor(now.getMinutes() / 10) % phases.length];
}
updateLiveInfo();
setInterval(updateLiveInfo, 1000);

/* =========================
   Background Particles (Canvas)
   - lightweight, optimized for performance
   ========================= */
(function bgParticles(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.max(24, Math.round((w*h)/90000)); // capped density

  function create(){
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.3,1.8),
        vx: rand(-0.12,0.12),
        vy: rand(-0.03,0.03),
        alpha: rand(0.02,0.18)
      });
    }
  }
  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    particles.length = 0;
    create();
  }
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
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  create();
  draw();
  addEventListener('resize', resize);
})();

/* =========================
   Parallax (pointer-based)
   - subtle depth movement for background layers
   ========================= */
(function parallax(){
  if(prefersReduced) return;
  const lights = document.querySelectorAll('.volumetric .beam');
  const objects = document.querySelectorAll('.bg-objects .gear, .bg-objects .star');
  let mouseX = 0, mouseY = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', (e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    mouseX = (e.clientX - cx) / cx;
    mouseY = (e.clientY - cy) / cy;
  }, { passive:true });
  function raf(){
    rx += (mouseX - rx) * 0.06;
    ry += (mouseY - ry) * 0.06;
    lights.forEach((el,i) => {
      const depth = (i+1)*6;
      el.style.transform = `translate3d(${rx*depth}px, ${ry*depth}px, 0)`;
    });
    objects.forEach((el,i) => {
      const depth = (i%2===0?1.6:2.6);
      el.style.transform = `translate3d(${rx*(i+1)*depth}px, ${ry*(i+1)*depth}px, 0) rotate(${rx*(i+1)*6}deg)`;
    });
    requestAnimationFrame(raf);
  }
  raf();
})();

/* =========================
   Demo: Animate crane parts (Phase 1 sample)
   - Uses CSS keyframes for long loops and inline style variables for variety
   ========================= */
(function animateCrane(){
  const svg = document.getElementById('craneSVG');
  if(!svg) return;
  const armGroup = svg.querySelector('#armGroup > g');
  const trolley = svg.querySelector('#trolley');
  const hookGroup = svg.querySelector('#hookGroup');

  if(!prefersReduced){
    // randomized durations for asynchronous motion
    armGroup.style.animation = `craneRotate ${rand(10,18).toFixed(2)}s cubic-bezier(.2,.9,.3,1) ${rand(0,2).toFixed(2)}s infinite`;
    trolley.style.animation = `trolleyMove ${rand(6,12).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    hookGroup.style.animation = `hookLift ${rand(2.6,5.2).toFixed(2)}s ease-in-out ${rand(0,1.6).toFixed(2)}s infinite`;
  } else {
    // reduced motion: set static transforms
    armGroup.style.transform = 'rotate(-6deg)';
  }
})();

/* =========================
   Micro-interactions & accessibility
   - Panel tilt on pointer move
   - Brand hover glow
   ========================= */
(function microInteractions(){
  if(!prefersReduced){
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
      panel.addEventListener('pointerleave', () => { panel.style.transform = ''; rect = null; });
    });
  }

  const brand = document.querySelector('.brand');
  if(brand){
    brand.addEventListener('mouseenter', ()=> brand.style.filter = 'drop-shadow(0 12px 40px rgba(59,130,246,0.18))');
    brand.addEventListener('mouseleave', ()=> brand.style.filter = '');
  }
})();

/* =========================
   Start progress loop (respect reduced motion)
   ========================= */
if(!prefersReduced) startProgressLoop();
else setProgress(progressSequence[0]);

/* =========================
   Phase 1 complete:
   - Foundation ready for Phase 2–5
   - Replace placeholders with full SVG scenes in next phases
   ========================= */
