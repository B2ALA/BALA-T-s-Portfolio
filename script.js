// script.js
/**
 * NEXUS-9 SCADA COMMAND CENTER
 * Core Logic Controller
 * 
 * Handles: 
 * - Procedural Telemetry & Graphing
 * - DOM Particle Engine (Sparks/Dust) via Web Animations API
 * - Mouse Parallax & 3D Panel Tilt
 * - Custom Cursor Glow
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration & State ---
    const CONFIG = {
        fps: 60,
        particleCount: 45, // Optimized limit for DOM elements
        parallaxDampening: 0.1
    };

    const state = {
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2,
        cpu: 84.2,
        temp: 1240,
        rpm: 14200,
        pressure: 12.4,
        masterProgress: 82.4,
        graphPoints: Array(15).fill(25) // Initialize SVG path points
    };

    // --- DOM Elements Cache ---
    const DOM = {
        cursorGlow: document.getElementById('cursor-glow'),
        layers: document.querySelectorAll('.depth-layer'),
        panels: document.querySelectorAll('.ui-panel[data-tilt]'),
        particleContainer: document.getElementById('particle-engine'),
        
        // Telemetry
        valCpu: document.getElementById('val-cpu'),
        valTemp: document.getElementById('val-temp'),
        barTemp: document.getElementById('bar-temp'),
        valRpm: document.getElementById('val-rpm'),
        valPressure: document.getElementById('val-pressure'),
        valMaster: document.getElementById('master-percent'),
        barMaster: document.getElementById('master-bar'),
        
        // SVG Graph
        wavePath: document.getElementById('wave-line'),
        waveFill: document.getElementById('wave-fill')
    };

    // ==========================================
    // 1. INPUT TRACKING & PARALLAX
    // ==========================================
    window.addEventListener('mousemove', (e) => {
        state.targetX = e.clientX;
        state.targetY = e.clientY;
        
        // Instant cursor glow update
        DOM.cursorGlow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
    });

    const renderLoop = () => {
        // Linear Interpolation for smooth physical movement
        state.mouseX += (state.targetX - state.mouseX) * CONFIG.parallaxDampening;
        state.mouseY += (state.targetY - state.mouseY) * CONFIG.parallaxDampening;

        // Calculate normalized coordinates (-1 to 1)
        const normX = (state.mouseX / window.innerWidth) * 2 - 1;
        const normY = (state.mouseY / window.innerHeight) * 2 - 1;

        // Apply Parallax to Depth Layers
        DOM.layers.forEach(layer => {
            if(window.innerWidth <= 1400) return; // Disable on small screens
            
            const depth = parseFloat(layer.getAttribute('data-parallax') || 0);
            const moveX = normX * depth * 500;
            const moveY = normY * depth * 500;
            
            // Extract base transform from CSS (Z and Scale)
            const baseTransform = window.getComputedStyle(layer).transform;
            let zScale = '';
            
            if(layer.classList.contains('layer-far')) zScale = 'translateZ(-300px) scale(1.3)';
            else if(layer.classList.contains('layer-mid')) zScale = 'translateZ(-100px) scale(1.1)';
            else if(layer.classList.contains('layer-particles')) zScale = 'translateZ(200px) scale(0.9)';
            else zScale = 'translateZ(0px)';

            layer.style.transform = `${zScale} translate3d(${moveX}px, ${moveY}px, 0)`;
        });

        // Apply 3D Tilt to UI Panels
        DOM.panels.forEach(panel => {
            if(window.innerWidth <= 1400) {
                panel.style.transform = 'none';
                return;
            }
            // Panels tilt slightly away from the mouse
            const rotateX = normY * -4; 
            const rotateY = normX * 4;
            
            // Maintain base floating animation while tilting
            // Floating animation is handled by CSS, we inject tilt via style
            panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        requestAnimationFrame(renderLoop);
    };

    // ==========================================
    // 2. DOM PARTICLE ENGINE (Sparks & Atmospheric Dust)
    // ==========================================
    // Uses Web Animations API to keep animations on GPU and off main thread
    const initParticles = () => {
        if (!DOM.particleContainer) return;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const p = document.createElement('div');
            p.classList.add('dom-particle');
            
            // Randomize Type (Cyan Spark, Amber Spark, or Dust)
            const rand = Math.random();
            if (rand < 0.3) p.classList.add('cyan');
            else if (rand < 0.6) p.classList.add('amber');
            else p.classList.add('dust');

            // Size
            const size = Math.random() * 3 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            DOM.particleContainer.appendChild(p);
            animateParticle(p);
        }
    };

    const animateParticle = (el) => {
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 10;
        
        // Drift horizontally while rising
        const endX = startX + (Math.random() * 300 - 150);
        const endY = -50; // Go above screen

        const duration = Math.random() * 8000 + 4000; // 4s to 12s
        const delay = Math.random() * 5000;

        // GPU Accelerated Animation
        const animation = el.animate([
            { transform: `translate3d(${startX}px, ${startY}px, 0)`, opacity: 0 },
            { opacity: Math.random() * 0.8 + 0.2, offset: 0.2 },
            { opacity: Math.random() * 0.8 + 0.2, offset: 0.8 },
            { transform: `translate3d(${endX}px, ${endY}px, 0)`, opacity: 0 }
        ], {
            duration: duration,
            delay: delay,
            easing: 'linear'
        });

        // Loop animation independently
        animation.onfinish = () => animateParticle(el);
    };

    // ==========================================
    // 3. PROCEDURAL TELEMETRY & GRAPHS
    // ==========================================
    const updateTelemetry = () => {
        // CPU Frequency (Fluctuates slightly)
        state.cpu += (Math.random() * 0.8 - 0.4);
        state.cpu = Math.max(70, Math.min(95, state.cpu));
        DOM.valCpu.textContent = `${state.cpu.toFixed(1)} THz`;

        // Thermal Distribution
        state.temp += (Math.random() * 20 - 10);
        state.temp = Math.max(1000, Math.min(1500, state.temp));
        DOM.valTemp.textContent = `${Math.floor(state.temp).toLocaleString()} °C`;
        const tempPercent = (state.temp - 1000) / 500 * 100;
        DOM.barTemp.style.width = `${tempPercent}%`;

        // Turbine RPM
        state.rpm += (Math.random() * 100 - 50);
        DOM.valRpm.textContent = Math.floor(state.rpm).toLocaleString();

        // Pressure
        state.pressure += (Math.random() * 0.4 - 0.2);
        state.pressure = Math.max(10, Math.min(15, state.pressure));
        DOM.valPressure.textContent = `${state.pressure.toFixed(1)} BAR`;

        // Update SVG Sparkline Graph (Left Panel)
        state.graphPoints.shift();
        state.graphPoints.push(Math.random() * 30 + 10); // Random Y between 10-40

        drawGraph();
    };

    const drawGraph = () => {
        if (!DOM.wavePath || !DOM.waveFill) return;
        
        const width = 300;
        const height = 50;
        const step = width / (state.graphPoints.length - 1);
        
        let pathD = `M 0,${state.graphPoints[0]}`;
        
        // Create smooth cubic bezier curve through points
        for(let i = 1; i < state.graphPoints.length; i++) {
            const x0 = (i - 1) * step;
            const y0 = state.graphPoints[i - 1];
            const x1 = i * step;
            const y1 = state.graphPoints[i];
            
            const cp1X = x0 + step / 2;
            const cp1Y = y0;
            const cp2X = x1 - step / 2;
            const cp2Y = y1;
            
            pathD += ` C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x1},${y1}`;
        }

        DOM.wavePath.setAttribute('d', pathD);
        
        // Fill path requires closing the shape to bottom
        const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;
        DOM.waveFill.setAttribute('d', fillD);
    };

    const updateMasterProgress = () => {
        if (state.masterProgress < 99.9) {
            // Slow, uneven progress updates
            state.masterProgress += Math.random() * 0.15;
            const displayVal = Math.min(99.9, state.masterProgress).toFixed(1);
            
            DOM.valMaster.textContent = `${displayVal}%`;
            DOM.barMaster.style.width = `${displayVal}%`;
        }
    };

    // ==========================================
    // INITIALIZATION & EVENT LOOPS
    // ==========================================
    
    // Start Engine
    requestAnimationFrame(renderLoop);
    initParticles();
    
    // Timers for data updates
    setInterval(updateTelemetry, 800);
    setInterval(updateMasterProgress, 2500);

    // Initial Graph Draw
    drawGraph();
});
