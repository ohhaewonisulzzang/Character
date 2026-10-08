# 캐릭터 소개 페이지 (AI 캐릭터 공모전)

스크롤하면 캐릭터가 움직이고, 돌고, 표정이 바뀌고, 9가지 스타일로 변신하는 소개 페이지예요.
만든 사람: **박영진 · 고덕초등학교 6학년**

## 폴더 구조

```
index.html              페이지 뼈대
css/style.css           디자인
js/config.js            ← 글자·이미지는 여기만 고치면 됨
js/main.js              스크롤 연출
js/stage.js             3D 캐릭터 무대 (회전, 동작, 표정, 스타일)
assets/model/           임시 3D 캐릭터 (CC0 무료 에셋)
assets/images/          Codex로 뽑은 이미지 넣는 곳
prompts/CODEX_PROMPTS.md  Codex 이미지 프롬프트 모음
```

## 내 컴퓨터에서 보기

파일을 더블클릭하면 3D 모델이 안 불러와져요. 간단한 서버로 열어야 해요.

```bash
python -m http.server 5173
# 브라우저에서 http://localhost:5173
```
(VS Code라면 "Live Server" 확장으로 열어도 돼요)

## 내 캐릭터로 바꾸기

1. 주제를 정하고 `prompts/CODEX_PROMPTS.md` 대로 이미지를 뽑아요.
2. 이미지를 `assets/images/` 에 넣어요.
3. `js/config.js` 에서 이름·소개·프로필을 바꾸고, 각 `image` 칸에 경로를 넣어요.
   - `image` 가 있으면 그 장면은 3D 대신 이미지로 나와요.
   - `turnaroundImages` 에 8장을 넣으면 360° 회전이 이미지로 바뀌어요.

## 배포 (무료)

빌드 과정 없는 정적 사이트라서 폴더째 올리면 끝이에요.

- **Netlify Drop**: https://app.netlify.com/drop 에 폴더를 끌어다 놓기
- **Vercel**: GitHub에 올린 뒤 Vercel에서 Import → 설정 그대로 Deploy
- **GitHub Pages**: 저장소 Settings → Pages → Branch `main` / root

## 사용한 것

- [three.js](https://threejs.org) — 3D
- [GSAP + ScrollTrigger](https://gsap.com) — 스크롤 애니메이션
- [Lenis](https://lenis.darkroom.engineering) — 부드러운 스크롤
- 임시 3D 캐릭터: “RobotExpressive” by Tomás Laulhé (Quaternius), modified by Don McCurdy — **CC0 1.0** (자유 사용)
