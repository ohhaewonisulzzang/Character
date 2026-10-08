// 스크롤 말고도 버튼 · 키보드 · 메뉴로 장면을 넘길 수 있게 해주는 부분.
// 각 섹션에 navTrigger(고정 구간)와 navSteps(단계 이름)가 있으면 단계마다 멈춘다.
const { gsap, ScrollTrigger } = window;
const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, '0');

export function initNavigation({ lenis, sections, reduced }) {
  let stops = [];
  let target = null;
  let activeSec = -1;

  /* ---------- 상단 메뉴 / 모바일 메뉴 만들기 ---------- */
  const linkHTML = (s, i) =>
    `<a href="#${s.id}" data-i="${i}"><span class="n mono">${pad2(i + 1)}</span><span class="t">${s.dataset.ko}</span></a>`;
  $('#chapters').innerHTML = sections.map(linkHTML).join('');
  $('#menuList').innerHTML = sections.map((s, i) => `<li>${linkHTML(s, i)}</li>`).join('');
  $('#pgTotal').textContent = pad2(sections.length);
  const navLinks = [...document.querySelectorAll('#chapters a')];
  const menuLinks = [...document.querySelectorAll('#menuList a')];

  /* ---------- 멈출 위치 계산 ---------- */
  function build() {
    const max = ScrollTrigger.maxScroll(window);
    stops = [];
    sections.forEach((sec, si) => {
      const st = sec.navTrigger;
      const steps = sec.navSteps || [null];
      if (!st) {
        const top = si === 0 ? 0 : sec.getBoundingClientRect().top + window.scrollY;
        stops.push({ y: Math.round(top), si, label: null, i: 0, n: 1 });
        return;
      }
      const n = steps.length;
      steps.forEach((label, i) => {
        // 단계형(동작·표정·스타일)은 칸의 시작, 연속형(회전·크레딧)은 처음~끝을 고르게
        const f = sec.navInclusive ? (n > 1 ? i / (n - 1) : 0) : i / n;
        stops.push({ y: Math.round(st.start + (st.end - st.start) * f) + 2, si, label, i, n });
      });
    });
    stops.forEach((s) => (s.y = Math.min(s.y, max)));
    update();
  }

  const scrollPos = () => lenis.animatedScroll ?? window.scrollY;
  function currentIdx() {
    const y = scrollPos();
    let idx = 0;
    stops.forEach((s, k) => { if (s.y <= y + 6) idx = k; });
    return idx;
  }

  function go(k) {
    if (!stops.length) return;
    k = Math.max(0, Math.min(stops.length - 1, k));
    target = k;
    lenis.scrollTo(stops[k].y, {
      duration: reduced ? 0 : 1.3,
      immediate: reduced,
      force: true,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => (target = null),
    });
    hideTip();
  }
  const isLast = () => currentIdx() >= stops.length - 1 && scrollPos() >= stops[stops.length - 1].y - 6;
  function next() {
    if (target === null && isLast()) return go(0); // 끝에서 누르면 처음으로
    go((target ?? currentIdx()) + 1);
  }
  function prev() {
    const base = target ?? currentIdx();
    // 단계 중간쯤에 있으면 먼저 그 단계 시작으로
    const back = target === null && scrollPos() - stops[base].y > 40 ? base : base - 1;
    go(back);
  }
  const goSection = (si) => go(stops.findIndex((s) => s.si === si));

  /* ---------- 화면 갱신 ---------- */
  const ring = $('#pgRing');
  const RING = 2 * Math.PI * 27;
  ring.style.strokeDasharray = RING;
  const prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');

  function update() {
    if (!stops.length) return;
    const idx = currentIdx();
    const s = stops[idx];
    const sec = sections[s.si];
    $('#pgNum').textContent = pad2(s.si + 1);
    $('#pgLabel').textContent = sec.dataset.ko;
    $('#pgSub').textContent = s.n > 1 ? `${s.label ?? ''} · ${s.i + 1}/${s.n}` : '';
    const max = ScrollTrigger.maxScroll(window) || 1;
    ring.style.strokeDashoffset = RING * (1 - Math.min(1, scrollPos() / max));

    prevBtn.disabled = scrollPos() < 4;
    const last = isLast();
    nextBtn.classList.toggle('is-top', last);
    nextBtn.setAttribute('aria-label', last ? '처음으로 돌아가기' : '다음 장면');

    if (s.si !== activeSec) {
      activeSec = s.si;
      navLinks.forEach((a, i) => a.classList.toggle('on', i === s.si));
      menuLinks.forEach((a, i) => a.classList.toggle('on', i === s.si));
      moveIndicator();
    }
  }

  const ind = $('#navInd');
  function moveIndicator() {
    const a = navLinks[activeSec];
    if (!a || !a.offsetWidth) return;
    gsap.to(ind, { x: a.offsetLeft, width: a.offsetWidth, autoAlpha: 1, duration: reduced ? 0 : 0.5, ease: 'expo.out' });
  }

  /* ---------- 입력 연결 ---------- */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  $('#scrollCue').addEventListener('click', next);
  $('.brand').addEventListener('click', (e) => { e.preventDefault(); go(0); });

  const menuBtn = $('#menuBtn'), overlay = $('#menuOverlay');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    overlay.setAttribute('aria-hidden', !open);
    open ? lenis.stop() : lenis.start();
    if (open) gsap.fromTo('#menuList li', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.5, ease: 'expo.out' });
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  [...navLinks, ...menuLinks].forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) setMenu(false);
      goSection(+a.dataset.i);
    })
  );

  window.addEventListener('keydown', (e) => {
    if ((e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) || document.body.classList.contains('is-loading')) return;
    if (e.key === 'Escape') return setMenu(false);
    if (document.body.classList.contains('menu-open')) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); next(); }
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(stops.length - 1); }
  });

  /* ---------- 처음 한 번 보여주는 안내 ---------- */
  const tip = $('#pgTip');
  let tipTimer;
  function hideTip() {
    clearTimeout(tipTimer);
    tip.classList.remove('show');
  }
  function showTip() {
    tip.classList.add('show');
    tipTimer = setTimeout(hideTip, 6500);
  }
  $('#tipClose').addEventListener('click', hideTip);

  lenis.on('scroll', update);
  ScrollTrigger.addEventListener('refresh', build);
  window.addEventListener('resize', () => requestAnimationFrame(moveIndicator));
  build();

  return { showTip, refresh: build };
}
