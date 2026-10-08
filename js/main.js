import { CONFIG } from './config.js';
import { Stage } from './stage.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';
scrollTo(0, 0);

const $ = (s) => document.querySelector(s);
const C = CONFIG;
const cr = C.creator;
const isMobile = () => matchMedia('(max-width: 760px)').matches;
const pad2 = (n) => String(n).padStart(2, '0');

/* ---------------- 텍스트 채우기 ---------------- */
const binds = {
  name: C.character.name, nameKo: C.character.nameKo, tagline: C.character.tagline,
  creatorEn: cr.nameEn, school: cr.school, grade: cr.grade, year: cr.year,
};
document.querySelectorAll('[data-bind]').forEach((el) => (el.textContent = binds[el.dataset.bind]));
document.title = `${C.character.name} — Character Model Sheet`;

$('#heroWord').innerHTML = [...C.character.name].map((c) => `<span class="ch">${c}</span>`).join('');
$('.hero-word').setAttribute('aria-label', C.character.name);
$('#introText').innerHTML = C.character.intro.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
$('#profileList').innerHTML = C.profile.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
$('#traitList').innerHTML = C.traits.map((t) => `<span>${t}</span>`).join('');
$('#statList').innerHTML = C.stats
  .map(([k, v]) => `<div class="stat"><span>${k}</span><div class="bar"><i style="--v:${v / 100}"></i></div><b>${v}</b></div>`)
  .join('');
$('#moveList').innerHTML = C.motions.map((m) => `<li>${m.en}</li>`).join('');
$('#faceTabs').innerHTML = C.expressions.map((e) => `<div>${e.en}<b>${e.ko}</b></div>`).join('');
$('#lookTotal').textContent = pad2(C.styles.length);
$('#lineupCount').textContent = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE'][C.styles.length] ?? C.styles.length;
$('#creditName').innerHTML = [...cr.name].map((c) => `<span class="syl"><i>${c}</i></span>`).join('');
$('#stampText').textContent = `${cr.schoolEn} · GRADE 6 · ${cr.year} · `;
$('#stampYear').textContent = cr.year;
$('#creditsText').textContent = `© ${cr.year} ${cr.name} (${cr.school} ${cr.grade}) · ${C.credits}`;
const mq = `THANK YOU · ${C.character.name} · ${cr.nameEn} · `;
$('#marquee').innerHTML = `<span>${mq.repeat(3)}</span><span>${mq.repeat(3)}</span>`;

// 회전 다이얼 눈금
$('#dialTicks').innerHTML = Array.from({ length: 72 }, (_, i) => {
  const a = i * 5, major = a % 45 === 0, r1 = major ? 84 : 86;
  const rad = ((a - 90) * Math.PI) / 180;
  const line = `<line class="${major ? 'major' : ''}" x1="${Math.cos(rad) * r1}" y1="${Math.sin(rad) * r1}" x2="${Math.cos(rad) * 90}" y2="${Math.sin(rad) * 90}"/>`;
  return line + (a % 90 === 0 ? `<text x="${Math.cos(rad) * 95}" y="${Math.sin(rad) * 95 + 1.5}">${a}°</text>` : '');
}).join('');

/* ---------------- 스무스 스크롤 ---------------- */
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
document.body.classList.add('is-loading');

/* ---------------- 무대 ---------------- */
const stageEl = $('#stage');
const stageImg = $('#stageImg');
const stage = new Stage($('#gl'));

function setStageImage(src) {
  stageEl.classList.toggle('has-img', !!src);
  if (src && stageImg.getAttribute('src') !== src) stageImg.src = src;
}

// 섹션마다 캐릭터가 서 있을 자리 (x,y = 화면 % / zoom,focus = 카메라)
const POSES = {
  hero: { x: 0, y: 0, s: 1, o: 1, yaw: 0, zoom: 1, focus: 0, dial: 0, anim: 'Idle' },
  right: { x: 24, y: 0, s: 0.95, o: 1, yaw: -0.55, zoom: 1, focus: 0, dial: 0, anim: 'Idle' },
  center: { x: 0, y: 0, s: 1, o: 1, yaw: 0, zoom: 1, focus: 0, dial: 1, anim: 'Idle' },
  left: { x: -24, y: 0, s: 0.95, o: 1, yaw: 0.55, zoom: 1, focus: 0, dial: 0, anim: 'Idle' },
  moves: { x: 4, y: 0, s: 1, o: 1, yaw: -0.25, zoom: 1, focus: 0, dial: 0 },
  faces: { x: 0, y: 0, s: 1, o: 1, yaw: 0, zoom: 1, focus: 1, dial: 0 },
  looks: { x: 4, y: 0, s: 1, o: 1, yaw: 0, zoom: 1, focus: 0, dial: 0, anim: 'Walking' },
  hidden: { x: 0, y: 6, s: 0.9, o: 0, yaw: 0, zoom: 1, focus: 0, dial: 0 },
  credit: { x: -36, y: 22, s: 0.5, o: 1, yaw: 0.4, zoom: 1, focus: 0, dial: 0, anim: 'Dance' },
};
const MOBILE = {
  center: { x: 0, y: 10, s: 0.78 }, right: { x: 0, y: -12, s: 0.8 }, left: { x: 0, y: -16, s: 0.75 }, moves: { x: 0, y: -14, s: 0.85 },
  looks: { x: 0, y: -6, s: 0.85 }, credit: { x: 0, y: 30, s: 0.45 },
};

let poseName = null;
function applyPose(sec) {
  const name = sec.dataset.pose;
  poseName = name;
  const p = { ...POSES[name], ...(isMobile() ? MOBILE[name] : {}) };
  gsap.to(stageEl, { xPercent: p.x, yPercent: p.y, scale: p.s, autoAlpha: p.o, duration: 1.2, ease: 'expo.out', overwrite: 'auto' });
  gsap.to(stage.view, { yaw: p.yaw, zoom: p.zoom, focus: p.focus, parallax: name === 'center' ? 0 : 1, duration: 1.4, ease: 'expo.out', overwrite: 'auto' });
  gsap.to('.dial', { autoAlpha: p.dial, scale: p.dial ? 1 : 0.85, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
  gsap.to('.stage-shadow', { autoAlpha: p.focus || name === 'looks' ? 0 : 1, duration: 0.5 });

  if (name !== 'looks') {
    stage.setStyle('original');
    stage.view.spin = 0;
    gsap.to(stage, { autoRot: Math.round(stage.autoRot / (Math.PI * 2)) * Math.PI * 2, duration: 1, ease: 'power2.out' });
  }
  if (name !== 'faces') stage.setExpression(null);
  if (p.anim) stage.play(p.anim);
  setStageImage(name === 'hero' ? C.character.heroImage : null);
  sec.onPose?.();

  document.querySelectorAll('#chapters a').forEach((a) => a.classList.toggle('on', a.hash === `#${sec.id}`));
}

/* ---------------- 섹션 연출 ---------------- */
const BG = { paper: '#efe9de', ink: '#16130f', cobalt: '#2b3be8' };

// 스크롤 구간을 n칸으로 나눠서, 칸이 바뀔 때마다 onStep(i) 호출
function stepper(sec, n, perStep, onStep) {
  let cur = -1;
  const go = (i) => { if (i !== cur) { cur = i; onStep(i); } };
  sec.onPose = () => { const i = Math.max(cur, 0); cur = -1; go(i); };
  ScrollTrigger.create({
    trigger: sec, pin: true, start: 'top top', end: `+=${n * perStep}%`,
    onUpdate: (self) => go(Math.min(n - 1, Math.floor(self.progress * n))),
  });
}

function swapIn(els) {
  gsap.fromTo(els, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, overwrite: true });
}

// 02 회전
const turnFrames = C.turnaroundImages.filter(Boolean);
turnFrames.forEach((src) => (new Image().src = src));
const viewItems = [...document.querySelectorAll('#viewList li')];
const turnProxy = { a: 0 };
gsap.to(turnProxy, {
  a: 360, ease: 'none',
  scrollTrigger: { trigger: '#turn', pin: true, start: 'top top', end: '+=260%', scrub: 0.6 },
  onUpdate() {
    const a = turnProxy.a;
    stage.view.rotY = (a * Math.PI) / 180;
    $('#angleNum').textContent = String(Math.round(a) % 360).padStart(3, '0');
    gsap.set('#rulerFill', { scaleX: a / 360 });
    gsap.set('#dialTicks', { rotation: -a, svgOrigin: '0 0' });
    const near = Math.round(a / 45) * 45 % 360;
    viewItems.forEach((li) => li.classList.toggle('on', +li.dataset.a === near));
    if (turnFrames.length && poseName === 'center') setStageImage(turnFrames[Math.round((a / 360) * turnFrames.length) % turnFrames.length]);
  },
});

// 04 모션
const moveLis = [...document.querySelectorAll('#moveList li')];
stepper($('#moves'), C.motions.length, 55, (i) => {
  const m = C.motions[i];
  $('#moveNum').textContent = pad2(i + 1);
  $('#moveEn').textContent = m.en;
  $('#moveKo').textContent = m.ko;
  $('#moveDesc').textContent = m.desc;
  swapIn(['#moveNum', '#moveEn', '#moveKo', '#moveDesc']);
  moveLis.forEach((li, k) => li.classList.toggle('on', k === i));
  if (poseName === 'moves') { stage.play(m.anim); setStageImage(m.image); }
});

// 05 표정
const faceTabs = [...document.querySelectorAll('#faceTabs div')];
stepper($('#faces'), C.expressions.length, 55, (i) => {
  const e = C.expressions[i];
  $('#faceWord').textContent = e.en;
  $('#faceBubble').textContent = e.line;
  gsap.fromTo('#faceWord', { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 0.35, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: true });
  gsap.fromTo('#faceBubble', { autoAlpha: 0, y: 14, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)', overwrite: true });
  faceTabs.forEach((t, k) => t.classList.toggle('on', k === i));
  if (poseName === 'faces') { stage.setExpression(e.morph); stage.play(e.anim); setStageImage(e.image); }
});

// 06 스타일 바리에이션
const railEls = [];
$('#rail').innerHTML = C.styles.map(() => '<div></div>').join('');
railEls.push(...document.querySelectorAll('#rail div'));
stepper($('#looks'), C.styles.length, 45, (i) => {
  const s = C.styles[i];
  $('#lookIdx').textContent = pad2(i + 1);
  $('#lookTag').textContent = s.tag;
  $('#lookName').textContent = s.en;
  $('#lookKo').textContent = s.ko;
  $('#lookDesc').textContent = s.desc;
  swapIn(['#lookTag', '#lookName', '#lookKo', '#lookDesc']);
  railEls.forEach((el, k) => el.classList.toggle('on', k === i));
  if (poseName === 'looks') {
    stage.setStyle(s.id);
    stage.view.spin = 0.35;
    setStageImage(s.image);
    gsap.fromTo(stageEl, { filter: 'brightness(2.2)' }, { filter: 'brightness(1)', duration: 0.5, ease: 'power2.out', clearProps: 'filter' });
  }
});

// 08 크레딧 (이름이 한 글자씩 올라오고 주황색으로 채워짐)
ScrollTrigger.create({ trigger: '#credit', pin: true, start: 'top top', end: '+=150%' });
const creditTl = gsap.timeline({
  scrollTrigger: { trigger: $('#credit').parentElement, start: 'top 70%', end: 'bottom bottom', scrub: 0.8 },
});
creditTl
  .from('.credit-pre span', { yPercent: 110, duration: 0.4 })
  .from('.credit-name .syl i', { yPercent: 110, rotate: 6, stagger: 0.15, duration: 0.6, ease: 'power3.out' }, '<0.1')
  .from('.credit-en', { autoAlpha: 0, letterSpacing: '1.2em', duration: 0.5 }, '<0.3')
  .to('.credit-name .syl i', { backgroundPosition: '0 100%', stagger: 0.15, duration: 0.5 }, '+=0.1')
  .from('.cs-line', { scaleX: 0, duration: 0.4 }, '<0.2')
  .from('.credit-school p', { autoAlpha: 0, y: 30, duration: 0.4 }, '<')
  .from('.stamp', { autoAlpha: 0, scale: 0.6, rotate: -90, duration: 0.5 }, '<0.2')
  .to({}, { duration: 0.4 });
gsap.to('.stamp text', { rotate: 360, transformOrigin: '100px 100px', svgOrigin: '100 100', duration: 24, repeat: -1, ease: 'none' });
gsap.to('#marquee', { xPercent: -50, duration: 40, repeat: -1, ease: 'none' });

// 01 소개 문장: 스크롤에 맞춰 단어가 진해짐
gsap.to('#introText .w', {
  opacity: 1, stagger: 0.1, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top 65%', end: 'center 40%', scrub: true },
});
gsap.from('#about .big-ko', { yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#about', start: 'top 70%', toggleActions: 'play none none reverse' } });

// 03 프로필 카드
gsap.from('.card', { y: 80, rotate: 2, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#profile', start: 'top 65%', toggleActions: 'play none none reverse' } });
gsap.to('.stat .bar i', {
  scaleX: (i, el) => +getComputedStyle(el).getPropertyValue('--v'), stagger: 0.08, duration: 1.1, ease: 'expo.out',
  scrollTrigger: { trigger: '.stats', start: 'top 85%', toggleActions: 'play none none reverse' },
});

// 히어로 글자는 스크롤하면 위로 흩어짐
gsap.to('#heroWord .ch', {
  yPercent: (i) => -30 - i * 18, ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
});

// 전체 진행 바
gsap.to('#progressBar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

// 섹션별 배경색 + 캐릭터 위치 (핀 트리거 다음에 만들어야 위치 계산이 맞음)
const sections = [...document.querySelectorAll('.sec')];
$('#chapters').innerHTML = sections.map((s) => `<a href="#${s.id}">${s.dataset.chapter}</a>`).join('');
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(a.hash, { duration: 1.6 }); })
);
sections.forEach((sec) => {
  // 고정(pin)된 섹션은 pin-spacer 전체 길이를 기준으로 잡아야 중간에 끊기지 않음
  const spacer = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
  ScrollTrigger.create({
    trigger: spacer, start: sec.dataset.start || 'top 55%', end: 'bottom 45%',
    onToggle: (self) => {
      if (!self.isActive) return;
      applyPose(sec);
      gsap.to('body', { backgroundColor: BG[sec.dataset.bg], duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
    },
  });
});

/* ---------------- 로딩 → 인트로 ---------------- */
const pct = { v: 0 };
const showPct = () => {
  $('#loadPct').textContent = Math.round(pct.v);
  $('#loadBar').style.width = pct.v + '%';
};

function buildGallery() {
  stage.play('Idle', 0);
  stage.mixer.update(0.6);
  const shots = C.styles.map((s) => (s.image ? { url: s.image, pixel: false } : stage.snapshot(s.id)));
  const imgTag = (sh) => `<img src="${sh.url}" class="${sh.pixel ? 'px' : ''}" alt="" loading="lazy" />`;
  railEls.forEach((el, i) => (el.innerHTML = imgTag(shots[i])));
  const dark = new Set(['line', 'wire', 'normal', 'chrome', 'silhouette']);
  $('#grid').innerHTML = C.styles
    .map((s, i) => `
      <div class="tile ${dark.has(s.id) ? 'dark' : ''}">
        <span class="no mono">${pad2(i + 1)}</span>
        <figure>${imgTag(shots[i])}</figure>
        <figcaption><b>${s.en}</b><span class="mono">${s.ko}</span></figcaption>
      </div>`)
    .join('');
  gsap.from('.tile', {
    y: 60, autoAlpha: 0, stagger: { each: 0.06, grid: 'auto', from: 'start' }, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: '#grid', start: 'top 80%', toggleActions: 'play none none reverse' },
  });
}

function intro() {
  const tl = gsap.timeline({
    onComplete: () => {
      lenis.start();
      document.body.classList.remove('is-loading');
      ScrollTrigger.refresh();
    },
  });
  tl.to('#loader', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
    .from('#heroWord .ch', { yPercent: 110, stagger: 0.07, duration: 1.1, ease: 'expo.out' }, '-=0.45')
    .from(stageEl, { yPercent: 40, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, '<0.2')
    .from('.hero-top > *, .hero-bottom > *, .reg', { autoAlpha: 0, y: 16, stagger: 0.05, duration: 0.7, ease: 'power3.out' }, '<0.3')
    .from('.topbar', { autoAlpha: 0, duration: 0.6 }, '<');
  stage.play('Wave', 0.2);
  gsap.delayedCall(3.2, () => poseName === 'hero' && stage.play('Idle'));
}

stage
  .load('assets/model/RobotExpressive.glb', (p) => gsap.to(pct, { v: p * 90, duration: 0.3, onUpdate: showPct }))
  .then(() => {
    buildGallery();
    applyPose($('#hero'));
    gsap.to(pct, { v: 100, duration: 0.5, onUpdate: showPct, onComplete: intro });
  })
  .catch((err) => {
    console.error(err);
    $('#loadPct').textContent = 'ERR';
    document.querySelector('.loader-top span:last-child').textContent = '모델을 불러오지 못했어요 — README의 실행 방법을 확인하세요';
  });
