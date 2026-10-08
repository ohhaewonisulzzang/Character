// ============================================================
//  여기만 고치면 페이지 내용이 전부 바뀝니다.
//  지금 들어있는 "볼트(BOLT)"는 임시 캐릭터예요. (무료 CC0 3D 에셋)
//
//  나중에 Codex로 뽑은 이미지를 쓰려면 각 항목의 image 칸에
//  'assets/images/파일이름.png' 를 넣으면, 그 장면은 3D 대신 이미지로 보여요.
//  (파일 이름은 prompts/CODEX_PROMPTS.md 에 정해둔 이름과 같아요)
// ============================================================

export const CONFIG = {
  character: {
    name: 'BOLT',
    nameKo: '볼트',
    tagline: '고장 난 걸 보면 못 지나치는, 작은 주황색 수리 로봇',
    intro:
      '나는 볼트. 고장 난 장난감을 고쳐주는 걸 세상에서 제일 좋아해. 겁은 조금 많지만, 친구가 위험하면 누구보다 먼저 달려가는 로봇이야.',
    // 메인(히어로) 이미지 – 비워두면 3D 모델
    heroImage: null,
  },

  // 360° 회전 – 8장(정면 → 오른쪽 45° → … → 왼쪽 45°)을 넣으면 이미지 회전으로 바뀜
  turnaroundImages: [
    // 'assets/images/turn_000.png', 'assets/images/turn_045.png', 'assets/images/turn_090.png', 'assets/images/turn_135.png',
    // 'assets/images/turn_180.png', 'assets/images/turn_225.png', 'assets/images/turn_270.png', 'assets/images/turn_315.png',
  ],

  profile: [
    ['이름', 'BOLT · 볼트'],
    ['종류', '소형 도우미 로봇'],
    ['키', '98cm'],
    ['생일', '2026. 03. 02'],
    ['좋아하는 것', '반짝이는 나사, 햇빛 충전, 춤추기'],
    ['싫어하는 것', '물웅덩이, 강한 자석'],
  ],
  traits: ['호기심 많음', '다정함', '살짝 겁쟁이', '포기 안 함'],
  stats: [
    ['힘', 62],
    ['스피드', 78],
    ['귀여움', 96],
    ['똑똑함', 84],
    ['용기', 70],
  ],

  // anim = 3D 모델 애니메이션 이름 (Wave, ThumbsUp, Jump, Dance, Running, Punch, Yes, No, Walking, Sitting, Idle)
  motions: [
    { anim: 'Wave', en: 'WAVE', ko: '안녕! 인사하기', desc: '처음 만난 친구에게는 손을 크게 흔들어요.', image: null },
    { anim: 'ThumbsUp', en: 'THUMBS UP', ko: '최고야!', desc: '수리가 끝나면 항상 엄지 척.', image: null },
    { anim: 'Jump', en: 'JUMP', ko: '점프', desc: '스프링 다리로 자기 키만큼 뛰어올라요.', image: null },
    { anim: 'Dance', en: 'DANCE', ko: '신나는 댄스', desc: '기분이 좋으면 참지 못하고 춤을 춰요.', image: null },
    { anim: 'Running', en: 'RUN', ko: '전력 질주', desc: '친구가 부르면 어디든 달려가요.', image: null },
    { anim: 'Punch', en: 'PUNCH', ko: '정의의 펀치', desc: '친구를 괴롭히는 건 못 참아!', image: null },
  ],

  // morph = 얼굴 표정 (Angry, Surprised, Sad) / null 이면 기본 얼굴
  expressions: [
    { morph: null, anim: 'Wave', en: 'HAPPY', ko: '기본', line: '오늘도 고칠 거 없어?', image: null },
    { morph: 'Angry', anim: 'No', en: 'ANGRY', ko: '화남', line: '내 공구 상자 누가 열었어!', image: null },
    { morph: 'Surprised', anim: 'Idle', en: 'SURPRISED', ko: '놀람', line: '헉, 이게 움직인다고?!', image: null },
    { morph: 'Sad', anim: 'Idle', en: 'SAD', ko: '슬픔', line: '배터리가… 5% 남았어…', image: null },
  ],

  // 스타일 바리에이션 – image 를 넣으면 3D 대신 그 이미지가 나와요
  styles: [
    { id: 'original', en: '3D ORIGINAL', ko: '3D 원본', tag: '3D · PBR', desc: '빛과 재질이 그대로 살아있는 기본 3D 모델.', image: null },
    { id: 'cel', en: '2D CEL', ko: '2D 셀 애니메이션', tag: '2D · TOON', desc: '명암을 2~3단계로 딱 끊고 외곽선을 넣은, 만화·애니메이션 스타일.', image: null },
    { id: 'pixel', en: 'PIXEL DOT', ko: '픽셀 도트', tag: '2D · RETRO', desc: '작은 네모 점으로만 그린 옛날 게임기 스타일.', image: null },
    { id: 'line', en: 'LINE ART', ko: '라인 아트', tag: '2D · STICKER', desc: '색을 빼고 선만 남긴 스케치·스티커 스타일.', image: null },
    { id: 'wire', en: 'WIREFRAME MESH', ko: '와이어프레임 메시', tag: '3D · MESH', desc: '3D 모델을 이루는 삼각형(폴리곤) 뼈대를 그대로 보여줘요.', image: null },
    { id: 'clay', en: 'CLAY', ko: '클레이 점토', tag: '3D · SCULPT', desc: '찰흙으로 빚은 것처럼 색 없이 형태만 보여주는 렌더.', image: null },
    { id: 'normal', en: 'NORMAL MAP', ko: '노멀 맵', tag: '3D · TECH', desc: '표면이 바라보는 방향을 무지개색으로 표시한 기술용 화면.', image: null },
    { id: 'chrome', en: 'CHROME FIGURE', ko: '크롬 피규어', tag: '3D · METAL', desc: '반짝이는 금속으로 만든 한정판 피규어 버전.', image: null },
    { id: 'silhouette', en: 'SILHOUETTE', ko: '실루엣', tag: 'SHAPE · TEST', desc: '그림자만 봐도 누군지 알 수 있어야 좋은 캐릭터!', image: null },
  ],

  creator: {
    name: '박영진',
    nameEn: 'PARK YOUNG-JIN',
    school: '고덕초등학교',
    schoolEn: 'GODEOK ELEMENTARY SCHOOL',
    grade: '6학년',
    year: 2026,
  },

  credits: '임시 3D 에셋: “RobotExpressive” by Tomás Laulhé (Quaternius), modified by Don McCurdy · CC0 1.0',
};
