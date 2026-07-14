/* js/script.js
   Vanilla JS to power dynamic progress, status messages, live time,
   and lightweight particle system. No external libraries.
*/

/* -------------------------
   Utility & DOM references
   ------------------------- */
const percentEl = document.getElementById('percent');
const progressFill = document.getElementById('progress-fill');
const statusMessage = document.getElementById('status-message');

const dateEl = document.getElementById('current-date');
const timeEl = document.getElementById('current-time');
const estimatedEl = document.getElementById('estimated');

/* -------------------------
   Progress percentage cycle
   ------------------------- */
const progressSequence = [61,63,65,67,69,71,73,75];
let progressIndex = 0;

function updateProgress(){
  const value = progressSequence[progressIndex % progressSequence.length];
  percentEl.textContent = value + '%';
  progressFill.style.width = value + '%';
  progressIndex++;
}

/* Start progress loop */
updateProgress();
setInterval(updateProgress, 1800); // smooth continuous updates

/* -------------------------
   Dynamic status messages
   ------------------------- */
const statuses = [
  "Installing New Features...",
  "Optimizing Performance...",
  "Testing Security...",
  "Improving User Experience...",
  "Deploying Updates...",
  "Connecting Servers...",
  "Painting Fresh Pixels...",
  "Building Better Experience...",
  "Almost Ready...",
  "Launching Soon..."
];
let statusIndex = 0;

function updateStatus(){
  statusMessage.style.opacity = 0;
  setTimeout(()=>{
    statusMessage.textContent = statuses[statusIndex % statuses.length];
    statusMessage.style.opacity = 1;
    statusIndex++;
  }, 400);
}
updateStatus();
setInterval(updateStatus, 4000);

/* -------------------------
   Live date/time & estimate
   ------------------------- */
function pad(n){ return n < 10 ? '0'+n : n; }

function updateTime(){
  const now = new Date();
  // Localized display
  dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  timeEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Estimated completion: simple heuristic — add random minutes to now for demo
  const minutesLeft = 30 + (progressIndex % 6) * 7; // pseudo dynamic
  const est = new Date(now.getTime() + minutesLeft * 60000);
  estimatedEl.textContent = est.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}
updateTime();
setInterval(updateTime, 1000);

/* -------------------------
   Lightweight particle system
   ------------------------- */
(function particles(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.round((w*h)/90000); // scale with screen

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function create(){
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.3,1.6),
        vx: rand(-0.15,0.15),
        vy: rand(-0.05,0.05),
        alpha: rand(0.06,0.22)
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

/* -------------------------
   Decorative: subtle interactions
   ------------------------- */
(function interactions(){
  // Hover glow for panels (improves perceived responsiveness)
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel=>{
    panel.addEventListener('mouseenter', ()=> panel.style.boxShadow = '0 18px 48px rgba(2,6,23,0.8)');
    panel.addEventListener('mouseleave', ()=> panel.style.boxShadow = '');
  });
})();

/* -------------------------
   Accessibility: reduce motion preference
   ------------------------- */
(function reduceMotion(){
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    // stop animations by removing animation styles
    document.querySelectorAll('*').forEach(el=>{
      el.style.animationDuration = '0.001s';
      el.style.animationIterationCount = '1';
      el.style.transitionDuration = '0.001s';
    });
  }
})();

/* -------------------------
   Small decorative JS: brick stacking timing
   ------------------------- */
(function brickTiming(){
  const floors = document.querySelectorAll('.floor::after'); // pseudo-element can't be selected
  // Instead, we animate floors by toggling a class with staggered delays
  const floorEls = document.querySelectorAll('.floor');
  function animateFloors(){
    floorEls.forEach((f,i)=>{
      f.style.opacity = '0.95';
      f.style.transform = 'translateY(0)';
      f.style.transition = `transform 1.2s ${0.12*i}s ${'cubic-bezier(.2,.9,.3,1)'}, opacity 1s`;
      setTimeout(()=> {
        f.style.transform = 'translateY(0)';
        f.style.opacity = '1';
      }, 80*i);
    });
  }
  animateFloors();
  setInterval(animateFloors, 6000);
})();
