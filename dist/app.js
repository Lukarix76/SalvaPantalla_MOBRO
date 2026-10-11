(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const paths = ['10,2 50,2 42,10 18,10','51,3 51,43 43,36 43,12','51,47 51,87 43,78 43,55','10,88 50,88 42,80 18,80','1,47 9,55 9,78 1,87','1,3 9,12 9,36 1,43','10,41 42,41 49,45 42,49 10,49 3,45'];
  const numbers = ['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
  let twelve = false;
  let animated = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { twelve = localStorage.getItem('nexus-format') === '12'; } catch {}
  const digits = [];
  for (let n = 0; n < 6; n++) {
    if (n === 2 || n === 4) $('clock').insertAdjacentHTML('beforeend', '<svg class="colon" viewBox="0 0 12 90" aria-hidden="true"><circle cx="6" cy="29" r="4"/><circle cx="6" cy="61" r="4"/></svg>');
    $('clock').insertAdjacentHTML('beforeend', `<svg class="digit" viewBox="0 0 52 90" aria-hidden="true">${paths.map(points => `<polygon class="segment" points="${points}"/>`).join('')}</svg>`);
    digits.push($('clock').lastElementChild);
  }
  const dateFormat = new Intl.DateTimeFormat('es-AR', {weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  $('zone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_',' ').toUpperCase();
  function update() {
    const now = new Date();
    const h = now.getHours();
    const value = [twelve ? h % 12 || 12 : h, now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join('');
    digits.forEach((svg, i) => [...svg.children].forEach((segment, j) => segment.classList.toggle('on', numbers[Number(value[i])][j] === '1')));
    $('clock').setAttribute('aria-label', `${value.slice(0,2)}:${value.slice(2,4)}:${value.slice(4)}${twelve ? (h < 12 ? ' AM' : ' PM') : ''}`);
    $('date').textContent = dateFormat.format(now);
    $('period').textContent = twelve ? (h < 12 ? 'AM' : 'PM') : '';
    const percentage = (h * 3600 + now.getMinutes()*60 + now.getSeconds()) / 864;
    $('progress').style.width = `${percentage}%`;
    $('progress-label').textContent = `${percentage.toFixed(1)}%`;
    $('format').textContent = twelve ? '12 H' : '24 H';
    $('format').setAttribute('aria-label', `Cambiar a formato de ${twelve ? 24 : 12} horas`);
  }
  $('format').addEventListener('click', () => { twelve = !twelve; try { localStorage.setItem('nexus-format', twelve ? '12' : '24'); } catch {} update(); });
  function applyMotion() { document.body.classList.toggle('paused',!animated); $('motion').setAttribute('aria-pressed',String(animated)); }
  $('motion').addEventListener('click', () => { animated = !animated; applyMotion(); });
  $('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $('message').textContent = 'Usá F11 para activar la pantalla completa en este navegador.'; }
  });
  document.addEventListener('fullscreenchange', () => { $('fullscreen').querySelector('span').textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa'; });
  const canvas = $('particles');
  const ctx = canvas.getContext('2d');
  let w, h;
  const stars = Array.from({length:65}, () => ({x:Math.random(), y:Math.random(), r:Math.random()*1.3+.3, speed:Math.random()*.000035+.000008}));
  function resize() { w = innerWidth; h = innerHeight; const dpr = Math.min(devicePixelRatio || 1,2); canvas.width = w*dpr; canvas.height = h*dpr; canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; ctx.setTransform(dpr,0,0,dpr,0,0); }
  let previous = 0;
  function frame(time) {
    const delta = Math.min(time-previous,50); previous = time;
    if (animated && !document.hidden) {
      ctx.clearRect(0,0,w,h);
      for (const star of stars) { star.y -= star.speed*delta; if(star.y < 0) star.y = 1; ctx.beginPath(); ctx.arc(star.x*w,star.y*h,star.r,0,Math.PI*2); ctx.fillStyle = '#71e8ff88'; ctx.shadowColor = '#00d5ff'; ctx.shadowBlur = 8; ctx.fill(); }
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', update);
  resize(); applyMotion(); update(); setInterval(update,250); requestAnimationFrame(frame);
})();
