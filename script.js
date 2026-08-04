// script.js

/**
 * Cyber-Industrial Operations Dashboard Engine
 * Modular Vanilla JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Engine Modules
  initParticleEngine();
  initParallaxEngine();
  initTelemetryLoop();
  initClockSystem();
});

/* ==========================================================================
   1. ATMOSPHERIC CANVAS PARTICLE ENGINE
   ========================================================================== */
function initParticleEngine() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 65;
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.8 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
      // Alternate color palette between Cyber Cyan and Industrial Orange sparks
      this.color = Math.random() > 0.4 ? '#00d8ff' : '#ff9900';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y < 0 || this.x < 0 || this.x > width) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. 3D PARALLAX CAMERA DEPTH MOVEMENT
   ========================================================================== */
function initParallaxEngine() {
  const container = document.getElementById('parallax-container');
  if (!container) return;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12; // Rotate angle X
    const y = (e.clientY / window.innerHeight - 0.5) * -12; // Rotate angle Y

    container.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
}

/* ==========================================================================
   3. PROCEDURAL TELEMETRY UPDATES & WAVEFORM GRAPH ENGINE
   ========================================================================== */
function initTelemetryLoop() {
  // Metric DOM Elements
  const elCpu = document.getElementById('val-cpu');
  const barCpu = document.getElementById('bar-cpu');
  const elMem = document.getElementById('val-mem');
  const barMem = document.getElementById('bar-mem');
  const elPressure = document.getElementById('val-pressure');
  const gaugeNeedle = document.getElementById('gauge-needle');
  const graphLine = document.getElementById('graph-line');
  const graphArea = document.getElementById('graph-area');

  // Simulated Telemetry State Variables
  let cpuVal = 72;
  let memVal = 65;
  let pressureVal = 5.6;

  // Real-time Sparkline Graph Point Array
  const graphPoints = [25, 15, 35, 10, 30, 20, 40, 15, 25, 10, 30];

  setInterval(() => {
    // 1. Procedural CPU variation
    cpuVal += (Math.random() * 4 - 2);
    cpuVal = Math.min(Math.max(Math.round(cpuVal), 50), 95);
    if (elCpu && barCpu) {
      elCpu.textContent = `${cpuVal}%`;
      barCpu.style.width = `${cpuVal}%`;
    }

    // 2. Procedural Memory variation
    memVal += (Math.random() * 2 - 1);
    memVal = Math.min(Math.max(Math.round(memVal), 40), 90);
    if (elMem && barMem) {
      elMem.textContent = `${memVal}%`;
      barMem.style.width = `${memVal}%`;
    }

    // 3. Pipeline Pressure Fluctuations & Gauge Animation
    pressureVal += (Math.random() * 0.08 - 0.04);
    pressureVal = Math.min(Math.max(pressureVal, 5.2), 6.0);
    if (elPressure) {
      elPressure.textContent = `${pressureVal.toFixed(1)} BAR`;
    }
    if (gaugeNeedle) {
      // Map pressure 5.0 -> 6.0 BAR to gauge rotation -60deg -> +60deg
      const deg = (pressureVal - 5.0) * 120 - 60;
      gaugeNeedle.style.transform = `rotate(${deg}deg)`;
    }

    // 4. Update SVG Sparkline Waveform Data
    graphPoints.shift();
    graphPoints.push(Math.floor(Math.random() * 35 + 5));
    
    let polylineString = '';
    let areaString = '0,50 ';
    
    graphPoints.forEach((pt, i) => {
      const x = i * 30;
      polylineString += `${x},${pt} `;
      areaString += `${x},${pt} `;
    });
    
    areaString += '300,50';

    if (graphLine) graphLine.setAttribute('points', polylineString.trim());
    if (graphArea) graphArea.setAttribute('points', areaString.trim());

  }, 600);
}

/* ==========================================================================
   4. SYSTEM CLOCK & LATENCY TICKS
   ========================================================================== */
function initClockSystem() {
  const clockEl = document.getElementById('system-clock');
  const latencyEl = document.getElementById('grid-latency');

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');

    if (clockEl) {
      clockEl.textContent = `${hours}:${minutes}:${seconds}.${ms}`;
    }
    requestAnimationFrame(updateClock);
  }

  requestAnimationFrame(updateClock);

  // Fluctuating network latency simulate real telemetry ping
  setInterval(() => {
    if (latencyEl) {
      const ping = (Math.random() * 0.8 + 0.9).toFixed(1);
      latencyEl.textContent = `${ping} ms`;
    }
  }, 2000);
}
