/* ===================================================
   PORTFOLIO DE YUSEP — Shared JavaScript
   Handles: orbit canvas, navbar, mobile menu, reveal, lazy images
   =================================================== */

/* ══════════════════════════════════════════
   PLANET ORBIT CANVAS BACKGROUND
══════════════════════════════════════════ */
(function initOrbitCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'orbit-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H, raf;

  // ── Responsive resize ──
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── Star field ──
  const STAR_COUNT = 120;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.2 + 0.3,
    a: Math.random(),
    speed: 0.003 + Math.random() * 0.005
  }));

  // ── Orbital rings ──
  const ORBITS = [
    { rx: 0.38, ry: 0.20, tilt: -15, speed: 0.00022, planets: [
        { size: 7, color: '#22d3ee', glow: 'rgba(34,211,238,0.55)', offset: 0 },
        { size: 4, color: '#818cf8', glow: 'rgba(129,140,248,0.5)', offset: Math.PI }
    ]},
    { rx: 0.28, ry: 0.14, tilt: 20, speed: 0.00035, planets: [
        { size: 5, color: '#f472b6', glow: 'rgba(244,114,182,0.5)', offset: 0.8 },
        { size: 3, color: '#34d399', glow: 'rgba(52,211,153,0.45)', offset: Math.PI + 0.8 }
    ]},
    { rx: 0.50, ry: 0.28, tilt: 8, speed: 0.00015, planets: [
        { size: 9, color: '#818cf8', glow: 'rgba(129,140,248,0.45)', offset: 1.2 },
        { size: 5, color: '#22d3ee', glow: 'rgba(34,211,238,0.5)', offset: 1.2 + Math.PI }
    ]},
    { rx: 0.22, ry: 0.10, tilt: -30, speed: 0.00055, planets: [
        { size: 4, color: '#fb923c', glow: 'rgba(251,146,60,0.5)', offset: 2.5 }
    ]}
  ];

  let orbitAngles = ORBITS.map((_, i) => i * 0.7);

  // ── Draw helpers ──
  function drawOrbit(cx, cy, rx, ry, tiltDeg, alpha) {
    const rad = tiltDeg * Math.PI / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.setLineDash([4, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function getPlanetPos(cx, cy, rx, ry, tiltDeg, angle) {
    const tiltRad = tiltDeg * Math.PI / 180;
    const ex = Math.cos(angle) * rx;
    const ey = Math.sin(angle) * ry;
    return {
      x: cx + ex * Math.cos(tiltRad) - ey * Math.sin(tiltRad),
      y: cy + ex * Math.sin(tiltRad) + ey * Math.cos(tiltRad)
    };
  }

  function drawPlanet(x, y, size, color, glow) {
    // Glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 3.5);
    grad.addColorStop(0, glow);
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, size * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    const core = ctx.createRadialGradient(x - size * 0.25, y - size * 0.25, 0, x, y, size);
    core.addColorStop(0, '#fff');
    core.addColorStop(0.3, color);
    core.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();
  }

  // ── Main render loop ──
  let lastT = 0;
  function render(t) {
    const dt = t - lastT;
    lastT = t;

    ctx.clearRect(0, 0, W, H);

    const cx = W * 0.5; // orbit centre — slightly left of screen middle
    const cy = H * 0.45;

    // Draw stars
    stars.forEach(s => {
      s.a += s.speed;
      if (s.a > 1) s.a = 0;
      const pulse = 0.3 + 0.4 * Math.abs(Math.sin(s.a * Math.PI));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${pulse * 0.5})`;
      ctx.fill();
    });

    // Draw orbits & planets
    ORBITS.forEach((orbit, i) => {
      orbitAngles[i] += orbit.speed * dt;

      const rx = orbit.rx * Math.min(W, H * 2.2);
      const ry = orbit.ry * Math.min(W, H * 2.2);

      drawOrbit(cx, cy, rx, ry, orbit.tilt, 0.1);

      orbit.planets.forEach(p => {
        const angle = orbitAngles[i] + p.offset;
        const pos = getPlanetPos(cx, cy, rx, ry, orbit.tilt, angle);
        drawPlanet(pos.x, pos.y, p.size, p.color, p.glow);
      });
    });

    raf = requestAnimationFrame(render);
  }

  raf = requestAnimationFrame(render);
})();


/* ══════════════════════════════════════════
   NAV, MOBILE MENU, REVEAL, LAZY LOAD
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar: scroll effect ──
  const nav = document.querySelector('nav');
  const scrollHandler = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
  scrollHandler();

  // ── Mobile menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    const toggleMenu = () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll Reveal ──
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(el => revealObs.observe(el));
  }

  // ── Lazy-load images ──
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window && lazyImgs.length) {
    const imgObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => imgObs.observe(img));
  }
});
