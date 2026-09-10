import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================================
   ABSS MAP — EXTERIOR BUILD
   ========================================================= */

let scene, camera, renderer, player;
let velocityY = 0;
let onGround = true;
let running = false;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

const joystick = {
  x: 0,
  y: 0,
  active: false
};

const clock = new THREE.Clock();

/* ---------- START ---------- */

init();
animate();

/* ---------- INIT ---------- */

function init() {

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x8dbbd2);
  scene.fog = new THREE.Fog(0x8dbbd2, 160, 480);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    700
  );

  camera.position.set(0, 7, 18);

  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  /* LIGHT */

  scene.add(
    new THREE.HemisphereLight(
      0xeaf7ff,
      0x45633d,
      2.2
    )
  );

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      2.3
    );

  sun.position.set(
    100,
    150,
    80
  );

  sun.castShadow = true;

  sun.shadow.mapSize.width = 1024;
  sun.shadow.mapSize.height = 1024;

  sun.shadow.camera.left = -180;
  sun.shadow.camera.right = 180;
  sun.shadow.camera.top = 180;
  sun.shadow.camera.bottom = -180;

  scene.add(sun);

  /* WORLD */

  createGround();
  createCampusRoads();
  createMainGate();
  createMainCollege();
  createSideBlocks();
  createHostels();
  createGardens();
  createParking();
  createSportsGround();
  createCampusTrees();
  createPlayer();

  setupKeyboard();
  setupJoystick();
  setupButtons();

  window.addEventListener(
    "resize",
    resize
  );

  hideLoading();
}

/* =========================================================
   MATERIAL
   ========================================================= */

function mat(color, roughness = 0.8) {

  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0
  });

}

/* =========================================================
   GROUND
   ========================================================= */

function createGround() {

  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        500,
        500
      ),
      mat(0x4d7d43)
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);

}

/* =========================================================
   ROADS
   ========================================================= */

function makeRoad(
  x,
  z,
  width,
  depth
) {

  const road =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.12,
        depth
      ),
      mat(0x55585a)
    );

  road.position.set(
    x,
    0.06,
    z
  );

  road.receiveShadow = true;

  scene.add(road);

}

function makePath(
  x,
  z,
  width,
  depth
) {

  const path =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.10,
        depth
      ),
      mat(0xb8b1a1)
    );

  path.position.set(
    x,
    0.05,
    z
  );

  scene.add(path);

}

function createCampusRoads() {

  makeRoad(
    0,
    30,
    18,
    290
  );

  makeRoad(
    0,
    -50,
    300,
    18
  );

  makeRoad(
    0,
    105,
    300,
    16
  );

  makeRoad(
    -105,
    20,
    14,
    250
  );

  makeRoad(
    105,
    20,
    14,
    250
  );

  makePath(
    0,
    -15,
    8,
    55
  );

}

/* =========================================================
   BUILDING CORE
   ========================================================= */

function createBlock(
  x,
  z,
  width,
  depth,
  floors,
  name
) {

  const floorHeight = 4.2;
  const totalHeight =
    floors * floorHeight;

  /* MAIN RED BODY */

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        totalHeight,
        depth
      ),
      mat(0xa94739)
    );

  body.position.set(
    x,
    totalHeight / 2,
    z
  );

  body.castShadow = true;
  body.receiveShadow = true;

  scene.add(body);

  /* WHITE FLOOR BANDS */

  for (
    let f = 1;
    f < floors;
    f++
  ) {

    const band =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width + 0.12,
          0.18,
          depth + 0.12
        ),
        mat(0xf0eee8)
      );

    band.position.set(
      x,
      f * floorHeight,
      z
    );

    scene.add(band);

  }

  /* SIDE WHITE COLUMNS */

  for (
    const side of [-1, 1]
  ) {

    const column =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.0,
          totalHeight + 0.2,
          1.0
        ),
        mat(0xf0eee8)
      );

    column.position.set(
      x +
      side *
      (width / 2 - 0.55),
      totalHeight / 2,
      z -
      depth / 2 - 0.15
    );

    column.castShadow = true;

    scene.add(column);

  }

  /* WINDOWS */

  createWindows(
    x,
    z,
    width,
    depth,
    floors
  );

  /* ROOF */

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.8,
        0.35,
        depth + 0.8
      ),
      mat(0x8f2929)
    );

  roof.position.set(
    x,
    totalHeight + 0.2,
    z
  );

  roof.castShadow = true;

  scene.add(roof);

  /* NAME BOARD */

  const board =
    createTextBoard(name);

  board.position.set(
    x,
    totalHeight - 1.1,
    z -
    depth / 2 -
    0.12
  );

  scene.add(board);

}

/* =========================================================
   WINDOWS
   ========================================================= */

function createWindows(
  x,
  z,
  width,
  depth,
  floors
) {

  const glassMat =
    new THREE.MeshStandardMaterial({
      color: 0x6faebe,
      roughness: 0.18,
      metalness: 0.08
    });

  const frameMat =
    mat(0xf0eee8);

  const count =
    Math.max(
      4,
      Math.floor(width / 4)
    );

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {

    const y =
      1.65 +
      floor * 4.2;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const px =
        x -
        width / 2 +
        2.3 +
        i *
        (
          (width - 4.6) /
          Math.max(1, count - 1)
        );

      const window =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.55,
            1.65,
            0.08
          ),
          glassMat
        );

      window.position.set(
        px,
        y,
        z -
        depth / 2 -
        0.08
      );

      scene.add(window);

      /* vertical frame */

      const frame =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.08,
            1.8,
            0.12
          ),
          frameMat
        );

      frame.position.set(
        px,
        y,
        z -
        depth / 2 -
        0.13
      );

      scene.add(frame);

    }

  }

}

/* =========================================================
   MAIN COLLEGE
   ========================================================= */

function createMainCollege() {

  /* Main central block */

  createBlock(
    0,
    -75,
    58,
    30,
    4,
    "ABSS INSTITUTE OF TECHNOLOGY"
  );

  /* FRONT PORTICO */

  const white =
    mat(0xf0eee8);

  const red =
    mat(0x9d2d2d);

  for (
    const x of [-20, 20]
  ) {

    const pillar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.4,
          9,
          2.4
        ),
        white
      );

    pillar.position.set(
      x,
      4.5,
      -91
    );

    pillar.castShadow = true;

    scene.add(pillar);

  }

  const portico =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        48,
        1.3,
        8
      ),
      red
    );

  portico.position.set(
    0,
    9,
    -91
  );

  portico.castShadow = true;

  scene.add(portico);

  /* GLASS FRONT */

  const glass =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        17,
        6,
        0.3
      ),
      new THREE.MeshStandardMaterial({
        color: 0x91c9d8,
        transparent: true,
        opacity: 0.58,
        roughness: 0.15
      })
    );

  glass.position.set(
    0,
    3.2,
    -90.4
  );

  scene.add(glass);

  const sign =
    createTextBoard("ABSS");

  sign.scale.set(
    0.9,
    0.9,
    0.9
  );

  sign.position.set(
    0,
    5.3,
    -90.7
  );

  scene.add(sign);

}

/* =========================================================
   SIDE BLOCKS
   ========================================================= */

function createSideBlocks() {

  createBlock(
    -62,
    -58,
    42,
    27,
    4,
    "MAHATMA GANDHI BLOCK"
  );

  createBlock(
    62,
    -58,
    42,
    27,
    4,
    "VISHVESVARAYA BLOCK"
  );

}

/* =========================================================
   HOSTELS
   ========================================================= */

function createHostels() {

  createBlock(
    -78,
    65,
    40,
    27,
    4,
    "CSA BOYS HOSTEL"
  );

  createBlock(
    78,
    65,
    40,
    27,
    4,
    "GIRLS HOSTEL"
  );

}

/* =========================================================
   MAIN GATE
   ========================================================= */

function createMainGate() {

  const pillarMat =
    mat(0x8f4a35);

  const whiteMat =
    mat(0xe8e5df);

  /* gate pillars */

  for (
    const x of [-12, 12]
  ) {

    const pillar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          7,
          3
        ),
        pillarMat
      );

    pillar.position.set(
      x,
      3.5,
      108
    );

    pillar.castShadow = true;

    scene.add(pillar);

    const cap =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3.5,
          0.5,
          3.5
        ),
        whiteMat
      );

    cap.position.set(
      x,
      7.2,
      108
    );

    scene.add(cap);

  }

  /* gate */

  const gate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        20,
        4,
        0.3
      ),
      mat(0x633d2b)
    );

  gate.position.set(
    0,
    2,
    108
  );

  scene.add(gate);

  const sign =
    createTextBoard(
      "ABSS INSTITUTE OF TECHNOLOGY"
    );

  sign.scale.set(
    1.1,
    1.1,
    1.1
  );

  sign.position.set(
    0,
    6.2,
    108
  );

  scene.add(sign);

}

/* =========================================================
   TEXT BOARD
   ========================================================= */

function createTextBoard(
  text
) {

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 768;
  canvas.height = 128;

  const ctx =
    canvas.getContext(
      "2d"
    );

  ctx.fillStyle =
    "#f3f0e9";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    "#8e2929";

  ctx.font =
    "bold 42px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.anisotropy =
    renderer.capabilities
      .getMaxAnisotropy();

  return new THREE.Mesh(
    new THREE.PlaneGeometry(
      7,
      1.17
    ),
    new THREE.MeshBasicMaterial({
      map: texture
    })
  );

}

/* =========================================================
   GARDENS
   ========================================================= */

function createGardens() {

  /* central lawn */

  const lawn =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        75,
        0.08,
        30
      ),
      mat(0x568849)
    );

  lawn.position.set(
    0,
    0.04,
    -15
  );

  scene.add(lawn);

  /* hedges */

  for (
    let x = -35;
    x <= 35;
    x += 5
  ) {

    createBush(
      x,
      -29
    );

    createBush(
      x,
      0
    );

  }

}

/* =========================================================
   BUSH
   ========================================================= */

function createBush(
  x,
  z
) {

  const bush =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.2,
        8,
        6
      ),
      mat(0x2f6e35)
    );

  bush.position.set(
    x,
    0.9,
    z
  );

  bush.scale.y = 0.7;

  scene.add(bush);

}

/* =========================================================
   TREES
   ========================================================= */

function createTree(
  x,
  z,
  scale = 1
) {

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.35 * scale,
        0.48 * scale,
        3.2 * scale,
        8
      ),
      mat(0x68432d)
    );

  trunk.position.set(
    x,
    1.6 * scale,
    z
  );

  trunk.castShadow = true;

  scene.add(trunk);

  const crown =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.1 * scale,
        10,
        8
      ),
      mat(0x286532)
    );

  crown.position.set(
    x,
    4.0 * scale,
    z
  );

  crown.castShadow = true;

  scene.add(crown);

}

function createCampusTrees() {

  const positions = [

    [-120, -95],
    [-105, -82],
    [-90, -105],

    [90, -105],
    [108, -88],
    [122, -100],

    [-120, 20],
    [-115, 55],
    [-115, 95],

    [115, 20],
    [115, 55],
    [115, 95],

    [-48, 110],
    [48, 110]

  ];

  for (
    const p of positions
  ) {

    createTree(
      p[0],
      p[1],
      1.25
    );

  }

}

/* =========================================================
   PARKING
   ========================================================= */

function createParking() {

  const parking =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        45,
        0.08,
        25
      ),
      mat(0x6b6c6d)
    );

  parking.position.set(
    -75,
    0.04,
    20
  );

  scene.add(parking);

  /* parking lines */

  for (
    let x = -95;
    x <= -55;
    x += 5
  ) {

    const line =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.03,
          20
        ),
        mat(0xe5e5e5)
      );

    line.position.set(
      x,
      0.1,
      20
    );

    scene.add(line);

  }

}

/* =========================================================
   SPORTS
   ========================================================= */

function createSportsGround() {

  const field =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        55,
        0.08,
        34
      ),
      mat(0x3f7540)
    );

  field.position.set(
    70,
    0.04,
    105
  );

  scene.add(field);

  const court =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        30,
        0.10,
        18
      ),
      mat(0x3476a0)
    );

  court.position.set(
    70,
    0.09,
    105
  );

  scene.add(court);

}

/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer() {

  player =
    new THREE.Group();

  const shirt =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        0.9,
        0.58
      ),
      mat(0xf3f3f3)
    );

  shirt.position.y =
    1.7;

  shirt.castShadow = true;

  player.add(shirt);

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.52,
        1.35,
        4,
        8
      ),
      mat(0xeeeeee)
    );

  body.position.y =
    1.5;

  body.castShadow = true;

  player.add(body);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        12,
        10
      ),
      mat(0xd89b72)
    );

  head.position.y =
    2.65;

  head.castShadow = true;

  player.add(head);

  const legMat =
    mat(0x20252b);

  const leg1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        1.1,
        0.4
      ),
      legMat
    );

  const leg2 =
    leg1.clone();

  leg1.position.set(
    -0.22,
    0.55,
    0
  );

  leg2.position.set(
    0.22,
    0.55,
    0
  );

  player.add(
    leg1,
    leg2
  );

  player.position.set(
    0,
    0,
    90
  );

  scene.add(player);

}

/* =========================================================
   KEYBOARD
   ========================================================= */

function setupKeyboard() {

  window.addEventListener(
    "keydown",
    e => {

      if (
        e.code === "KeyW" ||
        e.code === "ArrowUp"
      )
        keys.forward = true;

      if (
        e.code === "KeyS" ||
        e.code === "ArrowDown"
      )
        keys.backward = true;

      if (
        e.code === "KeyA" ||
        e.code === "ArrowLeft"
      )
        keys.left = true;

      if (
        e.code === "KeyD" ||
        e.code === "ArrowRight"
      )
        keys.right = true;

      if (
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      )
        running = true;

      if (
        e.code === "Space"
      )
        jump();

    }
  );

  window.addEventListener(
    "keyup",
    e => {

      if (
        e.code === "KeyW" ||
        e.code === "ArrowUp"
      )
        keys.forward = false;

      if (
        e.code === "KeyS" ||
        e.code === "ArrowDown"
      )
        keys.backward = false;

      if (
        e.code === "KeyA" ||
        e.code === "ArrowLeft"
      )
        keys.left = false;

      if (
        e.code === "KeyD" ||
        e.code === "ArrowRight"
      )
        keys.right = false;

      if (
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      )
        running = false;

    }
  );

}

/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick() {

  const base =
    document.getElementById(
      "joystick"
    );

  const stick =
    document.getElementById(
      "stick"
    );

  if (!base || !stick)
    return;

  function move(
    x,
    y
  ) {

    const r =
      base.getBoundingClientRect();

    const cx =
      r.left + r.width / 2;

    const cy =
      r.top + r.height / 2;

    let dx =
      x - cx;

    let dy =
      y - cy;

    const max =
      r.width / 2 - 24;

    const d =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (d > max) {

      dx =
        dx / d * max;

      dy =
        dy / d * max;

    }

    stick.style.transform =
      `translate(${dx}px, ${dy}px)`;

    joystick.x =
      dx / max;

    joystick.y =
      dy / max;

  }

  function reset() {

    joystick.active = false;
    joystick.x = 0;
    joystick.y = 0;

    stick.style.transform =
      "translate(0px,0px)";

  }

  base.addEventListener(
    "pointerdown",
    e => {

      joystick.active = true;

      base.setPointerCapture(
        e.pointerId
      );

      move(
        e.clientX,
        e.clientY
      );

    }
  );

  base.addEventListener(
    "pointermove",
    e => {

      if (!joystick.active)
        return;

      move(
        e.clientX,
        e.clientY
      );

    }
  );

  base.addEventListener(
    "pointerup",
    reset
  );

  base.addEventListener(
    "pointercancel",
    reset
  );

}

/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

  const jumpBtn =
    document.getElementById(
      "jumpBtn"
    );

  const runBtn =
    document.getElementById(
      "runBtn"
    );

  if (jumpBtn) {

    jumpBtn.addEventListener(
      "pointerdown",
      e => {

        e.preventDefault();
        jump();

      }
    );

  }

  if (runBtn) {

    runBtn.addEventListener(
      "pointerdown",
      e => {

        e.preventDefault();
        running = true;

      }
    );

    runBtn.addEventListener(
      "pointerup",
      () => {
        running = false;
      }
    );

    runBtn.addEventListener(
      "pointercancel",
      () => {
        running = false;
      }
    );

  }

}

/* =========================================================
   JUMP
   ========================================================= */

function jump() {

  if (!onGround)
    return;

  velocityY = 7.5;
  onGround = false;

}

/* =========================================================
   PLAYER UPDATE
   ========================================================= */

function updatePlayer(delta) {

  if (!player)
    return;

  let x = 0;
  let z = 0;

  if (keys.left)
    x -= 1;

  if (keys.right)
    x += 1;

  if (keys.forward)
    z -= 1;

  if (keys.backward)
    z += 1;

  if (
    Math.abs(joystick.x) > 0.08 ||
    Math.abs(joystick.y) > 0.08
  ) {

    x = joystick.x;
    z = joystick.y;

  }

  const length =
    Math.sqrt(
      x * x +
      z * z
    );

  if (length > 1) {

    x /= length;
    z /= length;

  }

  const speed =
    running ? 13 : 6.5;

  player.position.x +=
    x * speed * delta;

  player.position.z +=
    z * speed * delta;

  /* WORLD LIMIT */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -145,
      145
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -140,
      140
    );

  /* ROTATION */

  if (
    Math.abs(x) > 0.01 ||
    Math.abs(z) > 0.01
  ) {

    const angle =
      Math.atan2(
        x,
        z
      );

    player.rotation.y =
      THREE.MathUtils.lerp(
        player.rotation.y,
        angle,
        0.18
      );

  }

  /* GRAVITY */

  velocityY -=
    18 * delta;

  player.position.y +=
    velocityY * delta;

  if (
    player.position.y <= 0
  ) {

    player.position.y = 0;
    velocityY = 0;
    onGround = true;

  }

}

/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(delta) {

  if (!player)
    return;

  const desired =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 6.5,
      player.position.z + 10
    );

  camera.position.lerp(
    desired,
    Math.min(
      1,
      delta * 6
    )
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1.7,
    player.position.z
  );

}

/* =========================================================
   LOADING
   ========================================================= */

function hideLoading() {

  const loading =
    document.getElementById(
      "loading"
    );

  if (!loading)
    return;

  setTimeout(() => {

    loading.classList.add(
      "hide"
    );

    setTimeout(() => {

      if (loading.parentNode)
        loading.remove();

    }, 400);

  }, 400);

}

/* =========================================================
   RESIZE
   ========================================================= */

function resize() {

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      1.5
    )
  );

}

/* =========================================================
   GAME LOOP
   ========================================================= */

function animate() {

  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updatePlayer(delta);
  updateCamera(delta);

  renderer.render(
    scene,
    camera
  );

}
