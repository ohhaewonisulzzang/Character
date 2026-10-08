// 3D 무대: 화면 뒤에 고정된 WebGL 캔버스 하나에 캐릭터를 띄우고,
// 스크롤 쪽(main.js)에서 view 값을 바꾸면 매 프레임 반영한다.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const INK = 0x16130f;
const ACCENT = 0xff5a1f;

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6f655a, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 6, 5);
    const rim = new THREE.DirectionalLight(0xffd2b0, 2.2);
    rim.position.set(-4, 3, -5);
    this.scene.add(key, rim);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    // 스크롤이 조작하는 값들
    this.view = { rotY: 0, yaw: 0, zoom: 1, focus: 0, spin: 0, parallax: 1 };
    this.autoRot = 0;
    this.mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    this.pixel = 0;
    this.clock = new THREE.Clock();
    this.running = true;

    addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      this.mouse.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) { this.clock.getDelta(); this.loop(); }
    });
  }

  async load(url, onProgress) {
    const gltf = await new GLTFLoader().loadAsync(url, (e) => e.total && onProgress?.(e.loaded / e.total));
    const model = gltf.scene;

    // 발바닥을 y=0, 가운데를 x/z=0 으로
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    this.pivot.add(model);
    this.height = size.y;
    this.width = Math.max(size.x, size.z);

    this.meshes = [];
    model.traverse((o) => { if (o.isMesh) this.meshes.push(o); });
    this.morphMeshes = this.meshes.filter((m) => m.morphTargetDictionary);
    this.origMats = new Map(this.meshes.map((m) => [m, m.material]));

    // 얼굴 위치(표정 장면에서 카메라가 다가갈 곳)
    model.updateMatrixWorld(true);
    const headBox = new THREE.Box3();
    this.morphMeshes.forEach((m) => headBox.expandByObject(m));
    this.headY = headBox.getCenter(new THREE.Vector3()).y + model.position.y;
    this.headH = headBox.getSize(new THREE.Vector3()).y;

    this.buildOutlines();
    this.buildStyles();

    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    gltf.animations.forEach((clip) => (this.actions[clip.name] = this.mixer.clipAction(clip)));
    this.current = this.actions.Idle;
    this.current.play();

    this.resize();
    this.loop();
  }

  // 외곽선: 법선 방향으로 살짝 부풀린 뒷면 메시(인버티드 헐)
  buildOutlines() {
    // 두께는 월드 단위 — 부품마다 스케일이 달라서 셰이더에서 modelMatrix 크기로 나눔
    this.outlineUniform = { value: 0.02 };
    this.outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, toneMapped: false });
    this.outlineMat.onBeforeCompile = (sh) => {
      sh.uniforms.uOutline = this.outlineUniform;
      sh.vertexShader = 'uniform float uOutline;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed += normalize(normal) * uOutline / length(modelMatrix[0].xyz);'
      );
    };
    this.hulls = this.meshes.map((m) => {
      const mat = this.outlineMat;
      let h;
      if (m.isSkinnedMesh) {
        // 손처럼 뼈에 스키닝된 부품은 같은 스켈레톤에 묶어야 같이 움직임
        h = new THREE.SkinnedMesh(m.geometry, mat);
        h.position.copy(m.position);
        h.quaternion.copy(m.quaternion);
        h.scale.copy(m.scale);
        m.parent.add(h);
        h.bind(m.skeleton, m.bindMatrix);
      } else {
        h = new THREE.Mesh(m.geometry, mat);
        m.add(h);
      }
      if (m.morphTargetInfluences) {
        h.morphTargetInfluences = m.morphTargetInfluences;
        h.morphTargetDictionary = m.morphTargetDictionary;
      }
      h.visible = false;
      return h;
    });
  }

  buildStyles() {
    const per = (fn) => new Map(this.meshes.map((m) => [m, fn(this.origMats.get(m))]));
    const colorOf = (mat) => mat.color.clone();
    const tone = (steps) => {
      const data = new Uint8Array(steps.length * 4);
      steps.forEach((v, i) => data.set([v, v, v, 255], i * 4));
      const t = new THREE.DataTexture(data, steps.length, 1);
      t.minFilter = t.magFilter = THREE.NearestFilter;
      t.needsUpdate = true;
      return t;
    };
    const cel = tone([90, 190, 255]);
    const px = tone([110, 255]);
    const clayTone = { Main: 0xe9dfd2, Grey: 0xbfb5a8, Black: 0x5a534c };
    const chromeTone = { Main: 0xffc46b, Grey: 0xe8e8e8, Black: 0x2a2a2a };
    const lineTone = { Main: 0x1f1b17, Grey: 0x1f1b17, Black: 0x1f1b17 };

    this.styles = {
      original: { mats: per((m) => m), env: true },
      cel: { mats: per((m) => new THREE.MeshToonMaterial({ color: colorOf(m), gradientMap: cel })), outline: 0.02 },
      pixel: { mats: per((m) => new THREE.MeshToonMaterial({ color: colorOf(m), gradientMap: px })), pixel: 7 },
      line: { mats: per((m) => new THREE.MeshBasicMaterial({ color: lineTone[m.name] ?? 0x1f1b17, toneMapped: false })), outline: 0.014, outlineColor: 0xf3eee4 },
      wire: { mats: per(() => new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true, toneMapped: false })) },
      clay: { mats: per((m) => new THREE.MeshStandardMaterial({ color: clayTone[m.name] ?? 0xe9dfd2, roughness: 0.95 })) },
      normal: { mats: per(() => new THREE.MeshNormalMaterial()) },
      chrome: { mats: per((m) => new THREE.MeshStandardMaterial({ color: chromeTone[m.name] ?? 0xe8e8e8, metalness: 1, roughness: 0.18 })), env: true },
      silhouette: { mats: per(() => new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false })) },
    };
    this.setStyle('original');
  }

  setStyle(id) {
    const st = this.styles?.[id];
    if (!st || this.styleId === id) return;
    this.styleId = id;
    this.meshes.forEach((m) => (m.material = st.mats.get(m)));
    this.hulls.forEach((h) => (h.visible = !!st.outline));
    if (st.outline) {
      this.outlineUniform.value = st.outline;
      this.outlineMat.color.set(st.outlineColor ?? INK);
    }
    this.scene.environment = st.env ? this.envMap : null;
    this.scene.environmentIntensity = id === 'chrome' ? 1.2 : 0.5;
    if ((st.pixel || 0) !== this.pixel) {
      this.pixel = st.pixel || 0;
      this.canvas.classList.toggle('is-pixel', !!this.pixel);
      this.resize();
    }
  }

  play(name, fade = 0.45) {
    const next = this.actions?.[name];
    if (!next || next === this.current) return;
    next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    this.current?.fadeOut(fade);
    this.current = next;
  }

  setExpression(name) {
    this.morphMeshes?.forEach((m) => {
      Object.entries(m.morphTargetDictionary).forEach(([k, i]) => {
        window.gsap.to(m.morphTargetInfluences, { [i]: k === name ? 1 : 0, duration: 0.5, ease: 'power2.out' });
      });
    });
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    if (this.pixel) {
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(Math.ceil(w / this.pixel), Math.ceil(h / this.pixel), false);
    } else {
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      this.renderer.setSize(w, h, false);
    }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // 화면 세로의 약 64%를 캐릭터가 차지하도록 거리 계산
  placeCamera(cam, zoom, focus) {
    const H = this.height;
    const fov = THREE.MathUtils.degToRad(cam.fov / 2);
    // 세로로 긴 화면(모바일)에서는 가로 폭 기준으로 맞춤
    const body = Math.max(H / 0.64, this.width / 0.8 / cam.aspect);
    const face = Math.max(this.headH * 2.6, (this.width * 1.1) / 0.9 / cam.aspect);
    const fitH = THREE.MathUtils.lerp(body, face, focus) / zoom;
    const dist = fitH / 2 / Math.tan(fov);
    const y = THREE.MathUtils.lerp(H * 0.5, this.headY, focus);
    cam.position.set(0, y + dist * 0.06, dist);
    cam.lookAt(0, y, 0);
  }

  // 갤러리용 정지 이미지 (같은 렌더러로 한 번씩 찍고 원래대로 복구)
  snapshot(id, w = 420, h = 520) {
    const prev = this.styleId;
    const rot = this.pivot.rotation.y;
    this.setStyle(id);
    this.mixer.update(0);
    const pixel = this.pixel;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(pixel ? Math.round(w / pixel) : w, pixel ? Math.round(h / pixel) : h, false);
    const cam = this.camera.clone();
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    this.placeCamera(cam, 1, 0);
    this.pivot.rotation.y = -0.5;
    this.renderer.render(this.scene, cam);
    const url = this.canvas.toDataURL('image/png');
    this.pivot.rotation.y = rot;
    this.setStyle(prev);
    this.resize();
    return { url, pixel: !!pixel };
  }

  loop = () => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.mixer?.update(dt);

    const m = this.mouse;
    m.sx += (m.x - m.sx) * 0.05;
    m.sy += (m.y - m.sy) * 0.05;
    this.autoRot += this.view.spin * dt;

    if (this.height) {
      this.pivot.rotation.y = this.view.rotY + this.view.yaw + this.autoRot + m.sx * 0.35 * this.view.parallax;
      this.pivot.rotation.x = m.sy * 0.06 * this.view.parallax;
      this.placeCamera(this.camera, this.view.zoom, this.view.focus);
    }
    this.renderer.render(this.scene, this.camera);
  };
}
