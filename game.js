import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================================================
   ABSS MAP V1
   Real-project foundation:
   - Campus terrain
   - Main ABSS academic blocks
   - Main entrance
   - Roads
   - Gardens
   - Trees
   - Sports area
   - Player
   - Mobile joystick
   - Camera
   ========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9ec8e5);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera.position.set(28, 20, 32);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);


/* =========================================================
   LIGHTING
   ========================================================= */

const ambientLight = new THREE.HemisphereLight(
  0xddeeff,
  0x506040,
  2.0
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(
  0xffffff,
  3.0
);

sun.position.set(80, 120, 60);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;

scene.add(sun);


/* =========================================================
   MATERIALS
   ========================================================= */

const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x4f7f43,
  roughness: 1
});

const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  roughness: 0.9
});

const buildingWall = new THREE.MeshStandardMaterial({
  color: 0xc8b39b,
  roughness: 0.85
});

const redMaterial = new THREE.MeshStandardMaterial({
  color: 0x9b3c2f,
  roughness: 0.8
});

const roofMaterial = new THREE.MeshStandardMaterial({
  color: 0x6b3028,
  roughness: 0.85
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x76a9bd,
  transparent: true,
  opacity: 0.45,
  roughness: 0.15,
  metalness: 0.1
});

const whiteMaterial = new THREE.MeshStandardMaterial({
  color: 0xe7e3da,
  roughness: 0.8
});

const treeMaterial = new THREE.MeshStandardMaterial({
  color: 0x285b2b,
  roughness: 1
});

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x68452d,
  roughness: 1
});


/* =========================================================
   CAMPUS GROUND
   ========================================================= */

const campus = new THREE.Mesh(
  new THREE.BoxGeometry(230, 2, 170),
  grassMaterial
);

campus.position.y = -1;

campus.receiveShadow = true;

scene.add(campus);


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function createBox(
  width,
  height,
  depth,
  material,
  x,
  y,
  z
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}


function createRoad(width, depth, x, z) {

  return createBox(
    width,
    0.15,
    depth,
    roadMaterial,
    x,
    0.08,
    z
  );
}


/* =========================================================
   INTERNAL CAMPUS ROADS
   ========================================================= */

createRoad(220, 10, 0, 58);
createRoad(220, 10, 0, -58);

createRoad(10, 125, -70, 0);
createRoad(10, 125, 70, 0);

createRoad(120, 8, 0, 0);


/* =========================================================
   MAIN ABSS ACADEMIC BUILDING
   THREE BLOCK CONCEPT
   ========================================================= */

function createAcademicBlock(
  name,
  x,
  z,
  width,
  depth,
  height
) {

  const group = new THREE.Group();

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    buildingWall
  );

  main.position.y = height / 2;

  main.castShadow = true;
  main.receiveShadow = true;

  group.add(main);


  /* Red front section */

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(width, height * 0.72, 1.2),
    redMaterial
  );

  front.position.set(
    0,
    height * 0.38,
    depth / 2 + 0.65
  );

  front.castShadow = true;

  group.add(front);


  /* Roof */

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(
      width + 1.5,
      1,
      depth + 1.5
    ),
    roofMaterial
  );

  roof.position.y = height + 0.5;

  roof.castShadow = true;

  group.add(roof);


  /* Windows */

  const windowRows = 4;
  const windowsPerRow = Math.max(3, Math.floor(width / 5));

  for (let row = 0; row < windowRows; row++) {

    for (let col = 0; col < windowsPerRow; col++) {

      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 2.1, 0.12),
        glassMaterial
      );

      const spacing =
        width / (windowsPerRow + 1);

      windowMesh.position.set(
        -width / 2 + spacing * (col + 1),
        3 + row * 4,
        depth / 2 + 1.3
      );

      group.add(windowMesh);
    }
  }


  group.position.set(x, 0, z);

  scene.add(group);

  return group;
}


/*
   ABSS official site identifies the three academic blocks
   as Mahatma Gandhi, Madan Mohan Malviya and Vishvesaraya.
*/

const gandhiBlock = createAcademicBlock(
  "Mahatma Gandhi Block",
  -38,
  -12,
  42,
  24,
  20
);

const malviyaBlock = createAcademicBlock(
  "Madan Mohan Malviya Block",
  8,
  -12,
  42,
  24,
  20
);

const vishvesarayaBlock = createAcademicBlock(
  "Vishvesaraya Block",
  54,
  -12,
  42,
  24,
  20
);


/* =========================================================
   MAIN ENTRANCE / PORTICO
   ========================================================= */

const entranceBase = createBox(
  24,
  0.6,
  12,
  whiteMaterial,
  8,
  0.3,
  4
);

const entranceRoof = createBox(
  25,
  1,
  10,
  redMaterial,
  8,
  10,
  5
);

for (let i = -1; i <= 1; i++) {

  createBox(
    1.2,
    10,
    1.2,
    whiteMaterial,
    8 + i * 10,
    5,
    9
  );
}


/* Glass entrance */

createBox(
  15,
  7,
  0.35,
  glassMaterial,
  8,
  3.5,
  9.7
);


/* =========================================================
   GARDENS
   ========================================================= */

function createGarden(
  width,
  depth,
  x,
  z
) {

  const garden = createBox(
    width,
    0.25,
    depth,
    grassMaterial,
    x,
    0.15,
    z
  );

  return garden;
}

createGarden(42, 35, -80, 0);
createGarden(35, 30, 80, 10);
createGarden(55, 30, 0, 38);


/* =========================================================
   TREE
   ========================================================= */

function createTree(x, z, scale = 1) {

  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.5 * scale,
      0.75 * scale,
      4 * scale,
      8
    ),
    trunkMaterial
  );

  trunk.position.y = 2 * scale;

  trunk.castShadow = true;

  group.add(trunk);


  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(
      3.2 * scale,
      12,
      10
    ),
    treeMaterial
  );

  leaves.position.y = 6 * scale;

  leaves.castShadow = true;

  group.add(leaves);


  group.position.set(x, 0, z);

  scene.add(group);
}


/* Campus greenery */

const treePositions = [
  [-95, -45],
  [-85, -25],
  [-92, 20],
  [-82, 45],
  [-65, 45],
  [-45, 48],
  [-20, 48],
  [10, 48],
  [35, 48],
  [65, 45],
  [85, 35],
  [95, 10],
  [90, -25],
  [78, -45],
  [-75, 5],
  [-60, 20]
];

treePositions.forEach((p, i) => {
  createTree(
    p[0],
    p[1],
    0.8 + (i % 3) * 0.15
  );
});


/* =========================================================
   SPORTS AREA
   ========================================================= */

const sportsBase = createBox(
  42,
  0.2,
  30,
  roadMaterial,
  -70,
  0.15,
  30
);

const courtLineMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

function createCourtLine(
  width,
  depth,
  x,
  z
) {

  const line = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.05,
      depth
    ),
    courtLineMaterial
  );

  line.position.set(x, 0.3, z);

  scene.add(line);
}

createCourtLine(38, 0.25, -70, 15);
createCourtLine(38, 0.25, -70, 45);

createCourtLine(0.25, 28, -89, 30);
createCourtLine(0.25, 28, -51, 30);


/* =========================================================
   SIMPLE PLAYER
   ========================================================= */

const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.7, 1.5, 6, 12),
  new THREE.MeshStandardMaterial({
    color: 0xffffff
  })
);

body.position.y = 1.5;
body.castShadow = true;

player.add(body);


const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 16, 12),
  new THREE.MeshStandardMaterial({
    color: 0xc88d6b
  })
);

head.position.y = 3.1;
head.castShadow = true;

player.add(head);


player.position.set(
  8,
  0,
  25
);

scene.add(player);


/* =========================================================
   CAMERA
   ========================================================= */

const cameraTarget = new THREE.Vector3();

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = false;

controls.minDistance = 5;
controls.maxDistance = 60;

controls.maxPolarAngle = Math.PI * 0.48;

controls.target.copy(player.position);


/* =========================================================
   MOVEMENT
   ========================================================= */

const movement = {
  x: 0,
  y: 0
};

let running = false;
let velocityY = 0;

const WALK_SPEED = 0.09;
const RUN_SPEED = 0.17;
const GRAVITY = -0.012;

let grounded = true;


/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};

window.addEventListener(
  "keydown",
  (event) => {
    keys[event.key.toLowerCase()] = true;

    if (event.key === " ") {
      jump();
    }

    if (event.key.toLowerCase() === "shift") {
      running = true;
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.key.toLowerCase()] = false;

    if (event.key.toLowerCase() === "shift") {
      running = false;
    }
  }
);


/* =========================================================
   JUMP
   ========================================================= */

function jump() {

  if (!grounded) return;

  velocityY = 0.22;
  grounded = false;
}


/* =========================================================
   MOBILE JOYSTICK
   ========================================================= */

const joystick =
  document.getElementById("joystick");

const knob =
  document.getElementById("joystickKnob");

let joystickActive = false;

const joystickRadius = 45;

function updateJoystick(clientX, clientY) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const distance =
    Math.sqrt(dx * dx + dy * dy);

  if (distance > joystickRadius) {

    dx =
      (dx / distance) *
      joystickRadius;

    dy =
      (dy / distance) *
      joystickRadius;
  }

  knob.style.transform =
    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  movement.x = dx / joystickRadius;
  movement.y = dy / joystickRadius;
}

function resetJoystick() {

  joystickActive = false;

  movement.x = 0;
  movement.y = 0;

  knob.style.transform =
    "translate(-50%, -50%)";
}


joystick.addEventListener(
  "pointerdown",
  (event) => {

    joystickActive = true;

    joystick.setPointerCapture(
      event.pointerId
    );

    updateJoystick(
      event.clientX,
      event.clientY
    );
  }
);

joystick.addEventListener(
  "pointermove",
  (event) => {

    if (!joystickActive) return;

    updateJoystick(
      event.clientX,
      event.clientY
    );
  }
);

joystick.addEventListener(
  "pointerup",
  resetJoystick
);

joystick.addEventListener(
  "pointercancel",
  resetJoystick
);


/* =========================================================
   BUTTONS
   ========================================================= */

document
  .getElementById("jumpButton")
  .addEventListener(
    "pointerdown",
    jump
  );

document
  .getElementById("runButton")
  .addEventListener(
    "pointerdown",
    () => {
      running = true;
    }
  );

document
  .getElementById("runButton")
  .addEventListener(
    "pointerup",
    () => {
      running = false;
    }
  );


/* =========================================================
   GAME LOOP
   ========================================================= */

const clock = new THREE.Clock();

function updatePlayer(delta) {

  let x = movement.x;
  let z = movement.y;

  /* Keyboard */

  if (keys["w"] || keys["arrowup"]) {
    z = -1;
  }

  if (keys["s"] || keys["arrowdown"]) {
    z = 1;
  }

  if (keys["a"] || keys["arrowleft"]) {
    x = -1;
  }

  if (keys["d"] || keys["arrowright"]) {
    x = 1;
  }


  const length =
    Math.sqrt(x * x + z * z);

  if (length > 0) {

    x /= length;
    z /= length;

    const speed =
      running
        ? RUN_SPEED
        : WALK_SPEED;

    player.position.x +=
      x * speed * delta * 60;

    player.position.z +=
      z * speed * delta * 60;


    /*
      Character faces movement direction.
    */

    const angle =
      Math.atan2(x, z);

    player.rotation.y = angle;
  }


  /* Gravity */

  velocityY +=
    GRAVITY * delta * 60;

  player.position.y +=
    velocityY * delta * 60;


  if (player.position.y <= 0) {

    player.position.y = 0;

    velocityY = 0;

    grounded = true;
  }


  /* Campus boundary */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -108,
      108
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -78,
      78
    );


  /* Camera follows */

  cameraTarget.lerp(
    new THREE.Vector3(
      player.position.x,
      player.position.y + 1.5,
      player.position.z
    ),
    0.12
  );

  controls.target.copy(
    cameraTarget
  );
}


/* =========================================================
   RESIZE
   ========================================================= */

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


/* =========================================================
   LOADING
   ========================================================= */

let progress = 0;

const progressElement =
  document.getElementById(
    "loadingProgress"
  );

const loading =
  document.getElementById("loading");

const loadingTimer =
  setInterval(() => {

    progress += 10;

    progressElement.style.width =
      Math.min(progress, 100) + "%";

    if (progress >= 100) {

      clearInterval(loadingTimer);

      setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {
          loading.remove();
        }, 600);

      }, 300);
    }

  }, 80);


/* =========================================================
   RENDER
   ========================================================= */

function animate() {

  requestAnimationFrame(animate);

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updatePlayer(delta);

  controls.update();

  renderer.render(
    scene,
    camera
  );
}

animate();
