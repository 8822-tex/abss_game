import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene;
let camera;
let renderer;
let player;
let world;

let cameraYaw = 0;
let cameraPitch = -0.18;

let velocityY = 0;
let onGround = true;
let running = false;

let lastTime = performance.now();

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

const joystick = {
  x: 0,
  y: 0,
  active: false,
  id: null
};

const look = {
  active: false,
  id: null,
  x: 0,
  y: 0
};

const colliders = [];

const move = new THREE.Vector3();

init();

function init() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x8ec5e6);

  scene.fog = new THREE.Fog(
    0x8ec5e6,
    70,
    420
  );

  camera = new THREE.PerspectiveCamera(
    65,
    innerWidth / innerHeight,
    0.1,
    500
  );

  camera.position.set(0, 5, 10);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio, 1.75)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  document.body.appendChild(
    renderer.domElement
  );

  createLights();

  world = new THREE.Group();

  scene.add(world);

  buildCampus();

  createPlayer();

  setupControls();

  hideLoading();

  window.addEventListener(
    "resize",
    onResize
  );

  animate();
}

function createLights() {
  const hemisphere =
    new THREE.HemisphereLight(
      0xdff2ff,
      0x506044,
      2.2
    );

  scene.add(hemisphere);

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  sun.position.set(
    80,
    120,
    50
  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(
    2048,
    2048
  );

  sun.shadow.camera.left = -180;
  sun.shadow.camera.right = 180;
  sun.shadow.camera.top = 180;
  sun.shadow.camera.bottom = -180;

  scene.add(sun);
}

function material(
  color,
  roughness = 0.8
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.05
  });
}

function box(
  name,
  x,
  y,
  z,
  sx,
  sy,
  sz,
  color,
  group = world
) {
  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sx,
        sy,
        sz
      ),
      material(color)
    );

  mesh.name = name;

  mesh.position.set(
    x,
    y + sy / 2,
    z
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  return mesh;
}

function addCollider(
  x,
  z,
  sx,
  sz
) {
  colliders.push({
    x,
    z,
    sx,
    sz
  });
}

function addLabel(
  text,
  x,
  y,
  z,
  size = 1.2
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 256;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.fillStyle = "#ffffff";

  context.font =
    "bold 100px Arial";

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.shadowColor = "#000";
  context.shadowBlur = 10;

  context.fillText(
    text,
    512,
    128
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  const sprite =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

  sprite.position.set(
    x,
    y,
    z
  );

  sprite.scale.set(
    size * 4,
    size,
    1
  );

  world.add(sprite);

  return sprite;
}

/* =========================================================
   CAMPUS
   ========================================================= */

function buildCampus() {
  buildGround();
  buildRoads();
  buildGate();

  buildAcademicBlock(
    -42,
    0,
    "Mahatma Gandhi Block"
  );

  buildAcademicBlock(
    42,
    0,
    "Madan Mohan Malviya Block"
  );

  buildAcademicBlock(
    0,
    -58,
    "Vishvesaraya Block"
  );

  buildHostel(
    -82,
    48,
    "Boys Hostel"
  );

  buildHostel(
    82,
    48,
    "Girls Hostel"
  );

  buildSports();
  buildGardens();
  buildParking();
  buildTrees();
}

function buildGround() {
  box(
    "Campus Ground",
    0,
    -0.2,
    0,
    360,
    0.2,
    360,
    0x6fa35b
  );
}

function buildRoads() {
  box(
    "Main Road",
    0,
    0,
    55,
    22,
    0.12,
    180,
    0x35383b
  );

  box(
    "Central Road",
    0,
    0,
    0,
    180,
    0.12,
    16,
    0x35383b
  );

  box(
    "Left Road",
    -65,
    0,
    0,
    14,
    0.12,
    180,
    0x3e4144
  );

  box(
    "Right Road",
    65,
    0,
    0,
    14,
    0.12,
    180,
    0x3e4144
  );

  for (
    let z = -75;
    z <= 75;
    z += 15
  ) {
    box(
      "Road Mark",
      0,
      0.13,
      z,
      0.35,
      0.02,
      7,
      0xe6d9a4
    );
  }
}

/* =========================================================
   MAIN GATE + BOUNDARY
   ========================================================= */

function buildGate() {
  const gate =
    new THREE.Group();

  world.add(gate);

  box(
    "Gate Pillar Left",
    -8,
    0,
    88,
    3,
    8,
    3,
    0xe8e0cf,
    gate
  );

  box(
    "Gate Pillar Right",
    8,
    0,
    88,
    3,
    8,
    3,
    0xe8e0cf,
    gate
  );

  box(
    "Gate Top",
    0,
    7.2,
    88,
    19,
    2,
    3,
    0x8e2026,
    gate
  );

  addLabel(
    "ABSS INSTITUTE OF TECHNOLOGY",
    0,
    8.25,
    86.3,
    1.5
  );

  box(
    "Gate Left Door",
    -4.1,
    0,
    86.4,
    7.3,
    4.2,
    0.45,
    0x25282a,
    gate
  );

  box(
    "Gate Right Door",
    4.1,
    0,
    86.4,
    7.3,
    4.2,
    0.45,
    0x25282a,
    gate
  );

  buildWall(
    -120,
    0,
    90,
    3,
    180,
    0.7
  );

  buildWall(
    120,
    0,
    90,
    3,
    180,
    0.7
  );

  buildWall(
    0,
    0,
    -90,
    240,
    3,
    0.7
  );
}

function buildWall(
  x,
  y,
  z,
  sx,
  sz,
  sy
) {
  box(
    "Boundary Wall",
    x,
    y,
    z,
    sx,
    sy,
    sz,
    0xd5d0c3
  );

  addCollider(
    x,
    z,
    sx,
    sz
  );
}

/* =========================================================
   ACADEMIC BUILDINGS
   ========================================================= */

function buildAcademicBlock(
  x,
  z,
  label
) {
  const group =
    new THREE.Group();

  world.add(group);

  const width = 48;
  const depth = 30;
  const floorHeight = 4.2;
  const floors = 3;

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {
    box(
      label + " Floor",
      x,
      floor * floorHeight,
      z,
      width,
      floorHeight - 0.15,
      depth,
      0xd9d3c5,
      group
    );

    box(
      label + " Band",
      x,
      floor * floorHeight +
        floorHeight -
        0.25,
      z,
      width,
      0.25,
      depth + 0.15,
      0x9d9588,
      group
    );

    addWindows(
      group,
      x,
      z,
      floor,
      width,
      depth,
      floorHeight
    );
  }

  box(
    label + " Roof",
    x,
    floors * floorHeight,
    z,
    width + 2,
    0.7,
    depth + 2,
    0x6c7072,
    group
  );

  box(
    label + " Entrance",
    x,
    0,
    z + depth / 2 + 0.35,
    8,
    6,
    0.8,
    0x7f8a91,
    group
  );

  addLabel(
    label,
    x,
    13.7,
    z - depth / 2 - 0.8,
    1.2
  );

  buildInterior(
    group,
    x,
    z,
    width,
    depth,
    floors,
    label
  );
}

function addWindows(
  group,
  x,
  z,
  floor,
  width,
  depth,
  height
) {
  const y =
    floor * height + 1.1;

  for (
    let i = -3;
    i <= 3;
    i++
  ) {
    const windowX =
      x + i * 5.8;

    box(
      "Window",
      windowX,
      y,
      z + depth / 2 + 0.16,
      3.8,
      2.1,
      0.16,
      0x5e8fb1,
      group
    );

    box(
      "Window",
      windowX,
      y,
      z - depth / 2 - 0.16,
      3.8,
      2.1,
      0.16,
      0x5e8fb1,
      group
    );
  }
}

/* =========================================================
   INTERNAL DESIGN
   ========================================================= */

function buildInterior(
  group,
  x,
  z,
  width,
  depth,
  floors,
  label
) {
  const floorMaterial =
    material(0xc9c3b8);

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {
    const floorY =
      floor * 4.2;

    const floorMesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width - 1,
          0.15,
          depth - 1
        ),
        floorMaterial
      );

    floorMesh.position.set(
      x,
      floorY + 0.08,
      z
    );

    floorMesh.receiveShadow = true;

    group.add(floorMesh);

    /* Corridor */

    box(
      "Corridor",
      x,
      floorY + 0.15,
      z,
      7,
      0.15,
      depth - 3,
      0xb5aea2,
      group
    );

    /* Classrooms + Labs */

    for (
      let room = -1;
      room <= 1;
      room++
    ) {
      const roomZ =
        z + room * 9;

      makeClassroom(
        group,
        x - 15,
        floorY + 0.15,
        roomZ,
        18,
        7,
        label +
          " Classroom",
        false
      );

      makeClassroom(
        group,
        x + 15,
        floorY + 0.15,
        roomZ,
        18,
        7,
        label +
          " Computer Lab",
        true
      );
    }
  }

  for (
    let floor = 0;
    floor < floors - 1;
    floor++
  ) {
    buildStairs(
      group,
      x,
      z - 10,
      floor * 4.2
    );
  }

  makeReception(
    group,
    x,
    0,
    z + depth / 2 - 5
  );
}

function makeClassroom(
  group,
  x,
  y,
  z,
  width,
  depth,
  label,
  isLab
) {
  const wallColor =
    isLab
      ? 0xd4e0df
      : 0xe1ddd2;

  box(
    label + " Room",
    x,
    y,
    z,
    width,
    3.8,
    depth,
    wallColor,
    group
  );

  box(
    label + " Board",
    x,
    y + 1.3,
    z - depth / 2 - 0.12,
    5.5,
    2.3,
    0.12,
    isLab
      ? 0x304b52
      : 0x26363a,
    group
  );

  for (
    let i = -1;
    i <= 1;
    i++
  ) {
    box(
      "Student Desk",
      x + i * 3.8,
      y + 0.55,
      z + 1.2,
      3,
      0.18,
      1.2,
      0x805a3d,
      group
    );

    box(
      "Student Desk",
      x + i * 3.8,
      y + 0.55,
      z + 3.6,
      3,
      0.18,
      1.2,
      0x805a3d,
      group
    );
  }

  if (isLab) {
    for (
      let i = -1;
      i <= 1;
      i++
    ) {
      box(
        "Computer Table",
        x + i * 4,
        y + 0.75,
        z - 2.5,
        2.5,
        0.12,
        1.1,
        0x4a4d50,
        group
      );

      box(
        "Computer Monitor",
        x + i * 4,
        y + 1.3,
        z - 2.7,
        1.4,
        1.1,
        0.12,
        0x22272a,
        group
      );
    }
  }
}

function buildStairs(
  group,
  x,
  z,
  y
) {
  for (
    let i = 0;
    i < 10;
    i++
  ) {
    box(
      "Stair",
      x - 2.5 + i * 0.55,
      y + i * 0.2,
      z,
      0.5,
      0.2,
      4.2,
      0x8f8980,
      group
    );
  }

  box(
    "Stair Rail",
    x + 3,
    y + 1.5,
    z,
    0.15,
    3,
    4.2,
    0x4f5558,
    group
  );
}

function makeReception(
  group,
  x,
  y,
  z
) {
  box(
    "Reception Desk",
    x,
    y + 0.8,
    z,
    8,
    1.2,
    1.6,
    0x765238,
    group
  );

  addLabel(
    "RECEPTION",
    x,
    y + 2.6,
    z - 1,
    0.75
  );
}

/* =========================================================
   HOSTELS
   ========================================================= */

function buildHostel(
  x,
  z,
  label
) {
  const group =
    new THREE.Group();

  world.add(group);

  const width = 34;
  const depth = 24;
  const height = 4.1;

  for (
    let floor = 0;
    floor < 3;
    floor++
  ) {
    box(
      label + " Floor",
      x,
      floor * height,
      z,
      width,
      height - 0.15,
      depth,
      0xcfc7b8,
      group
    );
  }

  box(
    label + " Roof",
    x,
    12.3,
    z,
    width + 1,
    0.7,
    depth + 1,
    0x6c7072,
    group
  );

  addLabel(
    label,
    x,
    14,
    z - depth / 2 - 0.7,
    1
  );

  for (
    let floor = 0;
    floor < 3;
    floor++
  ) {
    for (
      let i = -2;
      i <= 2;
      i++
    ) {
      box(
        "Hostel Window",
        x + i * 5.5,
        floor * height + 1.2,
        z + depth / 2 + 0.15,
        3.4,
        2,
        0.16,
        0x5b88a4,
        group
      );
    }
  }
}

/* =========================================================
   SPORTS / GARDEN / PARKING
   ========================================================= */

function buildSports() {
  box(
    "Sports Ground",
    0,
    0,
    -8,
    62,
    0.08,
    42,
    0x4f9a4b
  );

  box(
    "Sports Court",
    0,
    0.1,
    -8,
    36,
    0.06,
    20,
    0xd2c39e
  );
}

function buildGardens() {
  box(
    "Garden Left",
    -35,
    0.03,
    38,
    28,
    0.06,
    22,
    0x3f8e45
  );

  box(
    "Garden Right",
    35,
    0.03,
    38,
    28,
    0.06,
    22,
    0x3f8e45
  );
}

function buildParking() {
  box(
    "Parking",
    -82,
    0.02,
    -35,
    38,
    0.06,
    28,
    0x51565a
  );

  for (
    let x = -96;
    x <= -68;
    x += 7
  ) {
    box(
      "Parking Line",
      x,
      0.09,
      -35,
      0.25,
      0.02,
      24,
      0xe7e0c5
    );
  }
}

/* =========================================================
   TREES
   ========================================================= */

function buildTrees() {
  for (
    let i = 0;
    i < 70;
    i++
  ) {
    const x =
      (i * 37) % 210 - 105;

    const z =
      (i * 71) % 190 - 95;

    if (
      Math.abs(x) < 28 &&
      Math.abs(z) < 28
    ) {
      continue;
    }

    if (z > 75) {
      continue;
    }

    makeTree(x, z);
  }
}

function makeTree(x, z) {
  const group =
    new THREE.Group();

  group.position.set(
    x,
    0,
    z
  );

  world.add(group);

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.45,
        0.6,
        3,
        8
      ),
      material(0x704a2d)
    );

  trunk.position.y = 1.5;
  trunk.castShadow = true;

  group.add(trunk);

  const crown =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.3,
        10,
        8
      ),
      material(0x2f7435)
    );

  crown.position.y = 4.1;
  crown.castShadow = true;

  group.add(crown);
}

/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer() {
  player =
    new THREE.Group();

  player.position.set(
    0,
    0,
    72
  );

  scene.add(player);

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.55,
        1.2,
        6,
        12
      ),
      material(0x244f9c)
    );

  body.position.y = 1.25;
  body.castShadow = true;

  player.add(body);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        12,
        10
      ),
      material(0xd8a37b)
    );

  head.position.y = 2.35;
  head.castShadow = true;

  player.add(head);

  for (
    const side of [-0.22, 0.22]
  ) {
    const leg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.8,
          0.25
        ),
        material(0x20252a)
      );

    leg.position.set(
      side,
      0.45,
      0
    );

    leg.castShadow = true;

    player.add(leg);
  }
}

/* =========================================================
   CONTROLS
   ========================================================= */

function setupControls() {
  addEventListener(
    "keydown",
    (event) => {
      if (
        event.code === "KeyW" ||
        event.code === "ArrowUp"
      ) {
        keys.forward = true;
      }

      if (
        event.code === "KeyS" ||
        event.code === "ArrowDown"
      ) {
        keys.backward = true;
      }

      if (
        event.code === "KeyA" ||
        event.code === "ArrowLeft"
      ) {
        keys.left = true;
      }

      if (
        event.code === "KeyD" ||
        event.code === "ArrowRight"
      ) {
        keys.right = true;
      }

      if (
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ) {
        running = true;
      }

      if (
        event.code === "Space"
      ) {
        jump();
      }
    }
  );

  addEventListener(
    "keyup",
    (event) => {
      if (
        event.code === "KeyW" ||
        event.code === "ArrowUp"
      ) {
        keys.forward = false;
      }

      if (
        event.code === "KeyS" ||
        event.code === "ArrowDown"
      ) {
        keys.backward = false;
      }

      if (
        event.code === "KeyA" ||
        event.code === "ArrowLeft"
      ) {
        keys.left = false;
      }

      if (
        event.code === "KeyD" ||
        event.code === "ArrowRight"
      ) {
        keys.right = false;
      }

      if (
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ) {
        running = false;
      }
    }
  );

  const jumpButton =
    document.getElementById(
      "jumpBtn"
    );

  const runButton =
    document.getElementById(
      "runBtn"
    );

  const joystickElement =
    document.getElementById(
      "joystick"
    );

  const stickElement =
    document.getElementById(
      "stick"
    );

  const lookArea =
    document.getElementById(
      "lookArea"
    );

  jumpButton?.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      jump();
    }
  );

  runButton?.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      running = true;
    }
  );

  runButton?.addEventListener(
    "pointerup",
    () => {
      running = false;
    }
  );

  runButton?.addEventListener(
    "pointercancel",
    () => {
      running = false;
    }
  );

  joystickElement?.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();

      joystick.active = true;
      joystick.id =
        event.pointerId;

      joystickElement.setPointerCapture(
        event.pointerId
      );

      updateJoystick(
        event,
        joystickElement,
        stickElement
      );
    }
  );

  joystickElement?.addEventListener(
    "pointermove",
    (event) => {
      if (
        joystick.active &&
        event.pointerId ===
          joystick.id
      ) {
        updateJoystick(
          event,
          joystickElement,
          stickElement
        );
      }
    }
  );

  joystickElement?.addEventListener(
    "pointerup",
    resetJoystick
  );

  joystickElement?.addEventListener(
    "pointercancel",
    resetJoystick
  );

  lookArea?.addEventListener(
    "pointerdown",
    (event) => {
      look.active = true;
      look.id =
        event.pointerId;

      look.x =
        event.clientX;

      look.y =
        event.clientY;

      lookArea.setPointerCapture(
        event.pointerId
      );
    }
  );

  lookArea?.addEventListener(
    "pointermove",
    (event) => {
      if (
        !look.active ||
        event.pointerId !==
          look.id
      ) {
        return;
      }

      const dx =
        event.clientX -
        look.x;

      const dy =
        event.clientY -
        look.y;

      look.x =
        event.clientX;

      look.y =
        event.clientY;

      cameraYaw -=
        dx * 0.006;

      cameraPitch -=
        dy * 0.004;

      cameraPitch =
        THREE.MathUtils.clamp(
          cameraPitch,
          -1.0,
          0.35
        );
    }
  );

  lookArea?.addEventListener(
    "pointerup",
    () => {
      look.active = false;
    }
  );

  lookArea?.addEventListener(
    "pointercancel",
    () => {
      look.active = false;
    }
  );
}

function updateJoystick(
  event,
  joystickElement,
  stickElement
) {
  const rect =
    joystickElement.getBoundingClientRect();

  const centerX =
    rect.left +
    rect.width / 2;

  const centerY =
    rect.top +
    rect.height / 2;

  const max =
    rect.width * 0.32;

  let x =
    event.clientX -
    centerX;

  let y =
    event.clientY -
    centerY;

  const distance =
    Math.hypot(x, y);

  if (
    distance > max
  ) {
    x *=
      max / distance;

    y *=
      max / distance;
  }

  joystick.x =
    x / max;

  joystick.y =
    y / max;

  if (stickElement) {
    stickElement.style.transform =
      `translate(${x}px, ${y}px)`;
  }
}

function resetJoystick() {
  joystick.active = false;
  joystick.x = 0;
  joystick.y = 0;
  joystick.id = null;

  const stick =
    document.getElementById(
      "stick"
    );

  if (stick) {
    stick.style.transform =
      "translate(0, 0)";
  }
}

function jump() {
  if (onGround) {
    velocityY = 7.2;
    onGround = false;
  }
}

/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function blocked(
  x,
  z
) {
  const radius = 0.65;

  for (
    const collider of colliders
  ) {
    if (
      x >
        collider.x -
          collider.sx / 2 -
          radius &&
      x <
        collider.x +
          collider.sx / 2 +
          radius &&
      z >
        collider.z -
          collider.sz / 2 -
          radius &&
      z <
        collider.z +
          collider.sz / 2 +
          radius
    ) {
      return true;
    }
  }

  return (
    x < -112 ||
    x > 112 ||
    z < -112 ||
    z > 112
  );
}

function update(
  deltaTime
) {
  let inputX =
    (keys.right ? 1 : 0) -
    (keys.left ? 1 : 0) +
    joystick.x;

  let inputZ =
    (keys.backward ? 1 : 0) -
    (keys.forward ? 1 : 0) +
    joystick.y;

  const inputLength =
    Math.hypot(
      inputX,
      inputZ
    );

  if (
    inputLength > 1
  ) {
    inputX /=
      inputLength;

    inputZ /=
      inputLength;
  }

  const speed =
    running
      ? 11
      : 5.5;

  const sin =
    Math.sin(cameraYaw);

  const cos =
    Math.cos(cameraYaw);

  move.set(
    inputX * cos +
      inputZ * sin,
    0,
    -inputX * sin +
      inputZ * cos
  );

  if (
    inputLength > 0.08
  ) {
    const nextX =
      player.position.x +
      move.x *
        speed *
        deltaTime;

    const nextZ =
      player.position.z +
      move.z *
        speed *
        deltaTime;

    if (
      !blocked(
        nextX,
        player.position.z
      )
    ) {
      player.position.x =
        nextX;
    }

    if (
      !blocked(
        player.position.x,
        nextZ
      )
    ) {
      player.position.z =
        nextZ;
    }

    player.rotation.y =
      Math.atan2(
        move.x,
        move.z
      );
  }

  velocityY -=
    18 * deltaTime;

  player.position.y +=
    velocityY *
    deltaTime;

  if (
    player.position.y <= 0
  ) {
    player.position.y = 0;
    velocityY = 0;
    onGround = true;
  }

  updateCamera();
}

function updateCamera() {
  const distance = 7.5;

  const horizontalDistance =
    Math.cos(cameraPitch) *
    distance;

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 1.5,
      player.position.z
    );

  const desired =
    new THREE.Vector3(
      target.x +
        Math.sin(cameraYaw) *
          horizontalDistance,

      target.y -
        Math.sin(cameraPitch) *
          distance +
        1.2,

      target.z +
        Math.cos(cameraYaw) *
          horizontalDistance
    );

  camera.position.lerp(
    desired,
    0.12
  );

  camera.lookAt(target);
}

/* =========================================================
   LOOP
   ========================================================= */

function animate() {
  requestAnimationFrame(
    animate
  );

  const now =
    performance.now();

  const deltaTime =
    Math.min(
      (now - lastTime) / 1000,
      0.05
    );

  lastTime = now;

  update(deltaTime);

  renderer.render(
    scene,
    camera
  );
}

function hideLoading() {
  const loading =
    document.getElementById(
      "loading"
    );

  if (loading) {
    loading.classList.add(
      "hide"
    );

    setTimeout(
      () => loading.remove(),
      500
    );
  }
}

function onResize() {
  camera.aspect =
    innerWidth /
    innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
}
