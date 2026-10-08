# Codex 이미지 프롬프트 모음

주제가 정해지면 **1단계에서 빈칸만 채우고**, 나머지는 복사해서 Codex에 붙여넣으면 돼요.
뽑은 이미지는 `assets/images/` 에 **아래에 적힌 파일 이름 그대로** 저장 → `js/config.js` 의 `image` 칸에 경로를 넣으면 페이지에 바로 반영돼요.

---

## ⚡ 제일 쉬운 방법 (Codex에게 통째로 맡기기)

Codex에 아래 한 줄을 그대로 보내세요. (`[주제]`만 바꾸기)

```
prompts/CODEX_PROMPTS.md 를 읽고, 주제 "[주제]" 로 1단계 캐릭터 설명을 만든 다음
2~7단계 이미지를 전부 생성해서 assets/images/ 에 정해진 파일 이름으로 저장하고,
js/config.js 의 캐릭터 이름·소개·프로필과 각 image 경로를 채워줘.
첫 번째로 만든 ref_master.png 를 나머지 모든 이미지의 참고 이미지로 써서 같은 캐릭터로 보이게 해줘.
```

---

## 1단계 · 캐릭터 설명 만들기 (한 번만)

### 1-A. 주제만 정했을 때 → Codex에게 설명 만들어 달라고 하기

```
나는 초등학생이고 AI 캐릭터 공모전에 나갈 캐릭터를 만들고 있어.
주제: [예: 바다를 지키는 해파리 / 급식실 요정 / 우주 말고 동네 고양이 탐정]

아래 형식으로 캐릭터를 만들어줘.
1) CHARACTER: 이미지 생성용 영어 한 문단 (생김새, 몸 비율, 대표 색 3개 HEX, 눈에 띄는 특징 3개, 소품)
2) 한국어 이름 / 영어 이름
3) 한 줄 소개 (tagline)
4) 3~4문장 자기소개 (1인칭, 반말)
5) 프로필: 종류, 키, 생일, 좋아하는 것, 싫어하는 것
6) 성격 키워드 4개
7) 능력치 5개 (0~100)
8) 대표 동작 6개, 표정 4개와 각각의 대사
```

### 1-B. 아래 칸을 채워두기 (모든 프롬프트의 `[CHARACTER]` 자리에 붙여넣음)

```
[CHARACTER] =
A ___ (종류, 예: small round jellyfish guardian) named ___.
Body: ___ (예: 2.5 heads tall, chubby, short legs).
Main colors: ___ #______, ___ #______, ___ #______.
Signature features: 1) ___ 2) ___ 3) ___.
Accessory / prop: ___.
Personality shown in face: ___ (예: curious, kind, a little shy).
```

> 💡 **같은 캐릭터로 보이게 하는 법**: 2단계에서 만든 `ref_master.png`를 이후 모든 프롬프트에 **참고 이미지로 첨부**하고, 프롬프트 끝에 `Keep the exact same character design as the reference image.` 를 붙이세요.

---

## 공통 꼬리말 (모든 프롬프트 맨 끝에 붙이기)

```
Transparent background (PNG with alpha). Character centered, full body visible with small margin, no text, no watermark, no border, no extra characters. Keep the exact same character design as the reference image.
```

---

## 2단계 · 기준 이미지 (제일 먼저!)

| 파일 | 쓰이는 곳 |
|---|---|
| `ref_master.png` | 모든 이미지의 기준 (페이지엔 안 나와도 됨) |
| `hero.png` | 첫 화면 (`character.heroImage`) |

**ref_master.png**
```
Character design reference sheet of [CHARACTER].
Front view, standing in a neutral relaxed pose, arms slightly away from the body so the silhouette is clear.
Clean modern 3D animated-film style, soft studio lighting, crisp shapes, appealing proportions.
Plain light grey background.
```

**hero.png**
```
[CHARACTER], hero shot, front 3/4 view, confident friendly pose, waving one hand,
cinematic soft lighting, high detail 3D animated-film render, slight low camera angle to make it feel iconic.
+ 공통 꼬리말
```

---

## 3단계 · 360° 회전 (턴어라운드) — 8장

`turnaroundImages` 에 순서대로 넣으면 스크롤하면 이 8장이 넘어가면서 돌아가요.
**8장 모두 같은 크기, 같은 발 위치, 같은 카메라 높이**여야 자연스러워요.

먼저 한 장짜리 시트로 확인해도 좋아요:
```
Turnaround model sheet of [CHARACTER]: 8 views in one row, evenly spaced, same scale, same ground line —
front, front-right 3/4, right side, back-right 3/4, back, back-left 3/4, left side, front-left 3/4.
Neutral T-less standing pose (arms relaxed), orthographic camera, flat even lighting, plain white background.
```

그다음 한 장씩:

| 파일 | 각도 | 프롬프트에 넣을 말 |
|---|---|---|
| `turn_000.png` | 0° | `front view, facing the camera` |
| `turn_045.png` | 45° | `front 3/4 view, body turned 45 degrees to the character's left (we see its right side slightly)` |
| `turn_090.png` | 90° | `exact side profile view, facing left of the image` |
| `turn_135.png` | 135° | `back 3/4 view, we see mostly the back and a little of the right side` |
| `turn_180.png` | 180° | `back view, facing away from the camera` |
| `turn_225.png` | 225° | `back 3/4 view from the other side, mostly back and a little of the left side` |
| `turn_270.png` | 270° | `exact side profile view, facing right of the image` |
| `turn_315.png` | 315° | `front 3/4 view, body turned 45 degrees to the character's right` |

```
[CHARACTER], [각도 문장].
Same neutral standing pose as the reference, arms relaxed. Orthographic camera at chest height,
identical scale and feet position as the other turnaround frames. Soft even studio lighting, 3D animated-film style.
+ 공통 꼬리말
```

---

## 4단계 · 표정 — `expressions[].image`

| 파일 | 표정 |
|---|---|
| `face_happy.png` | `big happy smile, eyes curved like crescents` |
| `face_angry.png` | `angry face, eyebrows sharply down, puffed cheeks, fists clenched` |
| `face_surprised.png` | `shocked face, wide round eyes, open O-shaped mouth, hands up` |
| `face_sad.png` | `sad face, droopy eyes with a small tear, shoulders slumped` |
| (추가) `face_sleepy.png` | `sleepy face, half-closed eyes, yawning` |
| (추가) `face_love.png` | `heart-shaped eyes, blushing cheeks, hands together` |

```
Close-up bust shot (head and shoulders) of [CHARACTER] with [표정].
Same camera angle for every expression, front view, soft studio lighting, 3D animated-film style.
+ 공통 꼬리말
```

---

## 5단계 · 동작 / 포즈 — `motions[].image`

| 파일 | 동작 |
|---|---|
| `pose_wave.png` | `waving hello with one hand raised high` |
| `pose_thumbsup.png` | `giving a big thumbs up, winking` |
| `pose_jump.png` | `jumping high in the air, both arms up, joyful` |
| `pose_dance.png` | `dancing, one leg lifted, arms in a fun dance move` |
| `pose_run.png` | `running fast, dynamic side 3/4 view, motion energy` |
| `pose_punch.png` | `heroic punch toward the camera, determined face` |

```
[CHARACTER] [동작]. Full body, dynamic and readable silhouette, 3D animated-film style, soft rim light.
+ 공통 꼬리말
```

---

## 6단계 · 스타일 바리에이션 — `styles[].image` ⭐

같은 포즈(정면 3/4, 서 있는 자세)로 맞추면 갤러리에서 훨씬 멋있어요.
모든 스타일 프롬프트 앞에 이걸 붙이세요:

```
[CHARACTER], standing front 3/4 view, same pose as the reference, rendered in this style:
```

### 기본 9종 (페이지에 이미 자리 있음)

| 파일 (`id`) | 스타일 | 스타일 문장 |
|---|---|---|
| `style_original.png` (`original`) | 3D 원본 | `high quality 3D animated-film render, soft global illumination, subtle subsurface, polished materials` |
| `style_cel.png` (`cel`) | 2D 셀 애니 | `2D anime cel shading, flat colors with 2 hard shadow tones, clean bold black outlines, TV animation look` |
| `style_pixel.png` (`pixel`) | 픽셀 도트 | `retro 16-bit pixel art sprite, 64x64 pixels upscaled with hard edges, limited 16-color palette, no anti-aliasing` |
| `style_line.png` (`line`) | 라인 아트 | `black ink line art only on white, no color, clean confident contour lines with varied thickness, like a coloring book page` |
| `style_wire.png` (`wire`) | 와이어프레임 메시 | `3D wireframe mesh, glowing orange polygon edges on dark background, visible triangle topology, technical CG look` |
| `style_clay.png` (`clay`) | 클레이 | `handmade clay / plasticine sculpture, matte, visible fingerprints and tool marks, stop-motion look, soft daylight` |
| `style_normal.png` (`normal`) | 노멀 맵 | `3D normal-map render pass, surface colored by normal direction in pastel blue-pink-green rainbow, flat technical look` |
| `style_chrome.png` (`chrome`) | 크롬 피규어 | `collectible chrome metal figure, mirror-polished gold and silver, studio reflections, product photo` |
| `style_silhouette.png` (`silhouette`) | 실루엣 | `solid single-color orange silhouette, no inner details, flat shape only` |

### 추가로 더 넣고 싶을 때 (골라서 `config.js` 의 `styles` 에 한 줄씩 추가)

| 파일 | 스타일 | 스타일 문장 |
|---|---|---|
| `style_lowpoly.png` | 로우폴리 | `low-poly 3D model, large flat triangular facets, faceted shading, minimal geometry` |
| `style_voxel.png` | 복셀 | `voxel art, built from small 3D cubes, isometric lighting, like a block-building game` |
| `style_chibi.png` | 치비 / SD | `super-deformed chibi version, 2 heads tall, huge head, tiny body, extra cute` |
| `style_sketch.png` | 연필 스케치 | `rough graphite pencil concept sketch on paper, construction lines visible, designer's notebook` |
| `style_watercolor.png` | 수채화 | `soft watercolor illustration, paper texture, bleeding edges, gentle pastel washes` |
| `style_blueprint.png` | 설계도 | `technical blueprint drawing, white lines on blue grid paper, measurement annotations, front view` |
| `style_plush.png` | 봉제 인형 | `soft plush toy, fuzzy fabric, visible stitching, button details, cozy product photo` |
| `style_sticker.png` | 스티커 | `die-cut vinyl sticker, thick white border, glossy, flat vector colors` |
| `style_papercraft.png` | 페이퍼 크래프트 | `papercraft model made of folded colored paper, visible folds and edges` |
| `style_neon.png` | 네온 사인 | `glowing neon tube sign outline on a dark brick wall` |
| `style_stainedglass.png` | 스테인드글라스 | `stained glass window, bold lead lines, translucent jewel colors` |
| `style_ukiyoe.png` | 판화 | `Japanese woodblock print style, flat colors, textured paper, bold outlines` |

`config.js` 에 추가하는 예:
```js
{ id: 'voxel', en: 'VOXEL', ko: '복셀', tag: '3D · BLOCK', desc: '작은 정육면체 블록으로 쌓아 만든 버전.', image: 'assets/images/style_voxel.png' },
```
> 이미지(`image`)가 있는 스타일은 3D 대신 그 이미지가 나와요. 3D 모델에 없는 스타일은 반드시 이미지를 넣어주세요.

---

## 7단계 · 있으면 좋은 추가 이미지

| 파일 | 프롬프트 |
|---|---|
| `prop.png` | `Single prop item of [CHARACTER]: [소품], isolated, 3D render` + 공통 꼬리말 |
| `world.png` | `Wide background illustration of the world where [CHARACTER] lives, no characters, soft colors, 16:9` |
| `with_creator.png` | `[CHARACTER] holding a sign that says "MADE BY 박영진", cheerful` (글자는 잘 깨지니 여러 번 뽑기) |

---

## ✅ 체크리스트

- [ ] `ref_master.png` 를 먼저 만들고 나머지에 참고 이미지로 첨부했다
- [ ] 배경이 투명(PNG)이다
- [ ] 턴어라운드 8장은 크기·발 위치가 같다
- [ ] 스타일 이미지는 모두 같은 포즈다
- [ ] 파일 이름이 위 표와 같다
- [ ] `js/config.js` 에 경로를 넣었다
