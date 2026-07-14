

/* =========================
   Utility helpers
   ========================= */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =========================
   DOM references
   ========================= */
const constructionScene = document.getElementById('constructionScene');
const electricalScene = document.getElementById('electricalScene');
const infraScene = document.getElementById('infraScene');

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
   - lightweight, optimized
   ========================= */
(function bgParticles(){
  const canvas = document.getElementById('bgCanvas');
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
  const lights = document.querySelectorAll('.bg-lights .beam');
  const objects = document.querySelectorAll('.bg-objects .gear, .bg-objects .geo, .bg-objects .star');
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
   SCENE BUILDERS
   - Each scene is constructed programmatically to create many elements
   - Each element receives randomized durations/delays via CSS variables
   - Animations are a mix of CSS keyframes and JS-driven micro-motions
   ========================= */

/* ---------- Construction Scene ---------- */
function buildConstructionScene(container){
  // Safety: ensure container exists
  if(!container) return;

  // 1) Crane (complex structure)
  const crane = document.createElement('div'); crane.className = 'crane';
  crane.innerHTML = `
    <div class="tower"></div>
    <div class="arm" id="craneArm">
      <div class="counter"></div>
      <div class="armRail"></div>
      <div class="hook" id="craneHook">
        <div class="line"></div>
        <div class="body"></div>
      </div>
    </div>
  `;
  container.appendChild(crane);

  // Animate crane arm with variable duration
  const arm = crane.querySelector('.arm');
  arm.style.animation = `craneRotate ${rand(10,18).toFixed(2)}s cubic-bezier(.2,.9,.3,1) infinite`;
  // Hook lift/lower with random offset
  const hook = crane.querySelector('.hook');
  hook.style.animation = `hookLift ${rand(2.6,5.2).toFixed(2)}s ease-in-out ${rand(0,1.6).toFixed(2)}s infinite`;

  // 2) Building floors (create 8 floors, each with bricks and scaffolding)
  const building = document.createElement('div'); building.className = 'building';
  const floors = document.createElement('div'); floors.className = 'floors';
  const floorCount = 8;
  for(let i=0;i<floorCount;i++){
    const f = document.createElement('div'); f.className = `floor f${i+1}`;
    // staggered animation durations and delays
    const dur = rand(1.0,1.6).toFixed(2);
    const delay = (i * rand(0.4,0.9)).toFixed(2);
    f.style.animation = `floorRise ${dur}s cubic-bezier(.2,.9,.3,1) ${delay}s both`;
    // brick row
    const bricks = document.createElement('div'); bricks.className = 'brick-row';
    // create multiple brick pieces (visual depth)
    const brickCount = rint(6,10);
    for(let b=0;b<brickCount;b++){
      const piece = document.createElement('div');
      piece.className = 'brick-piece';
      // position each brick via inline style
      piece.style.position = 'absolute';
      piece.style.left = `${(b/(brickCount-1))*100}%`;
      piece.style.transform = `translateX(-50%)`;
      piece.style.width = `${rint(12,18)}px`;
      piece.style.height = `${rint(8,12)}px`;
      piece.style.background = `linear-gradient(90deg, #b45309, #92400e)`;
      piece.style.borderRadius = '2px';
      piece.style.opacity = 0;
      // animate brick placement with random timing
      const bd = rand(0.1,0.9).toFixed(2);
      const bt = rand(0.8,1.6).toFixed(2);
      piece.style.animation = `brickPlace ${bt}s cubic-bezier(.2,.9,.3,1) ${bd}s both`;
      bricks.appendChild(piece);
    }
    f.appendChild(bricks);
    floors.appendChild(f);
  }
  building.appendChild(floors);
  container.appendChild(building);

  // 3) Vehicles & heavy machinery (dump truck, excavator, bulldozer)
  const vehicles = [];
  const vehicleTypes = ['dump','excavator','bulldozer'];
  for(let i=0;i<3;i++){
    const v = document.createElement('div');
    v.className = `vehicle ${vehicleTypes[i]}`;
    v.style.left = `${10 + i*18}%`;
    v.style.bottom = `${8 + i*2}px`;
    // asynchronous drive animation
    const dur = rand(6,14).toFixed(2);
    v.style.animation = `vehicleDrive ${dur}s linear ${rand(0,3).toFixed(2)}s infinite`;
    container.appendChild(v);
    vehicles.push(v);
  }

  // 4) Concrete mixer rotating, toolbox, cones
  const mixer = document.createElement('div'); mixer.className = 'prop mixer';
  mixer.style.left = '16%'; mixer.style.bottom = '18px';
  mixer.style.animation = `mixerSpin ${rand(2.6,4.2).toFixed(2)}s linear infinite`;
  container.appendChild(mixer);

  const toolbox = document.createElement('div'); toolbox.className = 'prop toolbox';
  container.appendChild(toolbox);

  // cones cluster
  for(let i=0;i<6;i++){
    const c = document.createElement('div'); c.className = 'prop cone';
    c.style.left = `${8 + i*3}%`; c.style.bottom = `${18 + (i%2)*6}px`;
    c.style.transform = `rotate(${rand(-8,8)}deg)`;
    c.style.opacity = rand(0.6,1).toFixed(2);
    container.appendChild(c);
  }

  // 5) Workers (create many workers with different actions)
  const workerActions = ['walk','carry','jack','weld','wrench'];
  for(let i=0;i<18;i++){
    const w = document.createElement('div'); w.className = 'worker';
    // random color/helmet
    if(Math.random() > 0.5) w.classList.add('helmet'); else w.classList.add('blue');
    // random position
    w.style.left = `${5 + Math.random()*60}%`;
    w.style.bottom = `${12 + Math.random()*18}px`;
    // assign action
    const action = choose(workerActions);
    if(action === 'walk'){
      w.style.animation = `workerWalk ${rand(4.2,8.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'carry'){
      w.style.animation = `workerCarry ${rand(4.6,7.6).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'jack'){
      w.style.animation = `jackhammer ${rand(0.6,1.2).toFixed(2)}s steps(2) ${rand(0,1).toFixed(2)}s infinite`;
    } else if(action === 'weld'){
      // welding: create sparks element
      const sparks = document.createElement('div'); sparks.className = 'spark';
      sparks.style.position = 'absolute'; sparks.style.width = '6px'; sparks.style.height = '6px';
      sparks.style.left = '50%'; sparks.style.top = '10%';
      sparks.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(255,200,80,1))';
      sparks.style.borderRadius = '50%';
      sparks.style.opacity = 0;
      sparks.style.animation = `weldSparks ${rand(0.6,1.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      w.appendChild(sparks);
      w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else {
      w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    }
    container.appendChild(w);
  }

  // 6) Scaffolding, safety net, tape, lights
  const scaffold = document.createElement('div'); scaffold.className = 'scaffold';
  scaffold.style.position = 'absolute'; scaffold.style.left = 'calc(100% - 260px)'; scaffold.style.bottom = '0'; scaffold.style.top = '0';
  scaffold.style.width = '260px'; scaffold.style.opacity = 0.06;
  container.appendChild(scaffold);

  const safetyNet = document.createElement('div'); safetyNet.className = 'safety-net';
  safetyNet.style.position = 'absolute'; safetyNet.style.right = '6%'; safetyNet.style.bottom = '40%'; safetyNet.style.width = '220px'; safetyNet.style.height = '40px';
  safetyNet.style.background = 'linear-gradient(90deg, rgba(245,158,11,0.06), rgba(59,130,246,0.02))';
  safetyNet.style.transform = 'skewX(-6deg)';
  safetyNet.style.opacity = 0.9;
  container.appendChild(safetyNet);

  const tape = document.createElement('div'); tape.className = 'caution-tape';
  tape.style.left = '6%'; tape.style.top = '36%'; tape.style.animation = `floaty ${rand(6,12).toFixed(2)}s ease-in-out infinite`;
  container.appendChild(tape);

  // 7) Toolbox opening/hammer moving (micro-interactions)
  const toolboxEl = document.createElement('div'); toolboxEl.className = 'prop toolbox';
  toolboxEl.style.left = '12%'; toolboxEl.style.bottom = '18px';
  toolboxEl.style.transition = 'transform 220ms var(--ease)';
  container.appendChild(toolboxEl);
  // hammer (pseudo) - animated via JS
  const hammer = document.createElement('div'); hammer.className = 'prop hammer';
  hammer.style.width = '8px'; hammer.style.height = '28px'; hammer.style.background = '#94a3b8';
  hammer.style.left = '14%'; hammer.style.bottom = '36px';
  hammer.style.transformOrigin = 'top center';
  container.appendChild(hammer);

  // 8) Dust & smoke elements (many small independent)
  for(let i=0;i<12;i++){
    const d = document.createElement('div'); d.className = 'dust';
    d.style.right = `${8 + Math.random()*60}%`;
    d.style.bottom = `${40 + Math.random()*120}px`;
    d.style.opacity = rand(0.2,0.9).toFixed(2);
    d.style.animation = `dustFloat ${rand(4,10).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    container.appendChild(d);
  }

  // 9) Moving shadows (subtle)
  const shadow = document.createElement('div'); shadow.className = 'ground-shadow';
  shadow.style.position = 'absolute'; shadow.style.left = '0'; shadow.style.right = '0'; shadow.style.bottom = '0'; shadow.style.height = '40px';
  shadow.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.18), transparent)';
  shadow.style.opacity = 0.6;
  container.appendChild(shadow);

  // 10) JS micro-loop for steel cable physics and concrete block lifts
  // create a few concrete blocks attached to hook
  const blocks = [];
  for(let i=0;i<4;i++){
    const block = document.createElement('div'); block.className = 'concrete-block';
    block.style.position = 'absolute';
    block.style.width = `${rint(28,44)}px`;
    block.style.height = `${rint(18,28)}px`;
    block.style.background = 'linear-gradient(90deg,#9ca3af,#6b7280)';
    block.style.borderRadius = '4px';
    block.style.left = `${48 + i*6}%`;
    block.style.bottom = `${120 + i*6}px`;
    block.style.opacity = 0.95;
    container.appendChild(block);
    blocks.push(block);
  }

  // animate blocks asynchronously with slight pendulum motion
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

  // 11) Excavator digging (arm movement)
  const excav = document.createElement('div'); excav.className = 'vehicle excavator';
  excav.style.left = '22%'; excav.style.bottom = '8px';
  excav.style.width = '120px'; excav.style.height = '48px';
  excav.style.borderRadius = '8px';
  container.appendChild(excav);
  excav.style.animation = `vehicleDrive ${rand(8,16).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;

  // 12) Randomized flashing warning lights
  for(let i=0;i<6;i++){
    const wl = document.createElement('div'); wl.className = 'warning-light';
    wl.style.left = `${6 + i*10}%`; wl.style.top = `${6 + (i%2)*6}%`;
    wl.style.animation = `warnBlink ${rand(1.6,3.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    container.appendChild(wl);
  }

  // 13) Hammer micro-swing (JS-driven subtle)
  (function hammerLoop(){
    let dir = 1;
    setInterval(()=> {
      hammer.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }], { duration: rint(800,1600), easing: 'ease-in-out' });
    }, rint(1200,2600));
  })();

  // 14) Safety tape flutter (CSS already applied)
  // 15) Ensure many independent durations by adding CSS variables to elements
  container.querySelectorAll('*').forEach(el => {
    const d = rand(2,12).toFixed(2);
    el.style.setProperty('--anim-d', `${d}s`);
    el.style.setProperty('--anim-delay', `${rand(0,2).toFixed(2)}s`);
  });
}

/* ---------- Electrical Scene ---------- */
function buildElectricalScene(container){
  if(!container) return;

  // 1) Large transformer + multiple cabinets
  const transformer = document.createElement('div'); transformer.className = 'transformer';
  container.appendChild(transformer);

  const panel = document.createElement('div'); panel.className = 'panel-unit';
  container.appendChild(panel);

  // 2) Populate transformer with breakers, meters, and animated needles
  for(let i=0;i<6;i++){
    const breaker = document.createElement('div'); breaker.className = 'breaker';
    breaker.style.position = 'absolute';
    breaker.style.left = `${12 + (i%3)*18}%`;
    breaker.style.top = `${12 + Math.floor(i/3)*46}px`;
    breaker.style.transform = `rotate(${rand(-6,6)}deg)`;
    breaker.style.animation = `cableSway ${rand(3,6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    transformer.appendChild(breaker);
  }

  // 3) Meters with moving needles (JS-driven)
  for(let i=0;i<3;i++){
    const m = document.createElement('div'); m.className = 'meter';
    m.style.left = `${8 + i*30}%`; m.style.top = `${8}%`; m.style.position = 'absolute';
    const needle = document.createElement('div'); needle.className = 'needle';
    needle.style.position = 'absolute'; needle.style.left = '50%'; needle.style.top = '50%';
    needle.style.width = '2px'; needle.style.height = '60%'; needle.style.background = 'linear-gradient(90deg,#3b82f6,#f59e0b)';
    needle.style.transformOrigin = 'bottom center';
    m.appendChild(needle);
    panel.appendChild(m);

    // animate needle with random pulses
    (function animateNeedle(el){
      const period = rand(1200,2600);
      function tick(now){
        const angle = Math.sin(now/period + rand(0,2))*30 - 10; // -40..20 deg
        el.style.transform = `rotate(${angle}deg)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })(needle);
  }

  // 4) Cable trays and hanging wires (many)
  for(let i=0;i<18;i++){
    const wire = document.createElement('div'); wire.className = 'hanging-wire';
    wire.style.left = `${10 + (i%6)*12}%`;
    wire.style.top = `${8 + Math.floor(i/6)*28}%`;
    wire.style.height = `${rint(40,160)}px`;
    wire.style.animation = `cableSway ${rand(3,7).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    container.appendChild(wire);
  }

  // 5) Electrician actors (climbing, replacing fuses, tightening bolts)
  const electricianActions = ['climb','replace','tighten','test','inspect'];
  for(let i=0;i<10;i++){
    const e = document.createElement('div'); e.className = 'worker electrician';
    e.style.left = `${12 + Math.random()*60}%`;
    e.style.bottom = `${12 + Math.random()*18}px`;
    const action = choose(electricianActions);
    if(action === 'climb'){
      e.style.animation = `climb ${rand(6,12).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    } else if(action === 'replace'){
      // create a fuse element
      const fuse = document.createElement('div'); fuse.className = 'fuse';
      fuse.style.position = 'absolute'; fuse.style.width = '10px'; fuse.style.height = '18px'; fuse.style.left = '50%'; fuse.style.top = '10%';
      fuse.style.background = 'linear-gradient(90deg,#f59e0b,#92400e)';
      fuse.style.borderRadius = '3px';
      fuse.style.animation = `sparkBurst ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      e.appendChild(fuse);
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else if(action === 'tighten'){
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else {
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    }
    container.appendChild(e);
  }

  // 6) Sparks, arcs, and occasional lightning flashes
  for(let i=0;i<12;i++){
    const arc = document.createElement('div'); arc.className = 'arc';
    arc.style.left = `${12 + Math.random()*72}%`;
    arc.style.top = `${8 + Math.random()*60}%`;
    arc.style.opacity = 0;
    arc.style.animation = `sparkBurst ${rand(1.2,3.6).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
    container.appendChild(arc);
  }

  // 7) Oscilloscope traces (multiple with different speeds)
  for(let i=0;i<3;i++){
    const osc = document.createElement('div'); osc.className = 'osc';
    osc.style.left = `${6 + i*30}%`; osc.style.top = `${60 + i*6}px`;
    const trace = document.createElement('div'); trace.className = 'trace';
    trace.style.animation = `oscWave ${rand(1.2,2.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    osc.appendChild(trace);
    container.appendChild(osc);
  }

  // 8) Cooling fans and vents (rotating)
  for(let i=0;i<4;i++){
    const fan = document.createElement('div'); fan.className = 'fan';
    fan.style.right = `${6 + i*8}%`; fan.style.bottom = `${40 + i*6}px`;
    fan.style.animation = `fanSpin ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    container.appendChild(fan);
  }

  // 9) Cable testing pulses (JS-driven glowing along trays)
  const trays = [];
  for(let i=0;i<6;i++){
    const tray = document.createElement('div'); tray.className = 'cable-tray';
    tray.style.left = `${10 + i*10}%`; tray.style.top = `${8 + (i%3)*18}%`;
    tray.style.width = `${20 + Math.random()*40}%`;
    container.appendChild(tray);
    trays.push(tray);
  }
  trays.forEach((t, idx) => {
    const pulse = () => {
      t.animate([{ filter: 'brightness(0.9)' }, { filter: 'brightness(1.6)' }, { filter: 'brightness(0.9)' }], { duration: rand(900,2200), easing: 'ease-in-out' });
      setTimeout(pulse, rand(1200,4200));
    };
    setTimeout(pulse, rand(200,1200));
  });

  // 10) Blue electric glow across scene (subtle)
  const glow = document.createElement('div'); glow.className = 'electric-glow';
  glow.style.position = 'absolute'; glow.style.left = '0'; glow.style.right = '0'; glow.style.top = '0'; glow.style.bottom = '0';
  glow.style.pointerEvents = 'none'; glow.style.opacity = 0.02;
  container.appendChild(glow);

  // 11) Random bright flashes (simulate lightning/electrical surge)
  setInterval(()=> {
    if(prefersReduced) return;
    const flash = document.createElement('div');
    flash.style.position = 'absolute'; flash.style.left = '0'; flash.style.right = '0'; flash.style.top = '0'; flash.style.bottom = '0';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)';
    flash.style.opacity = 0;
    container.appendChild(flash);
    flash.animate([{ opacity:0 }, { opacity:0.9 }, { opacity:0 }], { duration: 220, easing: 'ease-out' }).onfinish = () => container.removeChild(flash);
  }, rand(4200,12000));
}

/* ---------- Infrastructure Scene ---------- */
function buildInfraScene(container){
  if(!container) return;

  // 1) Multiple server racks with many units and blinking LEDs
  const rackCount = 3;
  for(let r=0;r<rackCount;r++){
    const rack = document.createElement('div'); rack.className = 'rack';
    rack.style.left = `${8 + r*22}%`;
    rack.style.bottom = '12px';
    rack.style.height = `${260 + r*12}px`;
    // create server units inside
    for(let u=0;u<6;u++){
      const unit = document.createElement('div'); unit.className = 'server-unit';
      unit.style.height = `${rint(36,56)}px`;
      // create 3 LEDs with different pulse durations
      for(let l=0;l<6;l++){
        const led = document.createElement('div'); led.className = 'led';
        led.style.background = choose(['linear-gradient(90deg,#10B981,#064e3b)','linear-gradient(90deg,#3B82F6,#1e3a8a)','linear-gradient(90deg,#F59E0B,#92400e)']);
        led.style.animation = `ledPulse ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
        unit.appendChild(led);
      }
      rack.appendChild(unit);
    }
    container.appendChild(rack);
  }

  // 2) Fiber trays and animated packets
  const fiber = document.createElement('div'); fiber.className = 'fiber';
  fiber.style.right = '8%'; fiber.style.top = '12%';
  container.appendChild(fiber);

  // create many packets moving along fiber (JS-driven)
  const packetCount = 12;
  for(let i=0;i<packetCount;i++){
    const p = document.createElement('div'); p.className = 'packet';
    p.style.left = `${rand(0,100)}%`;
    p.style.bottom = `${6 + Math.random()*12}px`;
    p.style.animation = `packetFloat ${rand(2.2,5.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    fiber.appendChild(p);
  }

  // 3) Engineers repairing equipment (inserting cables, checking laptops)
  const engineerActions = ['insert','check','monitor','screw','replace'];
  for(let i=0;i<8;i++){
    const eng = document.createElement('div'); eng.className = 'worker engineer';
    eng.style.right = `${8 + Math.random()*40}%`;
    eng.style.bottom = `${12 + Math.random()*18}px`;
    eng.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    // add wrench or laptop
    if(Math.random() > 0.6){
      const wrench = document.createElement('div'); wrench.className = 'wrench';
      wrench.style.position = 'absolute'; wrench.style.right = '-6px'; wrench.style.bottom = '6px';
      wrench.style.animation = `wrenchSpin ${rand(2.2,4.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      eng.appendChild(wrench);
    } else {
      const laptop = document.createElement('div'); laptop.className = 'laptop';
      laptop.style.position = 'absolute'; laptop.style.left = '6px'; laptop.style.top = '6px';
      laptop.style.width = '28px'; laptop.style.height = '18px'; laptop.style.background = 'linear-gradient(90deg,#071226,#0b1220)';
      laptop.style.borderRadius = '4px';
      eng.appendChild(laptop);
    }
    container.appendChild(eng);
  }

  // 4) Transparent pipelines with flowing liquid (many bubbles)
  const pipe = document.createElement('div'); pipe.className = 'pipe';
  pipe.style.left = '40%'; pipe.style.bottom = '12px';
  container.appendChild(pipe);
  const liquid = document.createElement('div'); liquid.className = 'liquid';
  liquid.style.animation = `liquidFlow ${rand(2.6,4.6).toFixed(2)}s linear infinite`;
  pipe.appendChild(liquid);

  // create bubbles (JS-driven)
  for(let i=0;i<12;i++){
    const bubble = document.createElement('div'); bubble.className = 'bubble';
    bubble.style.position = 'absolute';
    bubble.style.left = `${rand(0,100)}%`;
    bubble.style.bottom = `${rand(0,100)}%`;
    bubble.style.width = `${rand(4,10)}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.borderRadius = '50%';
    bubble.style.background = 'rgba(255,255,255,0.06)';
    bubble.style.filter = 'blur(1px)';
    bubble.style.opacity = rand(0.2,0.9).toFixed(2);
    liquid.appendChild(bubble);
    // animate bubble rise
    (function(b){
      const dur = rand(1800,4200);
      function rise(){
        b.animate([{ transform: 'translateY(0)', opacity: b.style.opacity }, { transform: 'translateY(-120px)', opacity: 0 }], { duration: dur, easing: 'linear' }).onfinish = () => {
          b.style.left = `${rand(0,100)}%`;
          b.style.opacity = rand(0.2,0.9).toFixed(2);
          setTimeout(rise, rand(200,1200));
        };
      }
      setTimeout(rise, rand(200,800));
    })(bubble);
  }

  // 5) Cooling fans (rotating) and temperature indicators
  for(let i=0;i<4;i++){
    const fan = document.createElement('div'); fan.className = 'fan';
    fan.style.right = `${6 + i*8}%`; fan.style.bottom = `${40 + i*6}px`;
    fan.style.animation = `fanSpin ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    container.appendChild(fan);
  }

  // 6) Digital dashboards (binary streams)
  for(let i=0;i<6;i++){
    const dash = document.createElement('div'); dash.className = 'dashboard';
    dash.style.position = 'absolute';
    dash.style.left = `${6 + i*14}%`;
    dash.style.top = `${6 + (i%3)*12}%`;
    dash.style.width = `${rint(60,120)}px`;
    dash.style.height = `${rint(18,36)}px`;
    dash.style.background = 'linear-gradient(90deg,#071226,#0b1220)';
    dash.style.borderRadius = '6px';
    dash.style.overflow = 'hidden';
    // create binary stream inside
    const stream = document.createElement('div'); stream.className = 'stream';
    stream.style.position = 'absolute'; stream.style.left = '0'; stream.style.top = '0'; stream.style.width = '100%'; stream.style.height = '100%';
    stream.style.color = 'rgba(59,130,246,0.9)'; stream.style.fontSize = '10px'; stream.style.fontFamily = 'monospace';
    stream.textContent = Array.from({length: rint(8,16)}).map(()=> Math.random()>0.5? '1':'0').join(' ');
    dash.appendChild(stream);
    container.appendChild(dash);
    // animate stream change
    setInterval(()=> { stream.textContent = Array.from({length: rint(8,16)}).map(()=> Math.random()>0.5? '1':'0').join(' '); }, rand(600,1600));
  }

  // 7) Valve rotation and pressure gauge (JS-driven)
  const valve = document.createElement('div'); valve.className = 'valve';
  valve.style.position = 'absolute'; valve.style.left = '62%'; valve.style.bottom = '28px'; valve.style.width = '36px'; valve.style.height = '36px'; valve.style.borderRadius = '50%'; valve.style.background = 'linear-gradient(90deg,#94a3b8,#475569)';
  container.appendChild(valve);
  (function rotateValve(){
    valve.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(90deg)' }, { transform: 'rotate(0deg)' }], { duration: rand(2200,4200), easing: 'ease-in-out' });
    setTimeout(rotateValve, rand(2600,5200));
  })();

  // 8) Water pump steam release (periodic)
  setInterval(()=> {
    if(prefersReduced) return;
    const steam = document.createElement('div'); steam.className = 'steam';
    steam.style.position = 'absolute'; steam.style.left = '56%'; steam.style.bottom = '36px'; steam.style.width = '80px'; steam.style.height = '40px';
    steam.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)';
    steam.style.filter = 'blur(12px)';
    container.appendChild(steam);
    steam.animate([{ opacity:0 }, { opacity:0.6 }, { opacity:0 }], { duration: 1200, easing: 'ease-out' }).onfinish = () => container.removeChild(steam);
  }, rand(4200,9000));
}

/* =========================
   Initialize scenes
   ========================= */
function initScenes(){
  buildConstructionScene(constructionScene);
  buildElectricalScene(electricalScene);
  buildInfraScene(infraScene);
}
initScenes();

/* =========================
   Micro-interactions & accessibility
   ========================= */
(function microInteractions(){
  // Panel tilt on pointer move
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

  // Brand hover glow
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


