/* ==========================================================================
   APEX OPS — Under Maintenance | script.js
   Handles: particle field, live clock, HUD telemetry simulation,
   progress bar loop, waveform + rack display text, cursor glow, 3D tilt.
   ========================================================================== */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Clock                                                              */
  /* ------------------------------------------------------------------ */
  const clockEl = document.getElementById('clock');
  function tickClock(){
    const d = new Date();
    const hh = String(d.getUTCHours()).padStart(2,'0');
    const mm = String(d.getUTCMinutes()).padStart(2,'0');
    const ss = String(d.getUTCSeconds()).padStart(2,'0');
    if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss} UTC`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ------------------------------------------------------------------ */
  /* Particle field (dust / embers / floating debris)                   */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !reducedMotion){
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = window.innerWidth < 720 ? 40 : 90;

    function resize(){
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function makeParticle(){
      const colorRoll = Math.random();
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.15,
        color: colorRoll > 0.85 ? '0,184,255' : (colorRoll > 0.7 ? '255,159,26' : '210,220,230'),
        pulse: Math.random() * Math.PI * 2
      };
    }

    function init(){
      resize();
      particles = Array.from({length: COUNT}, makeParticle);
    }

    function step(){
      ctx.clearRect(0, 0, W, H);
      for (const p of particles){
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.y < -10){ p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color},${a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('resize', () => { resize(); });
    init();
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------ */
  /* Cursor glow                                                        */
  /* ------------------------------------------------------------------ */
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches){
    let raf = null;
    document.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }

  /* ------------------------------------------------------------------ */
  /* 3D tilt on glass cards                                             */
  /* ------------------------------------------------------------------ */
  if (window.matchMedia('(pointer: fine)').matches && !reducedMotion){
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* HUD telemetry — Server Status panel                                */
  /* ------------------------------------------------------------------ */
  const metrics = {
    cpu:     { value: 62, target: 62 },
    mem:     { value: 71, target: 71 },
    storage: { value: 84, target: 84 },
    net:     { value: 45, target: 45 }
  };

  function refreshTargets(){
    metrics.cpu.target     = 40 + Math.random() * 45;
    metrics.mem.target     = 50 + Math.random() * 35;
    metrics.storage.target = 70 + Math.random() * 25;
    metrics.net.target     = 20 + Math.random() * 60;
  }
  refreshTargets();
  setInterval(refreshTargets, 2400);

  function animateHud(){
    document.querySelectorAll('.hud-row').forEach(row => {
      const key = row.dataset.metric;
      const m = metrics[key];
      if (!m) return;
      m.value += (m.target - m.value) * 0.06;
      const pct = Math.round(m.value);
      row.querySelector('.hud-value').textContent = pct + '%';
      row.querySelector('.hud-bar-fill').style.width = pct + '%';
    });
    requestAnimationFrame(animateHud);
  }
  animateHud();

  // Live chart line for HUD — redraw with fresh pseudo-random data periodically
  const chartLine = document.getElementById('hudChartLine');
  if (chartLine){
    function randomChart(){
      const pts = [];
      for (let i = 0; i <= 11; i++){
        const x = i * 20;
        const y = 8 + Math.random() * 34;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      chartLine.setAttribute('points', pts.join(' '));
    }
    randomChart();
    setInterval(randomChart, 2200);
  }

  /* ------------------------------------------------------------------ */
  /* Progress bar 0 → 100 → restart, with percentage + background pulse */
  /* ------------------------------------------------------------------ */
  const progressFill = document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');
  const progressEta = document.getElementById('progressEta');
  const panel = document.querySelector('.panel-main');

  let progress = 0;
  const CYCLE_MS = 14000; // full 0->100 sweep duration
  let lastTs = null;

  function stepProgress(ts){
    if (lastTs === null) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    progress += (dt / CYCLE_MS) * 100;
    if (progress >= 100){
      progress = 0;
      if (panel){
        panel.style.transition = 'box-shadow 0.4s ease';
        panel.classList.add('pulse-flash');
        setTimeout(() => panel.classList.remove('pulse-flash'), 500);
      }
    }
    const shown = Math.min(100, Math.round(progress));
    if (progressFill) progressFill.style.width = shown + '%';
    if (progressPct) progressPct.textContent = shown + '%';
    if (progressEta){
      const remainingSec = Math.max(0, Math.round(((100 - progress) / 100) * (CYCLE_MS / 1000)));
      const mm = String(Math.floor(remainingSec / 60)).padStart(2,'0');
      const ss = String(remainingSec % 60).padStart(2,'0');
      progressEta.textContent = `ETA ${mm}:${ss}`;
    }
    requestAnimationFrame(stepProgress);
  }
  requestAnimationFrame(stepProgress);

  /* ------------------------------------------------------------------ */
  /* Server rack — main display text cycling                            */
  /* ------------------------------------------------------------------ */
  const rackMainText = document.getElementById('rackMainText');
  if (rackMainText){
    const states = ['SYNCING…', 'PATCHING', 'REBOOTING', 'VALIDATING', 'DEPLOYING', 'OPTIMIZED'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      rackMainText.textContent = states[i];
    }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Control room — scrolling waveform                                  */
  /* ------------------------------------------------------------------ */
  const waveform = document.getElementById('waveform');
  if (waveform){
    let offset = 0;
    function drawWave(){
      offset += 0.15;
      const pts = [];
      for (let x = 0; x <= 220; x += 4){
        const y = 30 + Math.sin((x + offset * 20) * 0.08) * 14 * Math.sin(offset * 0.5) + Math.sin((x + offset * 40) * 0.2) * 4;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      waveform.setAttribute('points', pts.join(' '));
      requestAnimationFrame(drawWave);
    }
    requestAnimationFrame(drawWave);
  }

  /* ------------------------------------------------------------------ */
  /* Feature icon tooltip via title attribute fallback (a11y)           */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('.feature-icon').forEach(btn => {
    btn.setAttribute('title', btn.dataset.tip || '');
    btn.addEventListener('click', () => {
      btn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.92)' },
        { transform: 'scale(1)' }
      ], { duration: 260, easing: 'ease-out' });
    });
  });

})();
