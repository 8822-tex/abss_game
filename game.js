"use strict";

/* =========================================================
   ABSS MAP
   ABSS Institute of Technology - Meerut
   ========================================================= */

let scene;
let camera;
let renderer;
let player;

let leftLeg;
let rightLeg;

let walkCycle = 0;

let cameraYaw = 0;
let cameraPitch = 0;

let running = false;
let jumping = false;
let verticalVelocity = 0;

let joystickX = 0;
let joystickY = 0;

let jumpRequested = false;

const keys = {};

const clock = new THREE.Clock();

const cameraTarget = new THREE.Vector3();

const gateLeft = [];
const gateRight = [];


/* =========================================================
   MATERIAL
   ========================================================= */

function mat(color){

  return new THREE.MeshStandardMaterial({
    color:color,
    roughness:0.72,
    metalness:0
  });

}


/* =========================================================
   BASIC BOX
   ========================================================= */

function makeBox(
  width,
  height,
  depth,
  color,
  x,
  y,
  z
){

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    mat(color)
  );

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;

}


/* =========================================================
   CYLINDER
   ========================================================= */

function makeCylinder(
  radius,
  height,
  color,
  x,
  y,
  z
){

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      12
    ),
    mat(color)
  );

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;

}


/* =========================================================
   WINDOW
   ========================================================= */

function makeWindow(
  x,
  y,
  z,
  width,
  height,
  rotationY = 0
){

  const frame =
    new THREE.MeshStandardMaterial({
      color:0xf0eee7,
      roughness:0.6
    });


  const glass =
    new THREE.MeshStandardMaterial({
      color:0x6faec8,
      roughness:0.18,
      metalness:0.05
    });


  const group =
    new THREE.Group();


  const glassMesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.12
      ),
      glass
    );


  group.add(glassMesh);


  const frameTop =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.22,
        0.12,
        0.16
      ),
      frame
    );

  frameTop.position.y =
    height / 2;


  const frameBottom =
    frameTop.clone();

  frameBottom.position.y =
    -height / 2;


  const frameLeft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        height,
        0.16
      ),
      frame
    );

  frameLeft.position.x =
    -width / 2;


  const frameRight =
    frameLeft.clone();

  frameRight.position.x =
    width / 2;


  const vertical =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.08,
        height,
        0.18
      ),
      frame
    );


  const horizontal =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.08,
        0.18
      ),
      frame
    );


  group.add(
    frameTop,
    frameBottom,
    frameLeft,
    frameRight,
    vertical,
    horizontal
  );


  group.position.set(
    x,
    y,
    z
  );

  group.rotation.y =
    rotationY;


  group.traverse(
    object => {

      if(object.isMesh){

        object.castShadow = true;
        object.receiveShadow = true;

      }

    }
  );


  scene.add(group);

  return group;

}


/* =========================================================
   RED BUILDING
   ========================================================= */

function createABSSBuilding(
  x,
  z,
  width,
  depth,
  name
){

  const floors = 4;
  const floorHeight = 4.2;
  const totalHeight =
    floors * floorHeight;


  /*
    MAIN RED BLOCK
  */

  makeBox(
    width,
    totalHeight,
    depth,
    0xb94737,
    x,
    totalHeight / 2,
    z
  );


  /*
    WHITE HORIZONTAL BANDS
    clearly separating floors
  */

  for(
    let floor = 1;
    floor < floors;
    floor++
  ){

    makeBox(
      width + 0.35,
      0.28,
      depth + 0.28,
      0xf1eee7,
      x,
      floor * floorHeight,
      z
    );

  }


  /*
    WHITE ROOF
  */

  makeBox(
    width + 0.5,
    0.35,
    depth + 0.5,
    0xf4f0e8,
    x,
    totalHeight + 0.18,
    z
  );


  /*
    WINDOWS ON FRONT
  */

  for(
    let floor = 0;
    floor < floors;
    floor++
  ){

    const windowY =
      1.55 +
      floor * floorHeight;


    for(
      let column = -2;
      column <= 2;
      column++
    ){

      const windowX =
        x +
        column *
        (width / 5.5);


      makeWindow(
        windowX,
        windowY,
        z - depth / 2 - 0.12,
        2.35,
        1.65,
        0
      );

    }

  }


  /*
    WINDOWS ON BACK
  */

  for(
    let floor = 0;
    floor < floors;
    floor++
  ){

    const windowY =
      1.55 +
      floor * floorHeight;


    for(
      let column = -2;
      column <= 2;
      column++
    ){

      const windowX =
        x +
        column *
        (width / 5.5);


      makeWindow(
        windowX,
        windowY,
        z + depth / 2 + 0.12,
        2.35,
        1.65,
        Math.PI
      );

    }

  }


  /*
    SIDE WINDOWS
  */

  for(
    let floor = 0;
    floor < floors;
    floor++
  ){

    const windowY =
      1.55 +
      floor * floorHeight;


    for(
      let row = -1;
      row <= 1;
      row++
    ){

      makeWindow(
        x - width / 2 - 0.12,
        windowY,
        z + row * 7,
        2.2,
        1.6,
        Math.PI / 2
      );


      makeWindow(
        x + width / 2 + 0.12,
        windowY,
        z + row * 7,
        2.2,
        1.6,
        -Math.PI / 2
      );

    }

  }


  /*
    CENTRAL WHITE ENTRANCE SECTION
    ONLY FOR MAIN COLLEGE
  */

  if(name === "MAIN COLLEGE"){

    makeBox(
      25,
      11,
      1.2,
      0xf1eee8,
      x,
      5.5,
      z - depth / 2 - 0.65
    );


    /*
      BLUE CENTRAL GLASS
    */

    const glass =
      new THREE.MeshStandardMaterial({
        color:0x55a9d0,
        roughness:0.12,
        metalness:0.05
      });


    const glassPanel =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          10,
          7.8,
          0.25
        ),
        glass
      );


    glassPanel.position.set(
      x,
      7.5,
      z - depth / 2 - 1.35
    );


    glassPanel.castShadow = true;

    scene.add(glassPanel);


    /*
      GLASS CROSS FRAMES
    */

    makeBox(
      0.25,
      7.8,
      0.35,
      0xffffff,
      x,
      7.5,
      z - depth / 2 - 1.52
    );


    makeBox(
      10,
      0.25,
      0.35,
      0xffffff,
      x,
      7.5,
      z - depth / 2 - 1.52
    );


    /*
      CENTRAL ENTRANCE
    */

    makeBox(
      5.5,
      5,
      0.5,
      0x74aabc,
      x,
      2.5,
      z - depth / 2 - 1.5
    );


    /*
      WHITE ENTRANCE ROOF
    */

    makeBox(
      28,
      0.7,
      7,
      0xf2eee7,
      x,
      10.9,
      z - depth / 2 - 3
    );


    /*
      BIG WHITE PILLARS
    */

    const pillarX =
      [-11,-5.5,5.5,11];


    for(
      const px of pillarX
    ){

      makeBox(
        0.75,
        7,
        0.75,
        0xf0ece4,
        x + px,
        3.5,
        z - depth / 2 - 4.2
      );

    }

  }


  /*
    NAME BOARD
  */

  createTextBoard(
    name,
    x,
    totalHeight + 1.1,
    z - depth / 2 - 0.4,
    Math.min(width * 0.65,25)
  );

}


/* =========================================================
   TEXT BOARD
   ========================================================= */

function createTextBoard(
  text,
  x,
  y,
  z,
  width
){

  const canvas =
    document.createElement("canvas");


  canvas.width = 1024;
  canvas.height = 180;


  const ctx =
    canvas.getContext("2d");


  ctx.fillStyle =
    "#f3eee6";


  ctx.fillRect(
    0,
    0,
    1024,
    180
  );


  ctx.fillStyle =
    "#9f3029";


  ctx.font =
    "bold 58px Arial";


  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  ctx.fillText(
    text,
    512,
    90
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  const materialBoard =
    new THREE.MeshBasicMaterial({
      map:texture
    });


  const board =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        2.2
      ),
      materialBoard
    );


  board.position.set(
    x,
    y,
    z
  );


  board.rotation.y =
    Math.PI;


  scene.add(board);

}


/* =========================================================
   COLLEGE
   ========================================================= */

function buildCollege(){

  createABSSBuilding(
    0,
    -72,
    58,
    31,
    "MAIN COLLEGE"
  );


  createABSSBuilding(
    -62,
    -55,
    40,
    27,
    "MAHATMA GANDHI BLOCK"
  );


  createABSSBuilding(
    62,
    -55,
    40,
    27,
    "VISHVESVARAYA BLOCK"
  );

}


/* =========================================================
   HOSTELS
   ========================================================= */

function buildHostels(){

  createABSSBuilding(
    -82,
    55,
    40,
    27,
    "CSA BOYS HOSTEL"
  );


  createABSSBuilding(
    82,
    55,
    40,
    27,
    "GIRLS HOSTEL"
  );

}


/* =========================================================
   GROUND
   ========================================================= */

function buildGround(){

  makeBox(
    360,
    1,
    360,
    0x6b9950,
    0,
    -0.5,
    0
  );

}


/* =========================================================
   ROADS
   ========================================================= */

function buildRoads(){

  makeBox(
    18,
    0.08,
    230,
    0x505252,
    0,
    0.04,
    0
  );


  makeBox(
    190,
    0.08,
    14,
    0x505252,
    0,
    0.05,
    25
  );


  makeBox(
    190,
    0.08,
    12,
    0x505252,
    0,
    0.05,
    82
  );


  /*
    ROAD LINES
  */

  for(
    let z = -155;
    z <= 155;
    z += 17
  ){

    makeBox(
      1,
      0.09,
      7,
      0xd8d5c8,
      0,
      0.10,
      z
    );

  }

}


/* =========================================================
   MAIN GATE
   ========================================================= */

function buildGate(){

  makeBox(
    7,
    14,
    7,
    0x8c4032,
    -18,
    7,
    112
  );


  makeBox(
    7,
    14,
    7,
    0x8c4032,
    18,
    7,
    112
  );


  makeBox(
    7.5,
    1,
    1,
    0xf0ece4,
    -18,
    14.5,
    112
  );


  makeBox(
    7.5,
    1,
    1,
    0xf0ece4,
    18,
    14.5,
    112
  );


  createTextBoard(
    "ABSS INSTITUTE OF TECHNOLOGY",
    0,
    17,
    111.4,
    31
  );


  const gateMaterial =
    mat(0x29363b);


  const left =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        15,
        4.5,
        0.45
      ),
      gateMaterial
    );


  left.position.set(
    -10,
    3,
    112
  );


  scene.add(left);

  gateLeft.push(left);


  const right =
    left.clone();


  right.position.x =
    10;


  scene.add(right);

  gateRight.push(right);

}


/* =========================================================
   TREE
   ========================================================= */

function createTree(
  x,
  z,
  scale = 1
){

  makeCylinder(
    0.45 * scale,
    3 * scale,
    0x70492c,
    x,
    1.5 * scale,
    z
  );


  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.3 * scale,
        12,
        10
      ),
      mat(0x3d783b)
    );


  leaves.position.set(
    x,
    4 * scale,
    z
  );


  leaves.castShadow = true;

  scene.add(leaves);

}


/* =========================================================
   GARDEN
   ========================================================= */

function buildGarden(){

  for(
    let i = 0;
    i < 65;
    i++
  ){

    const x =
      ((i * 47) % 300) - 150;


    const z =
      ((i * 71) % 250) - 125;


    if(
      Math.abs(x) < 28 &&
      Math.abs(z + 72) < 28
    ){

      continue;

    }


    createTree(
      x,
      z,
      0.65 + (i % 4) * 0.1
    );

  }


  /*
    HEDGE
  */

  for(
    let x = -110;
    x <= 110;
    x += 7
  ){

    makeBox(
      4,
      1,
      1.2,
      0x477f3d,
      x,
      0.5,
      -108
    );

  }

}


/* =========================================================
   SPORTS
   ========================================================= */

function buildSports(){

  makeBox(
    48,
    0.12,
    27,
    0xa64c37,
    0,
    0.08,
    43
  );


  makeBox(
    40,
    0.12,
    21,
    0x467e9d,
    0,
    0.1,
    80
  );


  for(
    let x = -20;
    x <= 20;
    x += 10
  ){

    makeBox(
      0.08,
      0.18,
      27,
      0xffffff,
      x,
      0.16,
      43
    );

  }

}


/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer(){

  player =
    new THREE.Group();


  /*
    BODY
  */

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.55,
        1.2,
        5,
        10
      ),
      mat(0xf0f0f0)
    );


  body.position.y =
    1.55;


  body.castShadow = true;

  player.add(body);


  /*
    ABSS SHIRT
  */

  const shirt =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.15,
        0.85,
        0.7
      ),
      mat(0xf8f8f8)
    );


  shirt.position.y =
    1.75;


  shirt.castShadow = true;

  player.add(shirt);


  /*
    HEAD
  */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.44,
        16,
        12
      ),
      mat(0xd49a72)
    );


  head.position.y =
    2.75;


  head.castShadow = true;

  player.add(head);


  /*
    LEGS
  */

  leftLeg =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.36,
        1.1,
        0.42
      ),
      mat(0x20252b)
    );


  leftLeg.position.set(
    -0.23,
    0.55,
    0
  );


  leftLeg.castShadow = true;

  player.add(leftLeg);


  rightLeg =
    leftLeg.clone();


  rightLeg.position.x =
    0.23;


  player.add(rightLeg);


  /*
    START NEAR MAIN GATE
  */

  player.position.set(
    0,
    0,
    100
  );


  scene.add(player);

}


/* =========================================================
   KEYBOARD
   ========================================================= */

function setupKeyboard(){

  window.addEventListener(
    "keydown",
    event => {

      keys[event.code] =
        true;


      if(
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ){

        running = true;

      }


      if(
        event.code === "Space"
      ){

        jumpRequested = true;

      }

    }
  );


  window.addEventListener(
    "keyup",
    event => {

      keys[event.code] =
        false;


      if(
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ){

        running = false;

      }

    }
  );

}


/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick(){

  const base =
    document.getElementById(
      "joystick"
    );


  const stick =
    document.getElementById(
      "stick"
    );


  let active = false;


  function update(e){

    if(!active){
      return;
    }


    const rect =
      base.getBoundingClientRect();


    const touch =
      e.touches
        ? e.touches[0]
        : e;


    let dx =
      touch.clientX -
      (
        rect.left +
        rect.width / 2
      );


    let dy =
      touch.clientY -
      (
        rect.top +
        rect.height / 2
      );


    const max =
      40;


    const length =
      Math.hypot(
        dx,
        dy
      );


    if(length > max){

      dx =
        dx / length * max;

      dy =
        dy / length * max;

    }


    joystickX =
      dx / max;


    joystickY =
      dy / max;


    stick.style.transform =
      `translate(${dx}px, ${dy}px)`;

  }


  function reset(){

    active = false;

    joystickX = 0;
    joystickY = 0;

    stick.style.transform =
      "translate(0,0)";

  }


  base.addEventListener(
    "touchstart",
    e => {

      active = true;

      update(e);

    },
    {passive:false}
  );


  base.addEventListener(
    "touchmove",
    e => {

      e.preventDefault();

      update(e);

    },
    {passive:false}
  );


  base.addEventListener(
    "touchend",
    reset
  );


  base.addEventListener(
    "touchcancel",
    reset
  );

}


/* =========================================================
   FREE LOOK
   ========================================================= */

function setupLook(){

  const screen =
    renderer.domElement;


  let looking = false;

  let lastX = 0;
  let lastY = 0;


  screen.addEventListener(
    "touchstart",
    event => {

      const touch =
        event.touches[0];


      /*
        Right side = camera look
      */

      if(
        touch.clientX >
        window.innerWidth * 0.35
      ){

        looking = true;

        lastX =
          touch.clientX;

        lastY =
          touch.clientY;

      }

    },
    {passive:true}
  );


  screen.addEventListener(
    "touchmove",
    event => {

      if(!looking){
        return;
      }


      const touch =
        event.touches[0];


      const dx =
        touch.clientX -
        lastX;


      const dy =
        touch.clientY -
        lastY;


      cameraYaw -=
        dx * 0.006;


      cameraPitch -=
        dy * 0.006;


      /*
        Almost full vertical look
      */

      cameraPitch =
        THREE.MathUtils.clamp(
          cameraPitch,
          -1.48,
          1.48
        );


      lastX =
        touch.clientX;


      lastY =
        touch.clientY;

    },
    {passive:true}
  );


  screen.addEventListener(
    "touchend",
    () => {

      looking = false;

    },
    {passive:true}
  );


  /*
    PC mouse
  */

  let mouseLooking =
    false;


  screen.addEventListener(
    "pointerdown",
    event => {

      if(
        event.pointerType !== "mouse"
      ){
        return;
      }


      mouseLooking = true;

      lastX =
        event.clientX;

      lastY =
        event.clientY;

    }
  );


  screen.addEventListener(
    "pointermove",
    event => {

      if(!mouseLooking){
        return;
      }


      const dx =
        event.clientX -
        lastX;


      const dy =
        event.clientY -
        lastY;


      cameraYaw -=
        dx * 0.006;


      cameraPitch -=
        dy * 0.006;


      cameraPitch =
        THREE.MathUtils.clamp(
          cameraPitch,
          -1.48,
          1.48
        );


      lastX =
        event.clientX;


      lastY =
        event.clientY;

    }
  );


  screen.addEventListener(
    "pointerup",
    () => {

      mouseLooking = false;

    }
  );

}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons(){

  const jump =
    document.getElementById(
      "jump"
    );


  const run =
    document.getElementById(
      "run"
    );


  jump.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      jumpRequested = true;

    },
    {passive:false}
  );


  run.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      running = true;

    },
    {passive:false}
  );


  run.addEventListener(
    "touchend",
    () => {

      running = false;

    }
  );


  run.addEventListener(
    "touchcancel",
    () => {

      running = false;

    }
  );

}


/* =========================================================
   INPUT
   ========================================================= */

function getInput(){

  let x =
    joystickX;


  let z =
    joystickY;


  if(
    keys.KeyA ||
    keys.ArrowLeft
  ){

    x -= 1;

  }


  if(
    keys.KeyD ||
    keys.ArrowRight
  ){

    x += 1;

  }


  if(
    keys.KeyW ||
    keys.ArrowUp
  ){

    z -= 1;

  }


  if(
    keys.KeyS ||
    keys.ArrowDown
  ){

    z += 1;

  }


  const length =
    Math.hypot(
      x,
      z
    );


  if(length > 1){

    x /= length;
    z /= length;

  }


  return {
    x:x,
    z:z
  };

}


/* =========================================================
   PLAYER UPDATE
   ========================================================= */

function updatePlayer(dt){

  const input =
    getInput();


  const moving =
    Math.hypot(
      input.x,
      input.z
    ) > 0.08;


  const speed =
    running
      ? 13
      : 6.5;


  /*
    CAMERA BASED MOVEMENT
  */

  const cos =
    Math.cos(cameraYaw);


  const sin =
    Math.sin(cameraYaw);


  const moveX =
    input.x * cos +
    input.z * sin;


  const moveZ =
    -input.x * sin +
    input.z * cos;


  player.position.x +=
    moveX *
    speed *
    dt;


  player.position.z +=
    moveZ *
    speed *
    dt;


  /*
    CHARACTER FACES MOVEMENT
  */

  if(moving){

    player.rotation.y =
      Math.atan2(
        moveX,
        moveZ
      );

  }


  /*
    JUMP
  */

  if(
    jumpRequested &&
    !jumping
  ){

    verticalVelocity =
      9;


    jumping = true;

    jumpRequested =
      false;

  }


  verticalVelocity -=
    24 * dt;


  player.position.y +=
    verticalVelocity * dt;


  if(
    player.position.y <= 0
  ){

    player.position.y =
      0;


    verticalVelocity =
      0;


    jumping =
      false;

  }


  /*
    MAP BOUNDARY
  */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -165,
      165
    );


  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -165,
      165
    );


  /*
    LEG ANIMATION
  */

  if(
    moving &&
    !jumping
  ){

    walkCycle +=
      dt *
      (
        running
          ? 15
          : 9
      );


    const swing =
      Math.sin(
        walkCycle
      ) *
      (
        running
          ? 0.65
          : 0.42
      );


    leftLeg.rotation.x =
      swing;


    rightLeg.rotation.x =
      -swing;

  }
  else{

    leftLeg.rotation.x =
      THREE.MathUtils.lerp(
        leftLeg.rotation.x,
        0,
        Math.min(
          1,
          dt * 10
        )
      );


    rightLeg.rotation.x =
      THREE.MathUtils.lerp(
        rightLeg.rotation.x,
        0,
        Math.min(
          1,
          dt * 10
        )
      );

  }


  /*
    AUTOMATIC GATE
  */

  const distanceFromGate =
    Math.hypot(
      player.position.x,
      player.position.z - 112
    );


  const open =
    distanceFromGate < 22;


  const offset =
    open
      ? 5
      : 0;


  for(
    const gate of gateLeft
  ){

    gate.position.x =
      THREE.MathUtils.lerp(
        gate.position.x,
        -10 - offset,
        Math.min(
          1,
          dt * 6
        )
      );

  }


  for(
    const gate of gateRight
  ){

    gate.position.x =
      THREE.MathUtils.lerp(
        gate.position.x,
        10 + offset,
        Math.min(
          1,
          dt * 6
        )
      );

  }

}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(dt){

  const distance =
    8.5;


  const horizontal =
    Math.cos(
      cameraPitch
    ) *
    distance;


  const vertical =
    Math.sin(
      cameraPitch
    ) *
    distance;


  cameraTarget.set(

    player.position.x +
      Math.sin(cameraYaw) *
      horizontal,

    player.position.y +
      2.9 +
      vertical,

    player.position.z +
      Math.cos(cameraYaw) *
      horizontal

  );


  camera.position.lerp(
    cameraTarget,
    Math.min(
      1,
      dt * 9
    )
  );


  camera.lookAt(
    player.position.x,
    player.position.y + 1.45,
    player.position.z
  );

}


/* =========================================================
   LOCATION HUD
   ========================================================= */

function updateLocation(){

  const x =
    player.position.x;


  const z =
    player.position.z;


  let location =
    "Main Campus";


  if(
    z < -35 &&
    Math.abs(x) < 35
  ){

    location =
      "Main College";

  }
  else if(
    z > 30 &&
    x < -55
  ){

    location =
      "CSA Boys Hostel";

  }
  else if(
    z > 30 &&
    x > 55
  ){

    location =
      "Girls Hostel";

  }
  else if(
    z > 25 &&
    Math.abs(x) < 30
  ){

    location =
      "Sports Area";

  }


  document.getElementById(
    "place"
  ).textContent =
    location;

}


/* =========================================================
   INIT
   ========================================================= */

function init(){

  scene =
    new THREE.Scene();


  scene.background =
    new THREE.Color(
      0x87cbed
    );


  scene.fog =
    new THREE.Fog(
      0x87cbed,
      100,
      350
    );


  camera =
    new THREE.PerspectiveCamera(
      70,
      window.innerWidth /
      window.innerHeight,
      0.1,
      600
    );


  renderer =
    new THREE.WebGLRenderer({
      antialias:false,
      powerPreference:
        "high-performance"
    });


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


  renderer.shadowMap.enabled =
    true;


  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


  document.body.appendChild(
    renderer.domElement
  );


  /*
    LIGHT
  */

  scene.add(
    new THREE.HemisphereLight(
      0xe4f5ff,
      0x557348,
      2.3
    )
  );


  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      2.6
    );


  sun.position.set(
    80,
    130,
    70
  );


  sun.castShadow =
    true;


  sun.shadow.mapSize.set(
    1024,
    1024
  );


  sun.shadow.camera.left =
    -180;


  sun.shadow.camera.right =
    180;


  sun.shadow.camera.top =
    180;


  sun.shadow.camera.bottom =
    -180;


  scene.add(sun);


  /*
    BUILD WORLD
  */

  buildGround();
  buildRoads();

  buildCollege();
  buildHostels();

  buildGate();

  buildGarden();
  buildSports();

  createPlayer();


  /*
    CONTROLS
  */

  setupKeyboard();
  setupJoystick();
  setupLook();
  setupButtons();


  window.addEventListener(
    "resize",
    resize
  );


  animate();

}


/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

  camera.aspect =
    window.innerWidth /
    window.innerHeight;


  camera.updateProjectionMatrix();


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

}


/* =========================================================
   GAME LOOP
   ========================================================= */

function animate(){

  requestAnimationFrame(
    animate
  );


  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );


  updatePlayer(dt);

  updateCamera(dt);

  updateLocation();


  renderer.render(
    scene,
    camera
  );

}


/* =========================================================
   START
   ========================================================= */

init();
