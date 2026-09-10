import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================================
   ABSS MAP
   Fast procedural 3D campus
   ========================================================= */

let scene;
let camera;
let renderer;
let player;

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

/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

init();
animate();

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */

function init() {

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87b9d8);

  scene.fog = new THREE.Fog(0x87b9d8, 180, 500);

  /* CAMERA */

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    700
  );

  camera.position.set(0, 7, 14);

  /* RENDERER */

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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  /* LIGHT */

  const ambient = new THREE.HemisphereLight(
    0xddeeff,
    0x506040,
    2.0
  );

  scene.add(ambient);

  const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
  );

  sun.position.set(100, 160, 80);

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
  createRoads();
  createMainCollege();
  createHostels();
  createGardens();
  createSportsArea();
  createEntrance();
  createTrees();
  createPlayer();

  setupKeyboard();
  setupJoystick();
  setupButtons();

  window.addEventListener(
    "resize",
    onResize
  );

  /* Remove loading screen */

  setTimeout(() => {

    const loading =
      document.getElementById("loading");

    if (loading) {
      loading.classList.add("hide");

      setTimeout(() => {
        loading.remove();
      }, 400);
    }

  }, 500);
}

/* ---------------------------------------------------------
   MATERIAL HELPERS
--------------------------------------------------------- */

function material(color) {

  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.82,
    metalness: 0.02
  });

}

/* ---------------------------------------------------------
   GROUND
--------------------------------------------------------- */

function createGround() {

  const geo = new THREE.PlaneGeometry(
    500,
    500
  );

  const mat = material(0x47783f);

  const ground =
    new THREE.Mesh(geo, mat);

  ground.rotation.x = -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);

}

/* ---------------------------------------------------------
   ROAD
--------------------------------------------------------- */

function road(
  x,
  z,
  width,
  length,
  rotation = 0
) {

  const geo =
    new THREE.BoxGeometry(
      width,
      0.12,
      length
    );

  const mat =
    material(0x55585b);

  const obj =
    new THREE.Mesh(geo, mat);

  obj.position.set(x, 0.06, z);

  obj.rotation.y = rotation;

  obj.receiveShadow = true;

  scene.add(obj);

  return obj;
}

function createRoads() {

  road(0, 0, 18, 330);

  road(0, -55, 330, 18);

  road(0, 75, 330, 15);

  road(-100, 10, 14, 230);

  road(100, 10, 14, 230);

}

/* ---------------------------------------------------------
   BUILDING
--------------------------------------------------------- */

function building(
  name,
  x,
  z,
  width,
  depth,
  floors,
  color
) {

  const height =
    floors * 4.2;

  const geo =
    new THREE.BoxGeometry(
      width,
      height,
      depth
    );

  const obj =
    new THREE.Mesh(
      geo,
      material(color)
    );

  obj.position.set(
    x,
    height / 2,
    z
  );

  obj.castShadow = true;
  obj.receiveShadow = true;

  scene.add(obj);

  /* WINDOWS */

  const windowMat =
    new THREE.MeshStandardMaterial({
      color: 0x7dc5d8,
      roughness: 0.25,
      metalness: 0.05
    });

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {

    const y =
      2.0 + floor * 4.2;

    const count =
      Math.max(
        3,
        Math.floor(width / 4)
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const wx =
        x -
        width / 2 +
        2 +
        i * (
          (width - 4) /
          Math.max(1, count - 1)
        );

      const wgeo =
        new THREE.BoxGeometry(
          1.4,
          1.5,
          0.08
        );

      const win =
        new THREE.Mesh(
          wgeo,
          windowMat
        );

      win.position.set(
        wx,
        y,
        z - depth / 2 - 0.05
      );

      scene.add(win);

    }

  }

  /* ROOF */

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.5,
        0.35,
        depth + 0.5
      ),
      material(0x8b2626)
    );

  roof.position.set(
    x,
    height + 0.15,
    z
  );

  roof.castShadow = true;

  scene.add(roof);

  /* SIGN */

  const sign =
    createSign(name);

  sign.position.set(
    x,
    height - 1.0,
    z - depth / 2 - 0.12
  );

  scene.add(sign);

  return obj;
}

/* ---------------------------------------------------------
   SIGN
--------------------------------------------------------- */

function createSign(text) {

  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 96;

  const ctx =
    canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#9b1c1c";

  ctx.font =
    "bold 38px Arial";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    text,
    256,
    48
  );

  const texture =
    new THREE.CanvasTexture(canvas);

  const mat =
    new THREE.MeshBasicMaterial({
      map: texture
    });

  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        6,
        1.15
      ),
      mat
    );

  return mesh;
}

/* ---------------------------------------------------------
   MAIN COLLEGE
--------------------------------------------------------- */

function createMainCollege() {

  building(
    "MAHATMA GANDHI BLOCK",
    -55,
    -48,
    48,
    30,
    4,
    0xb44a3b
  );

  building(
    "MADAN MOHAN MALVIYA BLOCK",
    0,
    -65,
    52,
    32,
    4,
    0xa94438
  );

  building(
    "VISHVESVARAYA BLOCK",
    58,
    -48,
    48,
    30,
    4,
    0xb64b3e
  );

}

/* ---------------------------------------------------------
   HOSTELS
--------------------------------------------------------- */

function createHostels() {

  building(
    "CSA BOYS HOSTEL",
    -82,
    58,
    42,
    28,
    4,
    0xa94438
  );

  building(
    "GIRLS HOSTEL",
    82,
    58,
    42,
    28,
    4,
    0xa94438
  );

}

/* ---------------------------------------------------------
   ENTRANCE
--------------------------------------------------------- */

function createEntrance() {

  const pillarMat =
    material(0xe9e9e9);

  const redMat =
    material(0x9e2929);

  /* PILLARS */

  for (
    const x of [-10, 10]
  ) {

    const pillar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.2,
          8,
          2.2
        ),
        pillarMat
      );

    pillar.position.set(
      x,
      4,
      -12
    );

    pillar.castShadow = true;

    scene.add(pillar);

  }

  /* ROOF */

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        24,
        1.2,
        7
      ),
      redMat
    );

  roof.position.set(
    0,
    8.5,
    -12
  );

  roof.castShadow = true;

  scene.add(roof);

  /* GLASS ENTRANCE */

  const glass =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        14,
        6,
        0.25
      ),
      new THREE.MeshStandardMaterial({
        color: 0x9fd8e8,
        transparent: true,
        opacity: 0.55,
        roughness: 0.15
      })
    );

  glass.position.set(
    0,
    3.1,
    -15.2
  );

  scene.add(glass);

  const sign =
    createSign("ABSS");

  sign.scale.set(
    0.8,
    0.8,
    0.8
  );

  sign.position.set(
    0,
    5,
    -15.4
  );

  scene.add(sign);

}

/* ---------------------------------------------------------
   GARDENS
--------------------------------------------------------- */

function createGardens() {

  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const x =
      -140 +
      Math.random() * 280;

    const z =
      -130 +
      Math.random() * 260;

    /* avoid central roads */

    if (
      Math.abs(x) < 13 ||
      Math.abs(z + 55) < 12 ||
      Math.abs(z - 75) < 10
    ) {
      continue;
    }

    createTree(
      x,
      z,
      0.8 +
      Math.random() * 0.7
    );

  }

  /* HEDGES */

  for (
    let i = -50;
    i <= 50;
    i += 5
  ) {

    createBush(
      i,
      -22
    );

  }

}

/* ---------------------------------------------------------
   TREE
--------------------------------------------------------- */

function createTree(
  x,
  z,
  scale
) {

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.35 * scale,
        0.5 * scale,
        3.0 * scale,
        8
      ),
      material(0x684329)
    );

  trunk.position.set(
    x,
    1.5 * scale,
    z
  );

  trunk.castShadow = true;

  scene.add(trunk);

  const crown =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.0 * scale,
        10,
        8
      ),
      material(0x286b32)
    );

  crown.position.set(
    x,
    4.0 * scale,
    z
  );

  crown.castShadow = true;

  scene.add(crown);

}

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
      material(0x357238)
    );

  bush.position.set(
    x,
    1,
    z
  );

  bush.scale.y = 0.7;

  scene.add(bush);

}

/* ---------------------------------------------------------
   SPORTS
--------------------------------------------------------- */

function createSportsArea() {

  const court =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        48,
        0.15,
        28
      ),
      material(0x2d6f9d)
    );

  court.position.set(
    55,
    0.08,
    105
  );

  scene.add(court);

  /* court lines */

  const lineMat =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

  const line =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.18,
        0.05,
        27
      ),
      lineMat
    );

  line.position.set(
    55,
    0.18,
    105
  );

  scene.add(line);

  const sportSign =
    createSign("SPORTS GROUND");

  sportSign.scale.set(
    0.8,
    0.8,
    0.8
  );

  sportSign.position.set(
    55,
    2,
    90
  );

  scene.add(sportSign);

}

/* ---------------------------------------------------------
   EXTRA TREES
--------------------------------------------------------- */

function createTrees() {

  const positions = [
    [-120, -100],
    [-105, -90],
    [-90, -105],
    [95, -100],
    [115, -85],
    [125, -110],
    [-125, 110],
    [-105, 115],
    [105, 115],
    [125, 105]
  ];

  for (
    const p of positions
  ) {

    createTree(
      p[0],
      p[1],
      1.4
    );

  }

}

/* ---------------------------------------------------------
   PLAYER
--------------------------------------------------------- */

function createPlayer() {

  player =
    new THREE.Group();

  /* BODY */

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.55,
        1.4,
        4,
        8
      ),
      material(0xeeeeee)
    );

  body.position.y = 1.5;

  body.castShadow = true;

  player.add(body);

  /* HEAD */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.42,
        12,
        10
      ),
      material(0xd89b72)
    );

  head.position.y = 2.65;

  head.castShadow = true;

  player.add(head);

  /* ABSSIT SHIRT */

  const shirt =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.0,
        0.85,
        0.55
      ),
      material(0xffffff)
    );

  shirt.position.y = 1.7;

  shirt.castShadow = true;

  player.add(shirt);

  /* LEGS */

  const legMat =
    material(0x20252b);

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
    20
  );

  scene.add(player);

}

/* ---------------------------------------------------------
   KEYBOARD
--------------------------------------------------------- */

function setupKeyboard() {

  window.addEventListener(
    "keydown",
    event => {

      switch (
        event.code
      ) {

        case "KeyW":
        case "ArrowUp":
          keys.forward = true;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.backward = true;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.left = true;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.right = true;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          running = true;
          break;

        case "Space":
          jump();
          break;

      }

    }
  );

  window.addEventListener(
    "keyup",
    event => {

      switch (
        event.code
      ) {

        case "KeyW":
        case "ArrowUp":
          keys.forward = false;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.backward = false;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.left = false;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.right = false;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          running = false;
          break;

      }

    }
  );

}

/* ---------------------------------------------------------
   JOYSTICK
--------------------------------------------------------- */

function setupJoystick() {

  const base =
    document.getElementById(
      "joystick"
    );

  const stick =
    document.getElementById(
      "stick"
    );

  if (!base || !stick) return;

  function moveStick(
    clientX,
    clientY
  ) {

    const rect =
      base.getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    let dx =
      clientX - centerX;

    let dy =
      clientY - centerY;

    const max =
      rect.width / 2 - 24;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (distance > max) {

      dx =
        dx / distance * max;

      dy =
        dy / distance * max;

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
      "translate(0px, 0px)";

  }

  base.addEventListener(
    "pointerdown",
    event => {

      joystick.active = true;

      base.setPointerCapture(
        event.pointerId
      );

      moveStick(
        event.clientX,
        event.clientY
      );

    }
  );

  base.addEventListener(
    "pointermove",
    event => {

      if (!joystick.active)
        return;

      moveStick(
        event.clientX,
        event.clientY
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

/* ---------------------------------------------------------
   BUTTONS
--------------------------------------------------------- */

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
      event => {

        event.preventDefault();

        jump();

      }
    );

  }

  if (runBtn) {

    runBtn.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

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

/* ---------------------------------------------------------
   JUMP
--------------------------------------------------------- */

function jump() {

  if (!onGround)
    return;

  velocityY = 7.5;

  onGround = false;

}

/* ---------------------------------------------------------
   PLAYER MOVEMENT
--------------------------------------------------------- */

function updatePlayer(
  delta
) {

  if (!player)
    return;

  let moveX = 0;
  let moveZ = 0;

  if (keys.left)
    moveX -= 1;

  if (keys.right)
    moveX += 1;

  if (keys.forward)
    moveZ -= 1;

  if (keys.backward)
    moveZ += 1;

  /* JOYSTICK */

  if (
    Math.abs(joystick.x) > 0.08 ||
    Math.abs(joystick.y) > 0.08
  ) {

    moveX = joystick.x;
    moveZ = joystick.y;

  }

  const length =
    Math.sqrt(
      moveX * moveX +
      moveZ * moveZ
    );

  if (length > 1) {

    moveX /= length;
    moveZ /= length;

  }

  const speed =
    running ? 13 : 6.5;

  player.position.x +=
    moveX * speed * delta;

  player.position.z +=
    moveZ * speed * delta;

  /* WORLD BOUNDARY */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -150,
      150
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -145,
      145
    );

  /* FACE MOVEMENT */

  if (
    Math.abs(moveX) > 0.01 ||
    Math.abs(moveZ) > 0.01
  ) {

    const target =
      Math.atan2(
        moveX,
        moveZ
      );

    player.rotation.y =
      THREE.MathUtils.lerp(
        player.rotation.y,
        target,
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

/* ---------------------------------------------------------
   CAMERA
--------------------------------------------------------- */

function updateCamera(
  delta
) {

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

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 1.7,
      player.position.z
    );

  camera.lookAt(target);

}

/* ---------------------------------------------------------
   ANIMATION
--------------------------------------------------------- */

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

/* ---------------------------------------------------------
   RESIZE
--------------------------------------------------------- */

function onResize() {

  if (!camera || !renderer)
    return;

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
