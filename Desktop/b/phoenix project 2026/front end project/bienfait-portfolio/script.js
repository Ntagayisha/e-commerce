document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  // This demo does not send to a server. Replace with fetch('/api/contact', {method:'POST', body:...})
  status.textContent = 'Message ready to send (demo): ' + data.get('name');
  status.classList.remove('muted');
  setTimeout(()=>{status.textContent='Thank you — message simulated.'},800);
});

/* Lightweight pointer/touch parallax for the background blobs */
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const blobs = document.querySelectorAll('.background .blob');
  if (!blobs || blobs.length === 0) return;

  let targetX = 0, targetY = 0; // normalized [-0.5,0.5]
  let currentX = 0, currentY = 0;
  const ease = 0.08;
  const strengths = [40, -30, 28, -22]; // pixel multipliers per blob

  function setTarget(clientX, clientY){
    targetX = (clientX / window.innerWidth) - 0.5;
    targetY = (clientY / window.innerHeight) - 0.5;
  }

  window.addEventListener('mousemove', e => setTarget(e.clientX, e.clientY), {passive:true});
  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) setTarget(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive:true});

  function raf(){
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    blobs.forEach((b, i) => {
      const s = strengths[i % strengths.length];
      const x = Math.round(currentX * s);
      const y = Math.round(currentY * s);
      b.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
    });

    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
})();

/* Lightweight canvas particles for extra depth (respects reduced-motion) */
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const bg = document.querySelector('.background');
  if (!bg) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'bg-canvas';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  bg.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let particles = [];
  let width = 0, height = 0;
  let running = true;

  function resize(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    width = Math.max(300, Math.floor(bg.clientWidth));
    height = Math.max(200, Math.floor(bg.clientHeight));
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    // particle count proportional to area, capped
    const area = width * height;
    const count = Math.min(120, Math.max(20, Math.floor(area / 35000)));
    if (particles.length > count) particles.length = count;
    while (particles.length < count) particles.push(createParticle());
  }

  function rand(min, max){ return Math.random() * (max - min) + min }

  const colors = ['rgba(255,110,110,0.12)','rgba(107,139,255,0.12)','rgba(107,255,179,0.10)','rgba(255,232,107,0.09)'];

  function createParticle(){
    return {
      x: rand(0, width),
      y: rand(0, height),
      r: rand(0.6, 3.2),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.05, 0.05),
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: rand(0.2, 1.2),
    };
  }

  function step(){
    if (!running) return;
    // clear with slight transparency for trails
    ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation = 'lighter';

    for (let p of particles){
      p.x += p.vx * p.drift;
      p.y += p.vy * p.drift + Math.sin((Date.now() + p.x) * 0.0005) * 0.12;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
      grd.addColorStop(0, p.color);
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  // Pause when tab not visible to save CPU
  document.addEventListener('visibilitychange', () => { running = document.visibilityState === 'visible'; if (running) requestAnimationFrame(step); });

  window.addEventListener('resize', resize, {passive:true});
  resize();
  requestAnimationFrame(step);
})();