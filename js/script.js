/* js/script.js
   - Builds detailed SVG parts and animates them
   - Creates many independent elements per scene
   - Uses CSS animations and requestAnimationFrame for micro motion
   - Respects prefers-reduced-motion
*/

/* Utilities */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const choose = arr => arr[Math.floor(Math.random() * arr.length)];
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* DOM refs */
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

/* Progress & status */
const progressSequence = [61,63,65,67,69,71,73,75];
let progressIndex = 0;
function setProgress(v){
  progressFill.style.width = `${v}%`;
  progressPercent.textContent = `${v}%`;
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
  if(prefersReduced){ statusRotator.textContent = statuses[statusIndex % statuses.length]; statusIndex++; return; }
  statusRotator.animate([{ opacity:1 }, { opacity:0 }], { duration:300, fill:'forwards' }).onfinish = () => {
    statusRotator.textContent = statuses[statusIndex % statuses.length];
    statusRotator.animate([{ opacity:0 }, { opacity:1 }], { duration:300, fill:'forwards' });
    statusIndex++;
  };
}
setInterval(rotateStatus, 4000);
rotateStatus();

/* Live info */
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

/* Background particles (canvas) */
(function bgParticles(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.round((w*h)/90000);
  for(let i=0;i<count;i++){
    particles.push({ x: Math.random()*w, y: Math.random()*h, r: rand(0.3,1.8), vx: rand(-0.12,0.12), vy: rand(-0.03,0.03), alpha: rand(0.02,0.18) });
  }
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; particles.length = 0; for(let i=0;i<count;i++) particles.push({ x: Math.random()*w, y: Math.random()*h, r: rand(0.3,1.8), vx: rand(-0.12,0.12), vy: rand(-0.03,0.03), alpha: rand(0.02,0.18) }); }
  addEventListener('resize', resize);
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = w + 10; if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10; if(p.y > h + 10) p.y = -10;
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* Parallax pointer depth */
(function parallax(){
  if(prefersReduced) return;
  const lights = document.querySelectorAll('.volumetric .beam');
  const objects = document.querySelectorAll('.bg-objects .gear, .bg-objects .star');
  let mouseX = 0, mouseY = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', (e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    mouseX = (e.clientX - cx) / cx; mouseY = (e.clientY - cy) / cy;
  }, { passive:true });
  function raf(){
    rx += (mouseX - rx) * 0.06; ry += (mouseY - ry) * 0.06;
    lights.forEach((el,i) => { const depth = (i+1)*6; el.style.transform = `translate3d(${rx*depth}px, ${ry*depth}px, 0)`; });
    objects.forEach((el,i) => { const depth = (i%2===0?1.6:2.6); el.style.transform = `translate3d(${rx*(i+1)*depth}px, ${ry*(i+1)*depth}px, 0) rotate(${rx*(i+1)*6}deg)`; });
    requestAnimationFrame(raf);
  }
  raf();
})();

/* Build Construction Scene: detailed SVG parts + HTML props */
function buildConstructionScene(){
  const svg = document.getElementById('craneSVG');
  if(!svg) return;

  // Animate crane arm rotation and trolley movement
  const armGroup = svg.querySelector('#armGroup > g');
  const trolley = svg.querySelector('#trolley');
  const hookGroup = svg.querySelector('#hookGroup');

  if(!prefersReduced){
    armGroup.style.animation = `craneRotate ${rand(10,18).toFixed(2)}s cubic-bezier(.2,.9,.3,1) ${rand(0,2).toFixed(2)}s infinite`;
    trolley.style.animation = `trolleyMove ${rand(6,12).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    hookGroup.style.animation = `hookLift ${rand(2.6,5.2).toFixed(2)}s ease-in-out ${rand(0,1.6).toFixed(2)}s infinite`;
  }

  // Create floors inside SVG (8-12) with detailed bricks and bolts
  const floorsGroup = svg.querySelector('#floorsGroup');
  const floorCount = rint(8,12);
  for(let i=0;i<floorCount;i++){
    const y = 260 - i*44;
    const floor = document.createElementNS('http://www.w3.org/2000/svg','g');
    floor.setAttribute('transform', `translate(0, ${y})`);
    floor.classList.add('svg-floor');

    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x','0'); rect.setAttribute('y','0'); rect.setAttribute('width','260'); rect.setAttribute('height','36'); rect.setAttribute('rx','8');
    rect.setAttribute('fill','#263445'); rect.setAttribute('opacity','0.98');
    floor.appendChild(rect);

    // bricks
    const brickCount = rint(8,14);
    for(let b=0;b<brickCount;b++){
      const bx = 8 + b*(240/(brickCount-1));
      const brick = document.createElementNS('http://www.w3.org/2000/svg','rect');
      brick.setAttribute('x', `${bx}`); brick.setAttribute('y','28'); brick.setAttribute('width','18'); brick.setAttribute('height','12');
      brick.setAttribute('rx','2'); brick.setAttribute('fill','#b45309'); brick.setAttribute('opacity','0');
      floorsGroup.appendChild(brick);
      // staggered placement
      setTimeout(()=> {
        brick.style.transition = `transform ${rand(0.8,1.6).toFixed(2)}s cubic-bezier(.2,.9,.3,1), opacity ${rand(0.6,1.2).toFixed(2)}s`;
        brick.style.transform = 'translateY(0)';
        brick.setAttribute('opacity','1');
      }, (i*120 + b*40));
    }
  }

  // HTML props: vehicles, mixer, toolbox, cones, workers, dust, sparks
  const props = constructionProps;

  // Vehicles (SVG-quality shapes built with divs + pseudo details)
  const vehicleSpecs = [
    {type:'dump', left:8, color:['#b45309','#92400e']},
    {type:'excavator', left:26, color:['#475569','#94a3b8']},
    {type:'bulldozer', left:44, color:['#111827','#0b1220']}
  ];
  vehicleSpecs.forEach((v,i) => {
    const el = document.createElement('div'); el.className = `prop vehicle ${v.type}`;
    el.style.left = `${v.left}%`; el.style.bottom = '12px'; el.style.width = `${rint(90,140)}px`; el.style.height = `${rint(36,56)}px`;
    el.style.borderRadius = '8px';
    el.style.background = `linear-gradient(90deg, ${v.color[0]}, ${v.color[1]})`;
    el.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';
    el.style.animation = `vehicleDrive ${rand(8,16).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
    // add wheels as small circles
    for(let w=0; w<3; w++){
      const wheel = document.createElement('div'); wheel.className = 'wheel';
      wheel.style.position = 'absolute'; wheel.style.bottom = '4px'; wheel.style.left = `${8 + w*28}px`;
      wheel.style.width = '18px'; wheel.style.height = '18px'; wheel.style.borderRadius = '50%';
      wheel.style.background = '#071226'; wheel.style.boxShadow = 'inset 0 -4px 8px rgba(0,0,0,0.6)';
      wheel.style.transformOrigin = 'center';
      wheel.style.animation = `vehicleDrive ${rand(8,16).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
      el.appendChild(wheel);
    }
    props.appendChild(el);
  });

  // Mixer
  const mixer = document.createElement('div'); mixer.className = 'prop mixer';
  mixer.style.left = '18%'; mixer.style.bottom = '18px'; mixer.style.width = '56px'; mixer.style.height = '56px';
  mixer.style.borderRadius = '8px'; mixer.style.background = 'linear-gradient(90deg,#94a3b8,#475569)';
  mixer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
  mixer.style.animation = `mixerSpin ${rand(2.6,4.2).toFixed(2)}s linear infinite`;
  props.appendChild(mixer);

  // Toolbox + hammer
  const toolbox = document.createElement('div'); toolbox.className = 'prop toolbox';
  toolbox.style.left = '12%'; toolbox.style.bottom = '18px'; toolbox.style.width = '44px'; toolbox.style.height = '28px';
  toolbox.style.background = 'linear-gradient(90deg,#3b82f6,#1e3a8a)'; toolbox.style.borderRadius = '6px';
  props.appendChild(toolbox);

  const hammer = document.createElement('div'); hammer.className = 'prop hammer';
  hammer.style.left = '14%'; hammer.style.bottom = '36px'; hammer.style.width = '8px'; hammer.style.height = '28px'; hammer.style.background = '#94a3b8';
  props.appendChild(hammer);
  setInterval(()=> { hammer.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }], { duration: rint(800,1600), easing: 'ease-in-out' }); }, rint(1200,2600));

  // Cones
  for(let i=0;i<8;i++){
    const c = document.createElement('div'); c.className = 'prop cone';
    c.style.left = `${8 + i*3}%`; c.style.bottom = `${18 + (i%2)*6}px`; c.style.width = '10px'; c.style.height = '18px';
    c.style.background = 'linear-gradient(180deg,var(--accent),#b45309)'; c.style.borderRadius = '3px';
    c.style.transform = `rotate(${rand(-8,8)}deg)`; props.appendChild(c);
  }

  // Workers (22) with articulated arms simulated by small SVG inside divs
  const workerActions = ['walk','carry','jack','weld','wrench','inspect'];
  for(let i=0;i<22;i++){
    const w = document.createElement('div'); w.className = 'prop worker';
    w.style.left = `${6 + Math.random()*70}%`; w.style.bottom = `${12 + Math.random()*18}px`; w.style.width = '36px'; w.style.height = '72px';
    w.style.borderRadius = '8px'; w.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
    w.style.background = Math.random()>0.5 ? 'linear-gradient(180deg,#f59e0b,#b45309)' : 'linear-gradient(180deg,#3b82f6,#1e40af)';
    const action = choose(workerActions);
    if(action === 'walk') w.style.animation = `workerWalk ${rand(4.2,8.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    else if(action === 'carry') w.style.animation = `workerCarry ${rand(4.6,7.6).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    else if(action === 'jack') w.style.animation = `jackhammer ${rand(0.6,1.2).toFixed(2)}s steps(2) ${rand(0,1).toFixed(2)}s infinite`;
    else if(action === 'weld'){
      const sparks = document.createElement('div'); sparks.className = 'spark';
      sparks.style.position = 'absolute'; sparks.style.left = '50%'; sparks.style.top = '8%'; sparks.style.width = '6px'; sparks.style.height = '6px';
      sparks.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(255,200,80,1))'; sparks.style.borderRadius = '50%';
      sparks.style.opacity = 0; sparks.style.animation = `weldSparks ${rand(0.6,1.6).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      w.appendChild(sparks);
      w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else w.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    props.appendChild(w);
  }

  // Dust & smoke
  for(let i=0;i<12;i++){
    const d = document.createElement('div'); d.className = 'prop dust';
    d.style.right = `${8 + Math.random()*60}%`; d.style.bottom = `${40 + Math.random()*120}px`;
    d.style.width = `${rint(60,140)}px`; d.style.height = `${rint(40,120)}px`; d.style.borderRadius = '50%';
    d.style.background = 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)';
    d.style.filter = 'blur(6px)'; d.style.opacity = rand(0.2,0.9).toFixed(2);
    d.style.animation = `dustFloat ${rand(4,10).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    props.appendChild(d);
  }

  // Concrete blocks pendulum (JS-driven)
  const blocks = [];
  for(let i=0;i<4;i++){
    const b = document.createElement('div'); b.className = 'prop block';
    b.style.width = `${rint(28,44)}px`; b.style.height = `${rint(18,28)}px`; b.style.background = 'linear-gradient(90deg,#9ca3af,#6b7280)';
    b.style.position = 'absolute'; b.style.left = `${48 + i*6}%`; b.style.bottom = `${120 + i*6}px`; b.style.opacity = 0.95;
    constructionProps.appendChild(b);
    blocks.push(b);
  }
  blocks.forEach((b, idx) => {
    const baseDelay = rand(0,2); const amplitude = rand(6,18); const period = rand(2200,5200);
    let t0 = performance.now() + baseDelay*1000;
    function animateBlock(now){
      const dt = now - t0; const phase = (dt % period) / period; const swing = Math.sin(phase * Math.PI * 2) * amplitude;
      b.style.transform = `translate3d(${swing}px, ${Math.sin(phase*Math.PI*2)*4}px, 0) rotate(${Math.sin(phase*Math.PI*2)*2}deg)`;
      requestAnimationFrame(animateBlock);
    }
    requestAnimationFrame(animateBlock);
  });

  // Add small randomized CSS variables for variety
  constructionProps.querySelectorAll('*').forEach(el => {
    el.style.setProperty('--anim-d', `${rand(2,12).toFixed(2)}s`);
    el.style.setProperty('--anim-delay', `${rand(0,2).toFixed(2)}s`);
  });
}

/* Build Electrical Scene */
function buildElectricalScene(){
  const svg = document.getElementById('electricalSVG');
  if(!svg) return;

  // Populate switchgear with breakers and LEDs
  const breakersGroup = svg.querySelector('#breakers');
  for(let r=0;r<4;r++){
    for(let c=0;c<6;c++){
      const bx = 8 + c*28; const by = 8 + r*64;
      const breaker = document.createElementNS('http://www.w3.org/2000/svg','g');
      breaker.setAttribute('transform', `translate(${bx},${by})`);
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x','0'); rect.setAttribute('y','0'); rect.setAttribute('width','18'); rect.setAttribute('height','36'); rect.setAttribute('rx','4'); rect.setAttribute('fill','#111827');
      breaker.appendChild(rect);
      const led = document.createElementNS('http://www.w3.org/2000/svg','circle');
      led.setAttribute('cx','14'); led.setAttribute('cy','8'); led.setAttribute('r','4');
      const ledColor = choose(['#10B981','#3B82F6','#F59E0B']);
      led.setAttribute('fill', ledColor); led.setAttribute('opacity','0.95');
      breaker.appendChild(led);
      breakersGroup.appendChild(breaker);
      led.style.animation = `ledPulse ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    }
  }

  // Cable trays and glows
  const traysGroup = svg.querySelector('#cableTrays');
  for(let i=0;i<12;i++){
    const tx = 20 + (i%6)*120; const ty = 20 + Math.floor(i/6)*80;
    const tray = document.createElementNS('http://www.w3.org/2000/svg','rect');
    tray.setAttribute('x', `${tx}`); tray.setAttribute('y', `${ty}`); tray.setAttribute('width','120'); tray.setAttribute('height','8'); tray.setAttribute('rx','4'); tray.setAttribute('fill','#0b1220'); tray.setAttribute('opacity','0.9');
    traysGroup.appendChild(tray);
    const glow = document.createElementNS('http://www.w3.org/2000/svg','rect');
    glow.setAttribute('x', `${tx}`); glow.setAttribute('y', `${ty}`); glow.setAttribute('width','6'); glow.setAttribute('height','8'); glow.setAttribute('rx','3'); glow.setAttribute('fill','#3B82F6'); glow.setAttribute('opacity','0');
    traysGroup.appendChild(glow);
    (function(g){
      function pulse(){ g.animate([{ opacity:0 }, { opacity:0.9 }, { opacity:0 }], { duration: rand(900,2200), easing: 'ease-in-out' }); setTimeout(pulse, rand(1200,4200)); }
      setTimeout(pulse, rand(200,1200));
    })(glow);
  }

  // Electricians (12)
  const props = electricalProps;
  const actions = ['climb','replace','tighten','test','inspect'];
  for(let i=0;i<12;i++){
    const e = document.createElement('div'); e.className = 'prop electrician';
    e.style.left = `${8 + Math.random()*72}%`; e.style.bottom = `${12 + Math.random()*18}px`; e.style.width = '36px'; e.style.height = '72px';
    e.style.borderRadius = '8px'; e.style.background = 'linear-gradient(180deg,#3b82f6,#0b1220)'; e.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
    const action = choose(actions);
    if(action === 'climb') e.style.animation = `climb ${rand(6,12).toFixed(2)}s ease-in-out ${rand(0,2).toFixed(2)}s infinite`;
    else if(action === 'replace'){
      const fuse = document.createElement('div'); fuse.className = 'prop fuse';
      fuse.style.position = 'absolute'; fuse.style.left = '50%'; fuse.style.top = '8%'; fuse.style.width = '10px'; fuse.style.height = '18px';
      fuse.style.background = 'linear-gradient(90deg,#f59e0b,#92400e)'; fuse.style.borderRadius = '3px';
      fuse.style.animation = `sparkBurst ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
      e.appendChild(fuse);
      e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    } else e.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
    props.appendChild(e);
  }

  // Sparks & arcs
  for(let i=0;i<20;i++){
    const s = document.createElement('div'); s.className = 'prop arc';
    s.style.left = `${12 + Math.random()*72}%`; s.style.top = `${8 + Math.random()*60}%`; s.style.width = '6px'; s.style.height = '6px';
    s.style.borderRadius = '50%'; s.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(59,130,246,1))';
    s.style.opacity = 0; s.style.filter = 'blur(2px)';
    s.style.animation = `sparkBurst ${rand(1.2,3.6).toFixed(2)}s linear ${rand(0,3).toFixed(2)}s infinite`;
    props.appendChild(s);
  }

  // Fans
  for(let i=0;i<4;i++){
    const fan = document.createElement('div'); fan.className = 'prop fan';
    fan.style.right = `${6 + i*8}%`; fan.style.bottom = `${40 + i*6}px`; fan.style.width = '36px'; fan.style.height = '36px';
    fan.style.borderRadius = '50%'; fan.style.background = 'linear-gradient(90deg,#0b1220,#1f2937)';
    fan.style.animation = `fanSpin ${rand(1.2,3.2).toFixed(2)}s linear ${rand(0,1).toFixed(2)}s infinite`;
    props.appendChild(fan);
  }

  // Occasional flash
  setInterval(()=> {
    if(prefersReduced) return;
    const flash = document.createElement('div'); flash.className = 'prop flash';
    flash.style.position = 'absolute'; flash.style.left = '0'; flash.style.top = '0'; flash.style.right = '0'; flash.style.bottom = '0';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)'; flash.style.opacity = 0;
    electricalScene.appendChild(flash);
    flash.animate([{ opacity:0 }, { opacity:0.9 }, { opacity:0 }], { duration: 220, easing: 'ease-out' }).onfinish = () => electricalScene.removeChild(flash);
  }, rand(4200,12000));
}

/* Build Infrastructure Scene */
function buildInfraScene(){
  const svg = document.getElementById('infraSVG');
  if(!svg) return;

  // Racks with many units and LEDs
  const racksGroup = svg.querySelector('#racks');
  const rackCount = 3;
  for(let r=0;r<rackCount;r++){
    const rack = document.createElementNS('http://www.w3.org/2000/svg','g');
    rack.setAttribute('transform', `translate(${r*220},0)`);
    const rackBody = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rackBody.setAttribute('x','0'); rackBody.setAttribute('y','0'); rackBody.setAttribute('width','180'); rackBody.setAttribute('height','360'); rackBody.setAttribute('rx','8');
    rackBody.setAttribute('fill','#071226'); rack.appendChild(rackBody);
    for(let u=0;u<8;u++){
      const unit = document.createElementNS('http://www.w3.org/2000/svg','g');
      unit.setAttribute('transform', `translate(8, ${12 + u*40})`);
      const uRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      uRect.setAttribute('x','0'); uRect.setAttribute('y','0'); uRect.setAttribute('width','164'); uRect.setAttribute('height','32'); uRect.setAttribute('rx','6'); uRect.setAttribute('fill','#0b1220');
      unit.appendChild(uRect);
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

  // Fiber tray and packets (HTML overlay)
  const fiber = document.createElement('div'); fiber.className = 'prop fiber';
  fiber.style.position = 'absolute'; fiber.style.right = '8%'; fiber.style.top = '12%'; fiber.style.width = '160px'; fiber.style.height = '8px';
  fiber.style.background = 'linear-gradient(90deg,#3b82f6,#0b1220)'; fiber.style.borderRadius = '6px';
  infraProps.appendChild(fiber);
  for(let i=0;i<14;i++){
    const p = document.createElement('div'); p.className = 'prop packet';
    p.style.position = 'absolute'; p.style.left = `${rand(0,100)}%`; p.style.bottom = '6px'; p.style.width = '10px'; p.style.height = '8px';
    p.style.borderRadius = '2px'; p.style.background = `linear-gradient(90deg, ${choose(['#F59E0B','#3B82F6','#10B981'])}, ${choose(['#3B82F6','#10B981','#F59E0B'])})`;
    p.style.animation = `packetFloat ${rand(2.2,5.2).toFixed(2)}s linear ${rand(0,2).toFixed(2)}s infinite`;
    fiber.appendChild(p);
  }

  // Pipes with flowing liquid and bubbles
  const pipesGroup = svg.querySelector('#pipes');
  for(let i=0;i<2;i++){
    const pipe = document.createElementNS('http://www.w3.org/2000/svg','rect');
    pipe.setAttribute('x', `${i*240}`); pipe.setAttribute('y','0'); pipe.setAttribute('width','220'); pipe.setAttribute('height','28'); pipe.setAttribute('rx','14'); pipe.setAttribute('fill','#0b1220');
    pipesGroup.appendChild(pipe);
    const liquid = document.createElement('div'); liquid.className = 'prop liquid';
    liquid.style.position = 'absolute'; liquid.style.left = `${420 + i*240}px`; liquid.style.bottom = '12px'; liquid.style.width = '220px'; liquid.style.height = '28px'; liquid.style.overflow = 'hidden';
    const flow = document.createElement('div'); flow.style.position = 'absolute'; flow.style.left = '-40%'; flow.style.top = '0'; flow.style.width = '60%'; flow.style.height = '100%';
    flow.style.background = 'linear-gradient(90deg, rgba(59,130,246,0.6), rgba(16,185,129,0.6))';
    flow.style.animation = `liquidFlow ${rand(2.6,4.6).toFixed(2)}s linear infinite`;
    liquid.appendChild(flow); infraProps.appendChild(liquid);
    for(let b=0;b<8;b++){
      const bubble = document.createElement('div'); bubble.className = 'prop bubble';
      bubble.style.position = 'absolute'; bubble.style.left = `${rand(0,100)}%`; bubble.style.bottom = `${rand(0,100)}%`;
      bubble.style.width = `${rand(4,10)}px`; bubble.style.height = bubble.style.width; bubble.style.borderRadius = '50%';
      bubble.style.background = 'rgba(255,255,255,0.06)'; bubble.style.filter = 'blur(1px)'; bubble.style.opacity = rand(0.2,0.9).toFixed(2);
      flow.appendChild(bubble);
      (function(bub){
        const dur = rand(1800,4200);
        function rise(){
          bub.animate([{ transform: 'translateY(0)', opacity: bub.style.opacity }, { transform: 'translateY(-120px)', opacity: 0 }], { duration: dur, easing: 'linear' }).onfinish = () => {
            bub.style.left = `${rand(0,100)}%`; bub.style.opacity = rand(0.2,0.9).toFixed(2); setTimeout(rise, rand(200,1200));
          };
        }
        setTimeout(rise, rand(200,800));
      })(bubble);
    }
  }

  // Engineers
  for(let i=0;i<8;i++){
    const eng = document.createElement('div'); eng.className = 'prop engineer';
    eng.style.right = `${8 + Math.random()*40}%`; eng.style.bottom = `${12 + Math.random()*18}px`; eng.style.width = '44px'; eng.style.height = '72px';
    eng.style.background = 'linear-gradient(180deg,#3b82f6,#0b1220)'; eng.style.borderRadius = '8px';
    eng.style.animation = `workerPulse ${rand(3.6,6.6).toFixed(2)}s ease-in-out ${rand(0,1).toFixed(2)}s infinite`;
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

  // Valve rotation & steam
  const valve = document.createElement('div'); valve.className = 'prop valve';
  valve.style.position = 'absolute'; valve.style.left = '62%'; valve.style.bottom = '28px'; valve.style.width = '36px'; valve.style.height = '36px'; valve.style.borderRadius = '50%';
  valve.style.background = 'linear-gradient(90deg,#94a3b8,#475569)'; infraProps.appendChild(valve);
  (function rotateValve(){ valve.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(90deg)' }, { transform: 'rotate(0deg)' }], { duration: rand(2200,4200), easing: 'ease-in-out' }); setTimeout(rotateValve, rand(2600,5200)); })();

  setInterval(()=> {
    if(prefersReduced) return;
    const steam = document.createElement('div'); steam.className = 'prop steam';
    steam.style.position = 'absolute'; steam.style.left = '56%'; steam.style.bottom = '36px'; steam.style.width = '80px'; steam.style.height = '40px';
    steam.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)'; steam.style.filter = 'blur(12px)';
    infraProps.appendChild(steam);
    steam.animate([{ opacity:0 }, { opacity:0.6 }, { opacity:0 }], { duration: 1200, easing: 'ease-out' }).onfinish = () => infraProps.removeChild(steam);
  }, rand(4200,9000));
}

/* Micro interactions: panel tilt, hover glows */
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
        const rx = (py - 0.5) * 6; const ry = (px - 0.5) * -8;
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

/* Initialize scenes */
(function init(){
  buildConstructionScene();
  buildElectricalScene();
  buildInfraScene();
  if(!prefersReduced) startProgressLoop();
  else setProgress(progressSequence[0]);
})();
