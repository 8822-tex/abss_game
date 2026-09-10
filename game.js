import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================
   ABSS MAP
   ========================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc5e8);


/* CAMERA */

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(18, 12, 22);


/* RENDERER */

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);


/* =========================================
   LIGHT
   ========================================= */

const skyLight = new THREE.HemisphereLight(
  0xffffff,
  0x526644,
  2
);

scene.add(skyLight);


const sun = new THREE.DirectionalLight(
  0xffffff,
  3
);

sun.position.set(80, 100, 60);

sun.castShadow = true;

scene.add(sun);


/* =========================================
   MATERIALS
   ========================================= */

const grass = new THREE.MeshStandardMaterial({
  color: 0x4f813f
});

const road = new THREE.MeshStandardMaterial({
  color: 0x555555
});

const wall = new THREE.MeshStandardMaterial({
  color: 0xd1c1ad
});

const red = new THREE.MeshStandardMaterial({
  color: 0x963b30
});

const roof = new THREE.MeshStandardMaterial({
  color: 0x642e27
});

const glass = new THREE.MeshStandardMaterial({
  color: 0x5fa0b8,
  transparent: true,
  opacity: 0.55
});

const white = new THREE.MeshStandardMaterial({
  color: 0xe9e5dd
});

const treeGreen = new THREE.MeshStandardMaterial({
  color: 0x28632e
});

const trunk = new THREE.MeshStandardMaterial({
  color: 0x65442c
});


/* =========================================
   HELPER
   ========================================= */

function box(
  width,
  height,
  depth,
  material,
  x,
  y,
  z
) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    material
  );

  object.position.set(x, y, z);

  object.castShadow = true;
  object.receiveShadow = true;

  scene.add(object);

  return object;
}


/* =========================================
   CAMPUS GROUND
   ========================================= */

box(
  220,
  2,
  170,
  grass,
  0,
  -1,
  0
);


/* =========================================
   CAMPUS ROADS
   ========================================= */

box(
  210,
  0.15,
  10,
  road,
  0,
  0.05,
  55
);

box(
  210,
  0.15,
  10,
  road,
  0,
  0.05,
  -55
);

box(
  10,
  0.15,
  110,
  road,
  -75,
  0.05,
  0
);

box(
  10,
  0.15,
  110,
  road,
  75,
  0.05,
  0
);

box(
  120,
  0.15,
  8,
  road,
  0,
  0.06,
  5
);


/* =========================================
   ACADEMIC BLOCK
   ========================================= */

function createBlock(
  x,
  z,
  width,
  depth
) {

  const height = 20;

  /* Main building */

  box(
    width,
    height,
    depth,
    wall,
    x,
    height / 2,
    z
  );


  /* Red front */

  box(
    width,
    14,
    1,
    red,
    x,
    7,
    z + depth / 2 + 0.55
  );


  /* Roof */

  box(
    width + 2,
    1,
    depth + 2,
    roof,
    x,
    height + 0.5,
    z
  );


  /* Windows */

  const rows = 4;
  const columns = Math.max(
    3,
    Math.floor(width / 5)
  );

  for (let r = 0; r < rows; r++) {

    for (let c = 0; c < columns; c++) {

      const gap =
        width / (columns + 1);

      box(
        2.2,
        2.1,
        0.15,
        glass,
        x - width / 2 +
          gap * (c + 1),
        3 + r * 4,
        z + depth / 2 + 1.1
      );
    }
  }
}


/* Three ABSS academic blocks */

createBlock(
  -42,
  -18,
  38,
  24
);

createBlock(
  0,
  -18,
  38,
  24
);

createBlock(
  42,
  -18,
  38,
  24
);


/* =========================================
   MAIN ENTRANCE
   ========================================= */

box(
  25,
  0.6,
  12,
  white,
  0,
  0.3,
  2
);


/* Entrance roof */

box(
  27,
  1,
  11,
  red,
  0,
  10,
  4
);


/* Entrance pillars */

for (const x of [-11, 0, 11]) {

  box(
    1.2,
    10,
    1.2,
    white,
    x,
    5,
    8
  );
}


/* Glass main entrance */

box(
  18,
  7,
  0.3,
  glass,
  0,
  3.5,
  8.7
);


/* =========================================
   GARDENS
   ========================================= */

box(
  45,
  0.2,
  32,
  grass,
  -85,
  0.1,
  5
);

box(
  40,
  0.2,
  32,
  grass,
  85,
  0.1,
  5
);


/* =========================================
   TREES
   ========================================= */

function createTree(x, z, size) {

  const tree = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.5 * size,
      0.7 * size,
      4 * size,
      8
    ),
    trunk
  );

  stem.position.y = 2 * size;

  stem.castShadow = true;

  tree.add(stem);


  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(
      3 * size,
      12,
      10
    ),
    treeGreen
  );

  leaves.position.y = 6 * size;

  leaves.castShadow = true;

  tree.add(leaves);


  tree.position.set(
    x,
    0,
    z
  );

  scene.add(tree);
}


const trees = [
  [-100, -35],
  [-92, -15],
  [-98, 15],
  [-88, 35],
  [-70, 40],
  [-52, 43],
  [-25, 43],
  [25, 43],
  [52, 43],
  [70, 40],
  [90, 35],
  [98, 10],
  [95, -20],
  [82, -38],
  [-75, 5]
];

trees.forEach(
  (position, index) => {

    createTree(
      position[0],
      position[1],
      0.8 + (index % 3) * 0.15
    );

  }
);


/* =========================================
   SPORTS AREA
   ========================================= */

box(
  42,
  0.2,
  30,
  road,
  -78,
  0.15,
  38
);


/* =========================================
   PLAYER
   ========================================= */

const player = new THREE.Group();


/* Body */

const playerBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(
    0.65,
    1.5,
    6,
    12
  ),
  new THREE.MeshStandardMaterial({
    color: 0xffffff
  })
);

playerBody.position.y = 1.5;

playerBody.castShadow = true;

player.add(playerBody);


/* Head */

const playerHead = new THREE.Mesh(
  new THREE.SphereGeometry(
    0.55,
    16,
    12
  ),
  new THREE.MeshStandardMaterial({
    color: 0xc88d6b
  })
);

playerHead.position.y = 3.05;

playerHead.castShadow = true;

player.add(playerHead);


/* Player spawn */

player.position.set(
  0,
  0,
  28
);

scene.add(player);


/* =========================================
   MOBILE JOYSTICK
   ========================================= */

const joystick =
  document.getElementById("joystick");

const stick =
  document.getElementById("stick");

let joystickX = 0;
let joystickY = 0;
let active = false;

const maxDistance = 42;


function moveStick(x, y) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;

  let dx = x - centerX;
  let dy = y - centerY;

  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  if (distance > maxDistance) {

    dx =
      dx / distance *
      maxDistance;

    dy =
      dy / distance *
      maxDistance;
  }

  stick.style.transform =
    `translate(
      calc(-50% + ${dx}px),
      calc(-50% + ${dy}px)
    )`;

  joystickX =
    dx / maxDistance;

  joystickY =
    dy / maxDistance;
}


function resetStick() {

  active = false;

  joystickX = 0;
  joystickY = 0;

  stick.style.transform =
    "translate(-50%, -50%)";
}


joystick.addEventListener(
  "pointerdown",
  event => {

    active = true;

    joystick.setPointerCapture(
      event.pointerId
    );

    moveStick(
      event.clientX,
      event.clientY
    );
  }
);


joystick.addEventListener(
  "pointermove",
  event => {

    if (!active) return;

    moveStick(
      event.clientX,
      event.clientY
    );
  }
);


joystick.addEventListener(
  "pointerup",
  resetStick
);

joystick.addEventListener(
  "pointercancel",
  resetStick
);


/* =========================================
   RUN
   ========================================= */

let running = false;

const runButton =
  document.getElementById("run");

runButton.addEventListener(
  "pointerdown",
  () => {
    running = true;
  }
);

runButton.addEventListener(
  "pointerup",
  () => {
    running = false;
  }
);

runButton.addEventListener(
  "pointercancel",
  () => {
    running = false;
  }
);


/* =========================================
   JUMP
   ========================================= */

let verticalVelocity = 0;
let onGround = true;

function jump() {

  if (!onGround) return;

  verticalVelocity = 0.22;

  onGround = false;
}


document
  .getElementById("jump")
  .addEventListener(
    "pointerdown",
    jump
  );


/* =========================================
   KEYBOARD
   ========================================= */

const keys = {};

window.addEventListener(
  "keydown",
  event => {

    keys[
      event.key.toLowerCase()
    ] = true;

    if (event.key === " ") {
      jump();
    }

    if (
      event.key.toLowerCase() ===
      "shift"
    ) {
      running = true;
    }
  }
);


window.addEventListener(
  "keyup",
  event => {

    keys[
      event.key.toLowerCase()
    ] = false;

    if (
      event.key.toLowerCase() ===
      "shift"
    ) {
      running = false;
    }
  }
);


/* =========================================
   GAME UPDATE
   ========================================= */

const clock =
  new THREE.Clock();

function update() {

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  let x = joystickX;
  let z = joystickY;


  /* Keyboard */

  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    z = -1;
  }

  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    z = 1;
  }

  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    x = -1;
  }

  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    x = 1;
  }


  /* Movement */

  if (
    Math.abs(x) > 0.01 ||
    Math.abs(z) > 0.01
  ) {

    const length =
      Math.sqrt(
        x * x +
        z * z
      );

    x /= length;
    z /= length;


    const speed =
      running
        ? 0.17
        : 0.09;


    player.position.x +=
      x * speed * delta * 60;

    player.position.z +=
      z * speed * delta * 60;


    player.rotation.y =
      Math.atan2(x, z);
  }


  /* Gravity */

  verticalVelocity -=
    0.012 * delta * 60;

  player.position.y +=
    verticalVelocity *
    delta *
    60;


  if (
    player.position.y <= 0
  ) {

    player.position.y = 0;

    verticalVelocity = 0;

    onGround = true;
  }


  /* Campus boundary */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -105,
      105
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -75,
      75
    );


  /* Camera follow */

  const targetX =
    player.position.x;

  const targetY =
    player.position.y + 2;

  const targetZ =
    player.position.z;


  camera.position.x +=
    (
      targetX + 15 -
      camera.position.x
    ) * 0.08;

  camera.position.y +=
    (
      targetY + 9 -
      camera.position.y
    ) * 0.08;

  camera.position.z +=
    (
      targetZ + 18 -
      camera.position.z
    ) * 0.08;


  camera.lookAt(
    targetX,
    targetY,
    targetZ
  );


  renderer.render(
    scene,
    camera
  );

  requestAnimationFrame(update);
}


/* =========================================
   RESIZE
   ========================================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);


/* =========================================
   START
   ========================================= */


update();
