/* =========================
   Infrastructure: Binary Streams & Data Center Simulation
   Append this to js/script.js (or merge)
   ========================= */

/* Utility helpers */
const rand = (min, max) => Math.random() * (max - min) + min;
const rint = (min, max) => Math.floor(rand(min, max + 1));
const choose = arr => arr[Math.floor(Math.random() * arr.length)];

/* Infra DOM refs */
const infraScene = document.getElementById('infraScene');
const binaryStreamsEl = document.getElementById('binaryStreams');
const racksGroup = document.getElementById('racks');
const packetsGroup = document.getElementById('packets');
const circuitLinesGroup = document.getElementById('circuitLines');
const infraLabels = document.getElementById('infraLabels');

/* Configuration */
const STREAM_COUNT = 24; // at least 20
const STREAM_MIN_LEN = 18;
const STREAM_MAX_LEN = 48;
const STREAM_MIN_SPEED = 30; // px/sec
const STREAM_MAX_SPEED = 160; // px/sec

/* Colors */
const GREEN_A = '#00FF41';
const GREEN_B = '#00E676';
const GREEN_C = '#66FF99';

/* Build server racks (SVG) */
function buildRacks() {
  const rackCount = 3;
  const rackWidth = 180;
  const rackHeight = 360;
  for (let r = 0; r < rackCount; r++) {
    const rx = r * (rackWidth + 40);
    const rack = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rack.setAttribute('class', 'rack');
    rack.setAttribute('transform', `translate(${rx},0)`);

    // rack body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body.setAttribute('x', 0);
    body.setAttribute('y', 0);
    body.setAttribute('width', rackWidth);
    body.setAttribute('height', rackHeight);
    body.setAttribute('rx', 8);
    body.setAttribute('fill', 'url(#rackGrad)');
    rack.appendChild(body);

    // ventilation grills and units
    const unitCount = 10;
    for (let u = 0; u < unitCount; u++) {
      const uy = 12 + u * 32;
      const unit = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      unit.setAttribute('transform', `translate(8, ${uy})`);

      const urect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      urect.setAttribute('x', 0);
      urect.setAttribute('y', 0);
      urect.setAttribute('width', 164);
      urect.setAttribute('height', 24);
      urect.setAttribute('rx', 4);
      urect.setAttribute('fill', '#0b1220');
      unit.appendChild(urect);

      // ventilation slits
      for (let s = 0; s < 6; s++) {
        const slit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        slit.setAttribute('x', 8 + s * 24);
        slit.setAttribute('y', 6);
        slit.setAttribute('width', 14);
        slit.setAttribute('height', 4);
        slit.setAttribute('rx', 2);
        slit.setAttribute('fill', 'rgba(255,255,255,0.02)');
        unit.appendChild(slit);
      }

      // LEDs cluster
      for (let l = 0; l < 6; l++) {
        const led = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const lx = 140 + l * 4 - 12;
        led.setAttribute('cx', lx);
        led.setAttribute('cy', 12);
        led.setAttribute('r', 2.2);
        const color = choose([GREEN_A, GREEN_B, GREEN_C]);
        led.setAttribute('fill', color);
        led.setAttribute('class', 'led');
        // random blink speed
        const dur = rand(800, 2200);
        led.style.animation = `ledBlink ${dur}ms linear ${Math.random()*dur}ms infinite`;
        unit.appendChild(led);
      }

      rack.appendChild(unit);
    }

    racksGroup.appendChild(rack);
  }
}

/* Build circuit lines (SVG paths) */
function buildCircuits() {
  // create a few circuit paths between racks
  const paths = [
    'M 40 220 C 180 200, 360 200, 520 220',
    'M 40 260 C 180 280, 360 280, 520 260',
    'M 220 40 L 220 320',
    'M 460 40 L 460 320'
  ];
  paths.forEach((d, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'circuit-line');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0,255,65,0.06)');
    path.setAttribute('stroke-width', '1.6');
    circuitLinesGroup.appendChild(path);

    // occasional pulse overlay
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pulse.setAttribute('d', d);
    pulse.setAttribute('class', 'circuit-pulse');
    pulse.setAttribute('fill', 'none');
    pulse.setAttribute('stroke-dasharray', '120');
    pulse.setAttribute('stroke-dashoffset', '120');
    circuitLinesGroup.appendChild(pulse);

    // schedule pulses at random intervals
    (function schedulePulse(p) {
      const delay = rand(2200, 9000);
      setTimeout(() => {
        p.style.opacity = 1;
        p.style.animation = `circuitPulse ${rand(900, 1600)}ms ease-out forwards`;
        // clear animation after done
        setTimeout(() => {
          p.style.opacity = 0;
          p.style.animation = '';
          schedulePulse(p);
        }, rand(900, 1600) + 80);
      }, delay);
    })(pulse);
  });
}

/* Create horizontal packets (SVG rects) that travel between racks */
function spawnPacket() {
  const packet = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const y = rand(120, 300);
  packet.setAttribute('x', -40);
  packet.setAttribute('y', y);
  packet.setAttribute('width', 18);
  packet.setAttribute('height', 8);
  packet.setAttribute('rx', 3);
  packet.setAttribute('class', 'packet');
  packet.setAttribute('fill', choose([GREEN_A, GREEN_B, GREEN_C]));
  packetsGroup.appendChild(packet);

  const duration = rand(1600, 4200);
  // animate via CSS transform using requestAnimationFrame
  const start = performance.now();
  function frame(now) {
    const t = (now - start) / duration;
    if (t >= 1) {
      packetsGroup.removeChild(packet);
      return;
    }
    const x = (t * 100) + 2; // percent
    packet.setAttribute('transform', `translate(${(x/100)*900},0)`);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Binary streams builder */
function buildBinaryStreams() {
  // clear existing
  binaryStreamsEl.innerHTML = '';
  // compute available width and create columns
  const containerWidth = binaryStreamsEl.clientWidth || (infraScene.clientWidth - 36);
  // create STREAM_COUNT columns
  for (let i = 0; i < STREAM_COUNT; i++) {
    const col = document.createElement('div');
    col.className = 'binary-stream';
    // randomize width slightly
    col.style.width = `${14 + (i % 3)}px`;
    // random opacity
    col.style.opacity = (rand(0.28, 0.98)).toFixed(2);
    // create digits
    const len = rint(STREAM_MIN_LEN, STREAM_MAX_LEN);
    for (let j = 0; j < len; j++) {
      const d = document.createElement('span');
      d.className = 'binary-digit';
      d.textContent = Math.random() > 0.5 ? '1' : '0';
      // random initial bright/faint
      const r = Math.random();
      if (r > 0.94) d.classList.add('bright');
      else if (r < 0.08) d.classList.add('faint');
      col.appendChild(d);
    }
    // randomize speed (px/sec) and delay
    const speed = rand(STREAM_MIN_SPEED, STREAM_MAX_SPEED);
    const delay = rand(0, 2200);
    // store metadata
    col.dataset.speed = speed;
    col.dataset.delay = delay;
    col.dataset.length = col.children.length;
    binaryStreamsEl.appendChild(col);

    // start animation loop for this column
    animateBinaryColumn(col);
  }
}

/* Animate a single binary column: vertical translation + regeneration */
function animateBinaryColumn(col) {
  const digits = Array.from(col.children);
  const speed = parseFloat(col.dataset.speed);
  const delay = parseFloat(col.dataset.delay);
  const totalHeight = digits.reduce((acc, el) => acc + el.offsetHeight + 2, 0);
  // initial offset (start above)
  let offset = - (Math.random() * 200 + 40);
  let lastTime = performance.now() + delay;
  // random regen interval
  const regenInterval = rand(900, 4200);

  function step(now) {
    const dt = now - lastTime;
    lastTime = now;
    // move down by speed * dt
    offset += (speed * dt) / 1000;
    // apply transform
    col.style.transform = `translateY(${offset}px)`;
    // when column fully scrolled past bottom, reset
    const containerHeight = binaryStreamsEl.clientHeight || (infraScene.clientHeight - 56);
    if (offset > containerHeight + 40) {
      offset = - (Math.random() * 200 + 40);
      // regenerate digits randomly to avoid repetition
      regenerateDigits(digits);
    }
    // small per-digit flicker: randomly brighten or fade digits
    if (Math.random() < 0.06) {
      const idx = rint(0, digits.length - 1);
      const el = digits[idx];
      if (!el) return;
      el.classList.remove('bright', 'faint');
      const r = Math.random();
      if (r > 0.92) el.classList.add('bright');
      else if (r < 0.06) el.classList.add('faint');
      // occasionally change the digit
      if (Math.random() < 0.5) el.textContent = Math.random() > 0.5 ? '1' : '0';
    }
    requestAnimationFrame(step);
  }

  // start after delay
  setTimeout(() => {
    lastTime = performance.now();
    requestAnimationFrame(step);
  }, delay);
}

/* Regenerate digits in a column */
function regenerateDigits(digits) {
  digits.forEach(d => {
    d.textContent = Math.random() > 0.5 ? '1' : '0';
    d.classList.remove('bright', 'faint');
    const r = Math.random();
    if (r > 0.96) d.classList.add('bright');
    else if (r < 0.06) d.classList.add('faint');
  });
}

/* Floating labels */
function buildLabels() {
  const labels = ['SYNC', 'UPLOAD', 'CACHE', 'AI', 'DB', 'API'];
  infraLabels.innerHTML = '';
  labels.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'infra-label';
    el.textContent = t;
    // random position by grid placement
    el.style.gridColumn = (i % 3) + 1;
    infraLabels.appendChild(el);
    // schedule fade in/out loops
    (function loopLabel(node) {
      const delay = rand(400, 2600) + i * 200;
      setTimeout(() => {
        node.classList.add('show');
        // show for a random duration
        setTimeout(() => {
          node.classList.remove('show');
          // repeat
          setTimeout(() => loopLabel(node), rand(1600, 5200));
        }, rand(1200, 3600));
      }, delay);
    })(el);
  });
}

/* Initialize infra simulation */
function initInfraSimulation() {
  // build racks, circuits, streams, labels
  buildRacks();
  buildCircuits();
  buildBinaryStreams();
  buildLabels();

  // spawn packets periodically
  setInterval(() => {
    spawnPacket();
  }, rand(600, 1400));

  // responsive: rebuild streams on resize to adjust heights
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // rebuild streams to adapt to new height
      buildBinaryStreams();
    }, 300);
  });
}

/* Start when DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  // ensure infraScene exists
  if (document.getElementById('infraScene')) {
    initInfraSimulation();
  }
});
