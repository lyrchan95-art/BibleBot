// Film Wisteria & Whiskers at full resolution by slowing the app clock.
// usage: node capture.js mobile|desktop
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const FORMAT = process.argv[2] || 'mobile';
const CFG = FORMAT === 'mobile'
  ? { w: 540, h: 960, dsf: 2, slow: 6 }
  : { w: 1480, h: 833, dsf: 2, slow: 6 };
const OUT = path.join(__dirname, 'frames_' + FORMAT);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const SLOW = CFG.slow;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: CFG.w, height: CFG.h }, deviceScaleFactor: CFG.dsf });
  await ctx.addInitScript(() => localStorage.setItem('wisteria-whiskers-v1',
    JSON.stringify({ seenIntro: true, unlocked: 21, sound: false, last: 'wall' })));
  await ctx.addInitScript((S) => {
    // time shim: the app sees time run S× slower
    const rNow = performance.now.bind(performance), t0 = rNow(), dNow = Date.now, d0 = dNow();
    performance.now = () => t0 + (rNow() - t0) / S;
    Date.now = () => d0 + (dNow() - d0) / S;
    const rAF = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => rAF(ts => cb(t0 + (ts - t0) / S));
    const sT = window.setTimeout.bind(window), sI = window.setInterval.bind(window);
    // slow CSS/WAAPI animations too (toasts, journal pop, progress bar)
    sI(() => { for (const an of document.getAnimations()) if (!an.__slow) { an.playbackRate = an.playbackRate / S; an.__slow = 1; } }, 8);
    window.setTimeout = (fn, ms, ...a) => sT(fn, (ms || 0) * S, ...a);
    window.setInterval = (fn, ms, ...a) => sI(fn, (ms || 0) * S, ...a);
  }, SLOW);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  const cdp = await ctx.newCDPSession(page);
  await page.goto('http://127.0.0.1:8742/index.html', { waitUntil: 'networkidle' });
  await sleep(3000 * SLOW / 2);

  // visible tap cursor
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.id = '__cur';
    el.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;' +
      'border:3px solid #fff;background:rgba(138,107,189,.35);box-shadow:0 4px 16px rgba(40,20,70,.45);' +
      'pointer-events:none;z-index:99999;opacity:0;transition:none';
    document.body.appendChild(el);
    window.__cur = (x, y, o, s) => { el.style.opacity = o; el.style.transform = `translate(${x}px,${y}px) scale(${s})`; };
  });

  // ---- recording ---------------------------------------------------------
  const manifest = [];
  let rec = null;
  async function recLoop(take) {
    const tStart = Date.now();
    let i = 0;
    while (rec && rec.take === take) {
      const appT = (Date.now() - tStart) / SLOW;
      const opts = { format: 'jpeg', quality: 90, optimizeForSpeed: true };
      if (FORMAT === 'desktop') opts.clip = { x: 0, y: 0, width: CFG.w, height: CFG.h, scale: 1920 / CFG.w };
      const shot = await cdp.send('Page.captureScreenshot', opts);
      const f = `${take}_${String(i).padStart(4, '0')}.jpg`;
      fs.writeFileSync(path.join(OUT, f), Buffer.from(shot.data, 'base64'));
      manifest.push({ take, i, t: appT, f });
      i++;
    }
  }
  async function take(name, fn) {
    rec = { take: name };
    const loop = recLoop(name);
    await fn();
    rec = null;
    await loop;
    const n = manifest.filter(m => m.take === name).length;
    console.log(name, n, 'frames');
  }

  // ---- helpers (all durations in APP milliseconds) ----------------------
  const wait = ms => sleep(ms * SLOW);
  let cx = CFG.w / 2, cy = CFG.h * 0.7;
  const cur = (o, s = 1) => page.evaluate(([x, y, o, s]) => window.__cur(x, y, o, s), [cx, cy, o, s]);
  async function glide(x, y, ms) {
    const steps = Math.max(6, Math.round(ms / 40));
    const x0 = cx, y0 = cy;
    for (let k = 1; k <= steps; k++) {
      const e = ease(k / steps);
      cx = x0 + (x - x0) * e; cy = y0 + (y - y0) * e;
      await page.evaluate(([x, y]) => window.__cur(x, y, 1, 1), [cx, cy]);
      await sleep((ms / steps) * SLOW);
    }
  }
  async function tapAt(x, y, glideMs = 420) {
    await glide(x, y, glideMs);
    await page.mouse.move(x, y);
    await cur(1, 0.72);
    await page.mouse.down(); await page.mouse.up();
    await wait(120);
    await cur(1, 1);
  }
  const catPos = id => page.evaluate(id => __ww.catScreen(id), id);
  async function tapCat(id, glideMs) { const p = await catPos(id); await tapAt(p.x, p.y, glideMs); }
  const focus = (x, y, mul, ms) => page.evaluate(([x, y, m, d]) => __ww.focus(x, y, m, d), [x, y, mul, ms]);
  const focusCat = (id, mul, ms) => page.evaluate(([i, m, d]) => __ww.focusCat(i, m, d), [id, mul, ms]);
  const setCam = (x, y, mul) => page.evaluate(([x, y, m]) => { __ww.focus(x, y, m, 1); }, [x, y, mul]);
  async function load(i) {
    await page.evaluate(i => __ww.loadScene(i), i);
    await page.waitForFunction(() => __ww.scene && __ww.scene.off, null, { timeout: 60000 });
    await wait(2000); // let the "Round n" toast clear
  }
  const toastOff = () => page.evaluate(() => { document.getElementById('toast').hidden = true; });

  // ---- shot scripts -------------------------------------------------------
  if (FORMAT === 'mobile') {
    await page.evaluate(() => { document.body.classList.add('immersive'); window.dispatchEvent(new Event('resize')); });
    await wait(2400); await toastOff();

    await setCam(470, 600, 2.2); await wait(300);
    await take('m1_hook', async () => { await focus(500, 760, 1.25, 3000); await wait(3200); });

    await setCam(380, 1330, 1.15); await wait(300);
    await take('m2_finds', async () => {
      await cur(1);
      await tapCat('tux', 500); await wait(650);
      await tapCat('marmalade', 450); await wait(600);
      await focus(640, 1150, 1.15, 700); await wait(750);
      await tapCat('clementine', 450); await wait(700);
    });

    await take('m3_hard', async () => {
      await focusCat('lilac', 2.6, 900); await wait(1000);
      await tapCat('lilac', 400); await wait(1100);
    });
    await cur(0);

    await load(1); await toastOff();
    await setCam(500, 760, 1.05); await wait(300);
    await take('m4_meadow', async () => {
      await focus(500, 660, 1.6, 1400); await wait(1500);
      await cur(1); await tapCat('snowdrop', 400); await wait(900);
    });
    await cur(0);

    // pre-paint album thumbnails once so they are cached for the take
    await page.evaluate(() => __ww.openAlbum()); await wait(3500);
    await page.evaluate(() => __ww.closeAlbum());
    await page.evaluate(() => { __ww.openAlbum(); document.getElementById('album').scrollTop = 0; });
    await wait(600);
    await take('m5_album', async () => {
      for (let k = 0; k <= 40; k++) {
        await page.evaluate(y => { document.getElementById('album').scrollTop = y; }, ease(k / 40) * 1400);
        await wait(70);
      }
      await wait(300);
    });
  } else {
    await wait(600); await toastOff();
    await setCam(500, 300, 1.0); await wait(300);
    await take('d1_world', async () => { await focus(500, 1250, 1.0, 6500); await wait(6600); });

    await take('d2_finds', async () => {
      await cur(1);
      await tapCat('tux', 600); await wait(1000);
      await tapCat('marmalade', 500); await wait(900);
      await tapCat('dumpling', 600); await wait(900);
      await tapCat('pepper', 600); await wait(1200);
    });

    await take('d3_hint', async () => {
      const hb = await page.locator('#hintBtn').boundingBox();
      await tapAt(hb.x + hb.width / 2, hb.y + hb.height / 2, 600);
      await wait(1100);
      const h = await page.evaluate(() => __ww.hint && __ww.hint.id);
      if (h) { await tapCat(h, 600); await wait(1400); }
    });
    await cur(0);

    const montage = [
      [2, 'd4_lotus', 500, 700, 1.0, 500, 1000, 1.25],
      [3, 'd5_sunflower', 500, 500, 1.15, 500, 900, 1.0],
      [8, 'd6_bookshop', 500, 600, 1.0, 500, 1000, 1.2],
      [16, 'd7_shrine', 500, 700, 1.2, 500, 1100, 1.0],
      [19, 'd8_moon', 500, 600, 1.0, 500, 1000, 1.2],
      [18, 'd9_mush', 500, 900, 1.2, 500, 1300, 1.0],
    ];
    for (const [i, name, x0, y0, m0, x1, y1, m1] of montage) {
      await load(i); await toastOff();
      await setCam(x0, y0, m0); await wait(300);
      await take(name, async () => { await focus(x1, y1, m1, 2600); await wait(2700); });
    }

    await page.evaluate(() => __ww.openAlbum()); await wait(6000);
    await page.evaluate(() => __ww.closeAlbum());
    await page.evaluate(() => { __ww.openAlbum(); document.getElementById('album').scrollTop = 0; });
    await wait(600);
    await take('d10_album', async () => {
      for (let k = 0; k <= 60; k++) {
        await page.evaluate(y => { document.getElementById('album').scrollTop = y; }, ease(k / 60) * 900);
        await wait(80);
      }
      await wait(400);
    });
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
  console.log('DONE', manifest.length);
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
