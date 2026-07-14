/* js/script.js
   Production-ready scene builder and runtime.
   - Inline SVG elements are animated via CSS + JS
   - Each scene contains many independent elements (20-50+)
   - Animations use transforms/opacity/filter for GPU acceleration
   - Randomized durations/delays avoid robotic repetition
   - Canvas background particles for ambience
   - Parallax pointer depth and micro-interactions
   - Respects prefers-reduced-motion
*/

/* =========================
   Utilities
   ========================= */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =========================
   DOM refs
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

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================
   PROGRESS & STATUS
   ========================= */
const progressSequence = [61,63,65,67,69,71,73,75];
let progressIndex = 0;
function setProgress(v){
  progressFill.style.width = `${v}%`;
  progressPercent.textContent = `${v}%`;
  // micro pulse
  progressFill.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.02)' }, { transform: 'scaleY(1)' }], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1)' });
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
   BACKGROUND PARTICLES (Canvas)
   ========================= */
(function bgParticles(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.round((w*h)/90000);

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
   PARALLAX (pointer-based)
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
   SCENE: CONSTRUCTION (detailed)
   - Creates 30+ elements with independent animations
   - Animates SVG crane parts and many HTML props
   ========================= */
function buildConstructionScene(){
  const svg = document.getElementById('craneSVG');
  if(!svg) return;

  // 1) Animate crane arm rotation and hook via CSS variables
  const arm = svg.querySelector('#arm');
  const armGroup = svg.querySelector('#armGroup > g');
  const hookGroup = svg.querySelector('#hookGroup');
  // set randomized durations
  armGroup.style.animation = `craneRotate ${rand(10,18).toFixed(2)}s ${['linear','ease-in-out'][rint(0,1)]} ${rand(0,2).toFixed(2)}s infinite`;
  hookGroup.style.animation = `hookLift ${rand(2.6,5.2).toFixed(2)}s ease-in-out ${rand(0,1.6).toFixed(2)}s infinite`;

  // 2) Build floors (8-12 floors) inside SVG floorsGroup
  const floorsGroup = svg.querySelector('#floorsGroup');
  const floorCount = rint(8,12);
  for(let i=0;i<floorCount;i++){
    const y = 260 - i*44;
    const floor = document.createElementNS('http://www.w3.org/2000/svg','g');
    floor.setAttribute('transform', `translate(0, ${y})`);
    floor.classList.add('svg-floor');
    // floor base
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x','0'); rect.setAttribute('y','0'); rect.setAttribute('width','260'); rect.setAttribute('height','36');
    rect.setAttribute('rx','8'); rect.setAttribute('fill','#263445'); rect.setAttribute('opacity','0.98');
    // bricks group
    const bricks = document.createElementNS('http://www.w3.org/2000/svg','g');
    bricks.setAttribute('class','svg-bricks');
    const brickCount = rint(8,14);
    for(let b=0;b<brickCount;b++){
      const bx = 8 + b*(240/(brickCount-1));
      const brick = document.createElementNS('http://www.w3.org/2000/svg','rect');
      brick.setAttribute('x', `${bx}`); brick.setAttribute('y','28'); brick.setAttribute('width','18'); brick.setAttribute('height','12');
      brick.setAttribute('rx','2'); brick.setAttribute('fill','#b45309'); brick.setAttribute('opacity','0');
      // animate brick placement with staggered delays via JS
      const delay = rand(0.1,1.2) + i*0.08;
      setTimeout(()=> {
        brick.style.transition = `transform ${rand(0.8,1.6).toFixed(2)}s cubic-bezier(.2,.9,.3,1), opacity ${rand(0.6,1.2).toFixed(2)}s`;
        brick.style.transform = 'translateY(0)';
        brick.setAttribute('opacity','1');
      }, delay*1000);
      bricks.appendChild(brick);
    }
    floor.appendChild(rect);
    floor.appendChild(bricks);
    floorsGroup.appendChild(floor);

    // animate floor rise
    setTimeout(()=> {
      rect.style.transition = `transform ${rand(1.0,1.6).toFixed(2)}s ${'cubic-bezier(.2,.9,.3,1)'}`;
      rect.style.transform = 'translateY(0)';
    }, i*400 + 200);
  }

  // 3) Create many HTML props: workers, vehicles, mixer, toolbox, cones, dust, sparks
  const props = constructionProps;
  // vehicles
  const vehicleTypes = ['dump','excavator','bulldozer'];
  for(let i=0;i<3;i++){
    const v = document.createElement('div'); v.className = `prop vehicle ${vehicleTypes[i]}`;
    v.style.left = `${6 + i*18}%`;
    v.style.bottom = `${8 + i*2}px`;
    v.style.width = `${rint(80,140)}px`;
    v.style.height = `${rint(36,56)}px`;
    v.style.borderRadius = '8px';
    v.style.background = i===0 ? 'linear-gradient(90deg,#b45309,#92400e)' : i===1 ? 'linear-gradient(90deg,#475569,#94a3b8)' : 'linear-gradient(90deg,#111827,#0b1220)';
    v.style.animation = `vehicleDrive ${rand(6,14).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
    props.appendChild(v);
  }

  // mixer
  const mixer = document.createElement('div'); mixer.className = 'prop mixer';
  mixer.style.left = '16%'; mixer.style.bottom = '18px'; mixer.style.width = '56px'; mixer.style.height = '56px';
  mixer.style.borderRadius = '8px'; mixer.style.background = 'linear-gradient(90deg,#94a3b8,#475569)';
  mixer.style.animation = `mixerSpin ${rand(2.6,4.2).toFixed(2)}s linear infinite`;
  props.appendChild(mixer);

  // toolbox + hammer
  const toolbox = document.createElement('div'); toolbox.className = 'prop toolbox';
  toolbox.style.left = '12%'; toolbox.style.bottom = '18px'; toolbox.style.width = '44px'; toolbox.style.height = '28px';
  toolbox.style.background = 'linear-gradient(90deg,#3b82f6,#1e3a8a)'; props.appendChild(toolbox);

  const hammer = document.createElement('div'); hammer.className = 'prop hammer';
  hammer.style.left = '14%'; hammer.style.bottom = '36px'; hammer.style.width = '8px'; hammer.style.height = '28px'; hammer.style.background = '#94a3b8';
  props.appendChild(hammer);
  // hammer micro-swing
  setInterval(()=> {
    hammer.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }], { duration: rint(800,1600), easing: 'ease-in-out' });
  }, rint(1200,2600));

  // cones cluster
  for(let i=0;i<8;i++){
    const c = document.createElement('div'); c.className = 'prop cone';
    c.style.left = `${8 + i*3}%`; c.style.bottom = `${18 + (i%2)*6}px`; c.style.width = '10px'; c.style.height = '18px';
    c.style.background = 'linear-gradient(180deg,var(--accent),#b45309)'; c.style.borderRadius = '3px';
    c.style.transform = `rotate(${rand(-8,8)}deg)`; props.appendChild(c);
  }

  // workers (20+)
  const workerActions = ['walk','carry','jack','weld','wrench','inspect'];
  for(let i=0;i<22;i++){
    const w = document.createElement('div'); w.className = 'prop worker';
    w.style.left = `${6 + Math.random()*70}%`;
    w.style.bottom = `${12 + Math.random()*18}px`;
    w.style.width = '36px'; w.style.height = '72px'; w.style.borderRadius = '8px';
    w.style.background = Math.random()>0.5 ? 'linear-gradient(180deg,#f59e0b,#b45309)' : 'linear-gradient(180deg,#3b82f6,#1e40af)';
    const action = choose(workerActions);
    if(action === 'walk'){
      w.style.animation = `workerWalk ${rand(4.2,8.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'carry'){
      w.style.animation = `workerCarry ${rand(4.6,7.6).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'jack'){
      w.style.animation = `jackhammer ${rand(0.6,1.2).toFixed(2)}s steps(2) ${rand(0,1).toFixed(2)}s infinite`;
    } else if(action === 'weld'){
      // add sparks element
      const sparks = document.createElement('div'); sparks.className = 'spark';
      sparks.style.position = 'absolute'; sparks.style.left = '50%'; sparks.style.top = '8%'; sparks.style.width = '6px'; sparks.style.height = '6px';
      sparks.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(255,200,80,1))'; sparks.style.borderRadius = '50%';
      sparks.style.opacity = 0; sparks.style.animation = `weldSparks ${rand(0.6,1.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      w.appendChild(sparks);
      w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else {
      w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    }
    props.appendChild(w);
  }

  // dust & smoke (12)
  for(let i=0;i<12;i++){
    const d = document.createElement('div'); d.className = 'prop dust';
    d.style.right = `${8 + Math.random()*60}%`; d.style.bottom = `${40 + Math.random()*120}px`;
    d.style.width = `${rint(60,140)}px`; d.style.height = `${rint(40,120)}px`; d.style.borderRadius = '50%';
    d.style.background = 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)';
    d.style.filter = 'blur(6px)'; d.style.opacity = rand(0.2,0.9).toFixed(2);
    d.style.animation = `dustFloat ${rand(4,10).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    props.appendChild(d);
  }

  // flashing warning lights (6)
  for(let i=0;i<6;i++){
    const wl = document.createElement('div'); wl.className = 'prop warn';
    wl.style.left = `${6 + i*12}%`; wl.style.top = `${6 + (i%2)*6}%`; wl.style.width = '18px'; wl.style.height = '18px';
    wl.style.borderRadius = '50%'; wl.style.background = 'var(--accent)'; wl.style.boxShadow = '0 0 18px rgba(245,158,11,0.6)';
    wl.style.animation = `warnBlink ${rand(1.6,3.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    props.appendChild(wl);
  }

  // concrete blocks attached to hook (simulate pendulum)
  const blocks = [];
  for(let i=0;i<4;i++){
    const b = document.createElement('div'); b.className = 'prop block';
    b.style.width = `${rint(28,44)}px`; b.style.height = `${rint(18,28)}px`; b.style.background = 'linear-gradient(90deg,#9ca3af,#6b7280)';
    b.style.position = 'absolute'; b.style.left = `${48 + i*6}%`; b.style.bottom = `${120 + i*6}px`; b.style.opacity = 0.95;
    constructionProps.appendChild(b);
    blocks.push(b);
  }
  // animate blocks with JS pendulum
  blocks.forEach((b, idx) => {
    const baseDelay = rand(0,2);
    const amplitude = rand(6,18);
    const period = rand(2200,5200);
    let t0 = performance.now() + baseDelay*1000;
    function animateBlock(now){
      const dt = now - t0;
      const phase = (dt % period) / period;
      const swing = Math.sin(phase * Math.PI * 2) * amplitude;
      b.style.transform = `translate3d(${swing}px, ${Math.sin(phase*Math.PI*2)*4}px, 0) rotate(${Math.sin(phase*Math.PI*2)*2}deg)`;
      requestAnimationFrame(animateBlock);
    }
    requestAnimationFrame(animateBlock);
  });

  // ensure many elements have CSS variable durations for variety
  constructionProps.querySelectorAll('*').forEach(el => {
    el.style.setProperty('--anim-d', `${rand(2,12).toFixed(2)}s`);
    el.style.setProperty('--anim-delay', `${rand(0,2).toFixed(2)}s`);
  });
}

/* =========================
   SCENE: ELECTRICAL (detailed)
   - 30+ elements: breakers, wires, electricians, sparks, fans, oscilloscope traces
   ========================= */
function buildElectricalScene(){
  const svg = document.getElementById('electricalSVG');
  if(!svg) return;

  // 1) Populate switchgear with many breakers and LEDs
  const breakersGroup = svg.querySelector('#breakers');
  for(let r=0;r<4;r++){
    for(let c=0;c<6;c++){
      const bx = 8 + c*28;
      const by = 8 + r*64;
      const breaker = document.createElementNS('http://www.w3.org/2000/svg','g');
      breaker.setAttribute('transform', `translate(${bx},${by})`);
      // breaker body
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x','0'); rect.setAttribute('y','0'); rect.setAttribute('width','18'); rect.setAttribute('height','36'); rect.setAttribute('rx','4');
      rect.setAttribute('fill','#111827'); breaker.appendChild(rect);
      // LED
      const led = document.createElementNS('http://www.w3.org/2000/svg','circle');
      led.setAttribute('cx','14'); led.setAttribute('cy','8'); led.setAttribute('r','4');
      const ledColor = choose(['#10B981','#3B82F6','#F59E0B']);
      led.setAttribute('fill', ledColor); led.setAttribute('opacity','0.95');
      breaker.appendChild(led);
      breakersGroup.appendChild(breaker);
      // animate LED pulse via CSS
      led.style.animation = `ledPulse ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    }
  }

  // 2) Cable trays and hanging wires (20+)
  for(let i=0;i<20;i++){
    const tray = document.createElementNS('http://www.w3.org/2000/svg','rect');
    tray.setAttribute('x', `${20 + (i%6)*120}`); tray.setAttribute('y', `${20 + Math.floor(i/6)*80}`); tray.setAttribute('width','120'); tray.setAttribute('height','8');
    tray.setAttribute('rx','4'); tray.setAttribute('fill','#0b1220'); tray.setAttribute('opacity','0.9');
    svg.querySelector('#cableTrays').appendChild(tray);
    // create small packet glows along tray (JS-driven)
    const glow = document.createElementNS('http://www.w3.org/2000/svg','rect');
    glow.setAttribute('x', `${20 + (i%6)*120}`); glow.setAttribute('y', `${20 + Math.floor(i/6)*80}`); glow.setAttribute('width','6'); glow.setAttribute('height','8');
    glow.setAttribute('rx','3'); glow.setAttribute('fill','#3B82F6'); glow.setAttribute('opacity','0.0');
    svg.querySelector('#cableTrays').appendChild(glow);
    // animate glow pulses
    (function(g){
      function pulse(){
        g.animate([{ opacity:0 }, { opacity:0.9 }, { opacity:0 }], { duration: rand(900,2200), easing: 'ease-in-out' });
        setTimeout(pulse, rand(1200,4200));
      }
      setTimeout(pulse, rand(200,1200));
    })(glow);
  }

  // 3) Electricians (12) with actions: climbing, replacing fuse, tightening bolts
  const props = electricalProps;
  const actions = ['climb','replace','tighten','test','inspect'];
  for(let i=0;i<12;i++){
    const e = document.createElement('div'); e.className = 'prop electrician';
    e.style.left = `${8 + Math.random()*72}%`; e.style.bottom = `${12 + Math.random()*18}px`;
    e.style.width = '36px'; e.style.height = '72px'; e.style.borderRadius = '8px';
    e.style.background = 'linear-gradient(180deg,#3b82f6,#0b1220)';
    const action = choose(actions);
    if(action === 'climb'){
      e.style.animation = `climb ${rand(6,12).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'replace'){
      const fuse = document.createElement('div'); fuse.className = 'prop fuse';
      fuse.style.position = 'absolute'; fuse.style.left = '50%'; fuse.style.top = '8%'; fuse.style.width = '10px'; fuse.style.height = '18px';
      fuse.style.background = 'linear-gradient(90deg,#f59e0b,#92400e)'; fuse.style.borderRadius = '3px';
      fuse.style.animation = `sparkBurst ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      e.appendChild(fuse);
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else {
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    }
    props.appendChild(e);
  }

  // 4) Sparks & arcs (20) placed randomly
  for(let i=0;i<20;i++){
    const s = document.createElement('div'); s.className = 'prop arc';
    s.style.left = `${12 + Math.random()*72}%`; s.style.top = `${8 + Math.random()*60}%`; s.style.width = '6px'; s.style.height = '6px';
    s.style.borderRadius = '50%'; s.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(59,130,246,1))';
    s.style.opacity = 0; s.style.filter = 'blur(2px)';
    s.style.animation = `sparkBurst ${rand(1.2,3.6).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
    props.appendChild(s);
  }

  // 5) Oscilloscope traces (3) with different speeds (already in SVG trace)
  const traces = svg.querySelectorAll('#osc .trace rect');
  traces.forEach((t, idx) => {
    t.style.animation = `oscWave ${rand(1.2,2.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
  });

  // 6) Fans (4) rotating
  for(let i=0;i<4;i++){
    const fan = document.createElement('div'); fan.className = 'prop fan';
    fan.style.right = `${6 + i*8}%`; fan.style.bottom = `${40 + i*6}px`; fan.style.width = '36px'; fan.style.height = '36px';
    fan.style.borderRadius = '50%'; fan.style.background = 'linear-gradient(90deg,#0b1220,#1f2937)';
    fan.style.animation = `fanSpin ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    props.appendChild(fan);
  }

  // 7) Occasional bright flash simulation (random)
  setInterval(()=> {
    if(prefersReduced) return;
    const flash = document.createElement('div'); flash.className = 'prop flash';
    flash.style.position = 'absolute'; flash.style.left = '0'; flash.style.top = '0'; flash.style.right = '0'; flash.style.bottom = '0';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)'; flash.style.opacity = 0;
    electricalScene.appendChild(flash);
    flash.animate([{ opacity:0 }, { opacity:0.9 }, { opacity:0 }], { duration: 220, easing: 'ease-out' }).onfinish = () => electricalScene.removeChild(flash);
  }, rand(4200,12000));
}

/* =========================
   SCENE: INFRASTRUCTURE (detailed)
   - 30+ elements: racks, units, LEDs, packets, pipelines, bubbles, engineers
   ========================= */
function buildInfraScene(){
  const svg = document.getElementById('infraSVG');
  if(!svg) return;

  // 1) Create multiple racks with many server units and blinking LEDs
  const racksGroup = svg.querySelector('#racks');
  const rackCount = 3;
  for(let r=0;r<rackCount;r++){
    const rack = document.createElementNS('http://www.w3.org/2000/svg','g');
    rack.setAttribute('transform', `translate(${r*220},0)`);
    rack.classList.add('svg-rack');
    // rack body
    const rackBody = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rackBody.setAttribute('x','0'); rackBody.setAttribute('y','0'); rackBody.setAttribute('width','180'); rackBody.setAttribute('height','360'); rackBody.setAttribute('rx','8');
    rackBody.setAttribute('fill','#071226');
    rack.appendChild(rackBody);
    // server units
    for(let u=0;u<8;u++){
      const unit = document.createElementNS('http://www.w3.org/2000/svg','g');
      unit.setAttribute('transform', `translate(8, ${12 + u*40})`);
      const uRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      uRect.setAttribute('x','0'); uRect.setAttribute('y','0'); uRect.setAttribute('width','164'); uRect.setAttribute('height','32'); uRect.setAttribute('rx','6'); uRect.setAttribute('fill','#0b1220');
      unit.appendChild(uRect);
      // multiple LEDs
      for(let l=0;l<6;l++){
        const led = document.createElementNS('http://www.w3.org/2000/svg','circle');
        led.setAttribute('cx', `${140 + l*4 - 12}`); led.setAttribute('cy','16'); led.setAttribute('r','3');
        const color = choose(['#10B981','#3B82F6','#F59E0B']);
        led.setAttribute('fill', color);
        led.style.animation = `ledPulse ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
        unit.appendChild(led);
      }
      rack.appendChild(unit);
    }
    racksGroup.appendChild(rack);
  }

  // 2) Fiber tray with animated packets (HTML overlay)
  const fiber = document.createElement('div'); fiber.className = 'prop fiber';
  fiber.style.position = 'absolute'; fiber.style.right = '8%'; fiber.style.top = '12%'; fiber.style.width = '160px'; fiber.style.height = '8px';
  fiber.style.background = 'linear-gradient(90deg,#3b82f6,#0b1220)'; fiber.style.borderRadius = '6px';
  infraProps.appendChild(fiber);
  // packets
  for(let i=0;i<14;i++){
    const p = document.createElement('div'); p.className = 'prop packet';
    p.style.position = 'absolute'; p.style.left = `${rand(0,100)}%`; p.style.bottom = '6px'; p.style.width = '10px'; p.style.height = '8px';
    p.style.borderRadius = '2px'; p.style.background = `linear-gradient(90deg, ${choose(['#F59E0B','#3B82F6','#10B981'])}, ${choose(['#3B82F6','#10B981','#F59E0B'])})`;
    p.style.animation = `packetFloat ${rand(2.2,5.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    fiber.appendChild(p);
  }

  // 3) Pipelines with flowing liquid and bubbles
  const pipesGroup = svg.querySelector('#pipes');
  // create 2 transparent pipes
  for(let i=0;i<2;i++){
    const pipe = document.createElementNS('http://www.w3.org/2000/svg','rect');
    pipe.setAttribute('x', `${i*240}`); pipe.setAttribute('y','0'); pipe.setAttribute('width','220'); pipe.setAttribute('height','28'); pipe.setAttribute('rx','14');
    pipe.setAttribute('fill','#0b1220'); pipesGroup.appendChild(pipe);
    // liquid (HTML overlay)
    const liquid = document.createElement('div'); liquid.className = 'prop liquid';
    liquid.style.position = 'absolute'; liquid.style.left = `${420 + i*240}px`; liquid.style.bottom = '12px'; liquid.style.width = '220px'; liquid.style.height = '28px';
    liquid.style.overflow = 'hidden';
    const flow = document.createElement('div'); flow.style.position = 'absolute'; flow.style.left = '-40%'; flow.style.top = '0'; flow.style.width = '60%'; flow.style.height = '100%';
    flow.style.background = 'linear-gradient(90deg, rgba(59,130,246,0.6), rgba(16,185,129,0.6))';
    flow.style.animation = `liquidFlow ${rand(2.6,4.6).toFixed(2)}s linear infinite`;
    liquid.appendChild(flow);
    infraProps.appendChild(liquid);

    // bubbles inside flow (JS-driven)
    for(let b=0;b<8;b++){
      const bubble = document.createElement('div'); bubble.className = 'prop bubble';
      bubble.style.position = 'absolute'; bubble.style.left = `${rand(0,100)}%`; bubble.style.bottom = `${rand(0,100)}%`;
      bubble.style.width = `${rand(4,10)}px`; bubble.style.height = bubble.style.width; bubble.style.borderRadius = '50%';
      bubble.style.background = 'rgba(255,255,255,0.06)'; bubble.style.filter = 'blur(1px)'; bubble.style.opacity = rand(0.2,0.9).toFixed(2);
      flow.appendChild(bubble);
      // animate bubble rise
      (function(bub){
        const dur = rand(1800,4200);
        function rise(){
          bub.animate([{ transform: 'translateY(0)', opacity: bub.style.opacity }, { transform: 'translateY(-120px)', opacity: 0 }], { duration: dur, easing: 'linear' }).onfinish = () => {
            bub.style.left = `${rand(0,100)}%`;
            bub.style.opacity = rand(0.2,0.9).toFixed(2);
            setTimeout(rise, rand(200,1200));
          };
        }
        setTimeout(rise, rand(200,800));
      })(bubble);
    }
  }

  // 4) Engineers (8) with tools and laptops
  for(let i=0;i<8;i++){
    const eng = document.createElement('div'); eng.className = 'prop engineer';
    eng.style.right = `${8 + Math.random()*40}%`; eng.style.bottom = `${12 + Math.random()*18}px`; eng.style.width = '44px'; eng.style.height = '72px';
    eng.style.background = 'linear-gradient(180deg,#3b82f6,#0b1220)'; eng.style.borderRadius = '8px';
    eng.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    // add wrench or laptop
    if(Math.random() > 0.6){
      const wrench = document.createElement('div'); wrench.className = 'prop wrench';
      wrench.style.position = 'absolute'; wrench.style.right = '-6px'; wrench.style.bottom = '6px'; wrench.style.width = '18px'; wrench.style.height = '36px';
      wrench.style.background = 'linear-gradient(90deg,#94a3b8,#475569)'; wrench.style.borderRadius = '4px';
      wrench.style.animation = `wrenchSpin ${rand(2.2,4.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      eng.appendChild(wrench);
    } else {
      const laptop = document.createElement('div'); laptop.className = 'prop laptop';
      laptop.style.position = 'absolute'; laptop.style.left = '6px'; laptop.style.top = '6px'; laptop.style.width = '28px'; laptop.style.height = '18px';
      laptop.style.background = 'linear-gradient(90deg,#071226,#0b1220)'; laptop.style.borderRadius = '4px';
      eng.appendChild(laptop);
    }
    infraProps.appendChild(eng);
  }

  // 5) Valve rotation & steam release
  const valve = document.createElement('div'); valve.className = 'prop valve';
  valve.style.position = 'absolute'; valve.style.left = '62%'; valve.style.bottom = '28px'; valve.style.width = '36px'; valve.style.height = '36px'; valve.style.borderRadius = '50%';
  valve.style.background = 'linear-gradient(90deg,#94a3b8,#475569)'; infraProps.appendChild(valve);
  (function rotateValve(){
    valve.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(90deg)' }, { transform: 'rotate(0deg)' }], { duration: rand(2200,4200), easing: 'ease-in-out' });
    setTimeout(rotateValve, rand(2600,5200));
  })();

  // 6) Steam bursts
  setInterval(()=> {
    if(prefersReduced) return;
    const steam = document.createElement('div'); steam.className = 'prop steam';
    steam.style.position = 'absolute'; steam.style.left = '56%'; steam.style.bottom = '36px'; steam.style.width = '80px'; steam.style.height = '40px';
    steam.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)'; steam.style.filter = 'blur(12px)';
    infraProps.appendChild(steam);
    steam.animate([{ opacity:0 }, { opacity:0.6 }, { opacity:0 }], { duration: 1200, easing: 'ease-out' }).onfinish = () => infraProps.removeChild(steam);
  }, rand(4200,9000));
}

/* =========================
   MICRO-INTERACTIONS
   - Panel tilt, hover glows, keyboard focus
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
   INIT
   ========================= */
(function init(){
  buildConstructionScene();
  buildElectricalScene();
  buildInfraScene();
  if(!prefersReduced) startProgressLoop();
  else setProgress(progressSequence[0]);
})();
