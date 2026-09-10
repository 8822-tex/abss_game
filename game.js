import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer, player;

let leftLeg;
let rightLeg;
let walkCycle = 0;

let cameraYaw = 0;
let cameraPitch = 0;

let running = false;
let onGround = true;
let verticalVelocity = 0;
let jumpQueued = false;

let joystickX = 0;
let joystickY = 0;

let keys = {};

let lookPointer = null;
let lookLastX = 0;
let lookLastY = 0;

const tmp = new THREE.Vector3();
const clock = new THREE.Clock();

const gateLeft = [];
const gateRight = [];


function material(color, roughness = 0.75){

  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });

}


function box(w,h,d,color,x,y,z){

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    material(color)
  );

  mesh.position.set(x,y,z);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;

}


function cylinder(r,h,color,x,y,z){

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r,r,h,10),
    material(color)
  );

  mesh.position.set(x,y,z);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;

}


function init(){

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x86c9ef);

  scene.fog = new THREE.Fog(
    0x86c9ef,
    90,
    360
  );


  camera = new THREE.PerspectiveCamera(
    70,
    innerWidth / innerHeight,
    0.1,
    600
  );


  renderer = new THREE.WebGLRenderer({
    antialias:false,
    powerPreference:"high-performance"
  });

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.setPixelRatio(
    Math.min(devicePixelRatio,1.5)
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  document.body.appendChild(
    renderer.domElement
  );


  scene.add(
    new THREE.HemisphereLight(
      0xdff3ff,
      0x5b7045,
      2.2
    )
  );


  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

  sun.position.set(
    80,
    130,
    60
  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(
    1024,
    1024
  );

  sun.shadow.camera.left = -180;
  sun.shadow.camera.right = 180;
  sun.shadow.camera.top = 180;
  sun.shadow.camera.bottom = -180;

  scene.add(sun);


  buildGround();
  buildRoads();

  buildCollege();
  buildHostels();

  buildGate();

  buildGarden();
  buildSports();

  createPlayer();

  setupKeyboard();
  setupJoystick();
  setupLook();
  setupButtons();

  addEventListener(
    "resize",
    resize
  );


  setTimeout(
    () => {
      document.getElementById(
        "loading"
      ).style.display = "none";
    },
    500
  );


  animate();

}


function buildGround(){

  box(
    360,
    1,
    360,
    0x6c9a50,
    0,
    -0.5,
    0
  );

}


function buildRoads(){

  box(
    18,
    0.08,
    220,
    0x4b4d4d,
    0,
    0.05,
    0
  );


  box(
    180,
    0.08,
    14,
    0x4b4d4d,
    0,
    0.06,
    20
  );


  box(
    180,
    0.08,
    10,
    0x686868,
    0,
    0.065,
    75
  );


  for(
    let z = -155;
    z <= 155;
    z += 16
  ){

    box(
      1,
      0.09,
      7,
      0xd8d8c8,
      0,
      0.11,
      z
    );

  }

}


function createBuilding(
  x,
  z,
  w,
  d,
  name
){

  const floors = 4;

  const floorH = 4.3;

  const total =
    floors * floorH;


  box(
    w,
    total,
    d,
    0xb94736,
    x,
    total / 2,
    z
  );


  for(
    let i = 1;
    i < floors;
    i++
  ){

    box(
      w + 0.25,
      0.24,
      d + 0.2,
      0xf2eee7,
      x,
      i * floorH,
      z
    );

  }


  box(
    w + 0.4,
    0.35,
    d + 0.35,
    0xf5f0e8,
    x,
    total + 0.18,
    z
  );


  for(
    let floor = 0;
    floor < floors;
    floor++
  ){

    const y =
      1.35 + floor * floorH;


    for(
      let col = -2;
      col <= 2;
      col++
    ){

      const wx =
        x + col * (w / 5.2);


      box(
        1.9,
        1.65,
        0.08,
        0x83b9cf,
        wx,
        y,
        z - d / 2 - 0.05
      );


      box(
        1.9,
        1.65,
        0.08,
        0x83b9cf,
        wx,
        y,
        z + d / 2 + 0.05
      );

    }

  }


  box(
    Math.min(w * 0.55,22),
    2.2,
    0.35,
    0xf3eee5,
    x,
    2.1,
    z - d / 2 - 0.22
  );


  addLabel(
    name,
    x,
    2.35,
    z - d / 2 - 0.45,
    Math.min(w * 0.5,20)
  );

}


function addLabel(
  text,
  x,
  y,
  z,
  width
){

  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;


  const ctx =
    canvas.getContext("2d");


  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    512,
    128
  );


  ctx.fillStyle = "#a52d25";

  ctx.font =
    "bold 34px Arial";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    text,
    256,
    64
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        2.2
      ),
      new THREE.MeshBasicMaterial({
        map:texture
      })
    );


  mesh.position.set(
    x,
    y,
    z
  );


  mesh.rotation.y =
    Math.PI;


  scene.add(mesh);

}


function buildCollege(){

  createBuilding(
    0,
    -70,
    58,
    30,
    "ABSS INSTITUTE OF TECHNOLOGY"
  );


  createBuilding(
    -62,
    -55,
    42,
    27,
    "MAHATMA GANDHI BLOCK"
  );


  createBuilding(
    62,
    -55,
    42,
    27,
    "VISHVESVARAYA BLOCK"
  );


  box(
    32,
    0.6,
    12,
    0xf0eee8,
    0,
    1,
    -51
  );


  for(
    const x of [-14,-7,0,7,14]
  ){

    cylinder(
      0.28,
      6,
      0xe8e4da,
      x,
      3.8,
      -57
    );

  }


  box(
    25,
    4,
    1,
    0x79aebf,
    0,
    2.2,
    -84
  );


  addLabel(
    "ABSS",
    0,
    2.25,
    -84.55,
    12
  );

}


function buildHostels(){

  createBuilding(
    -82,
    55,
    40,
    27,
    "CSA BOYS HOSTEL"
  );


  createBuilding(
    82,
    55,
    40,
    27,
    "GIRLS HOSTEL"
  );


  box(
    14,
    0.08,
    48,
    0x565656,
    -82,
    0.1,
    25
  );


  box(
    14,
    0.08,
    48,
    0x565656,
    82,
    0.1,
    25
  );

}


function buildGate(){

  box(
    7,
    14,
    7,
    0x8d3d2e,
    -18,
    7,
    108
  );


  box(
    7,
    14,
    7,
    0x8d3d2e,
    18,
    7,
    108
  );


  box(
    7.6,
    1.2,
    1,
    0xeee9df,
    -18,
    14.5,
    108
  );


  box(
    7.6,
    1.2,
    1,
    0xeee9df,
    18,
    14.5,
    108
  );


  addLabel(
    "ABSS INSTITUTE OF TECHNOLOGY",
    0,
    17,
    108,
    30
  );


  const gateMaterial =
    material(0x26343a);


  const leftGate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        15,
        4.8,
        0.45
      ),
      gateMaterial
    );


  leftGate.position.set(
    -10,
    3.1,
    108
  );


  scene.add(leftGate);

  gateLeft.push(leftGate);


  const rightGate =
    leftGate.clone();


  rightGate.position.x = 10;

  scene.add(rightGate);

  gateRight.push(rightGate);


  for(
    let i = -16;
    i <= 16;
    i += 4
  ){

    box(
      0.35,
      1.4,
      0.6,
      0xd5d0c6,
      i,
      1,
      108
    );

  }

}


function tree(
  x,
  z,
  scale = 1
){

  cylinder(
    0.45 * scale,
    3 * scale,
    0x704b2e,
    x,
    1.5 * scale,
    z
  );


  const crown =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.2 * scale,
        10,
        8
      ),
      material(0x3d7b3c)
    );


  crown.position.set(
    x,
    4 * scale,
    z
  );


  crown.castShadow = true;

  scene.add(crown);

}


function buildGarden(){

  for(
    let i = 0;
    i < 55;
    i++
  ){

    const x =
      (i * 37) % 300 - 150;

    const z =
      (i * 61) % 260 - 130;


    if(
      Math.abs(x) < 28 &&
      Math.abs(z) < 105
    ){

      continue;

    }


    tree(
      x,
      z,
      0.65 + (i % 4) * 0.12
    );

  }


  for(
    let i = -120;
    i <= 120;
    i += 12
  ){

    tree(
      i,
      -112,
      0.8
    );


    tree(
      i,
      112,
      0.75
    );

  }

}


function buildSports(){

  box(
    46,
    0.12,
    26,
    0x9d4b35,
    0,
    0.08,
    45
  );


  for(
    let x = -20;
    x <= 20;
    x += 10
  ){

    box(
      0.08,
      0.18,
      26,
      0xffffff,
      x,
      0.16,
      45
    );

  }


  box(
    38,
    0.12,
    20,
    0x497c9e,
    0,
    0.1,
    82
  );

}


function createPlayer(){

  player =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.55,
        1.25,
        4,
        8
      ),
      material(0xf0f0f0)
    );


  body.position.y = 1.55;

  body.castShadow = true;

  player.add(body);


  const shirt =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.15,
        0.85,
        0.7
      ),
      material(0xf7f7f7)
    );


  shirt.position.y = 1.75;

  shirt.castShadow = true;

  player.add(shirt);


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.44,
        16,
        12
      ),
      material(0xd49a72)
    );


  head.position.y = 2.75;

  head.castShadow = true;

  player.add(head);


  leftLeg =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.36,
        1.1,
        0.42
      ),
      material(0x20252b)
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


  player.position.set(
    0,
    0,
    92
  );


  scene.add(player);

}


function setupKeyboard(){

  addEventListener(
    "keydown",
    e => {

      keys[e.code] = true;


      if(
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      ){

        running = true;

      }


      if(
        e.code === "Space"
      ){

        jumpQueued = true;

      }

    }
  );


  addEventListener(
    "keyup",
    e => {

      keys[e.code] = false;


      if(
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      ){

        running = false;

      }

    }
  );

}


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


  function move(e){

    if(!active) return;


    const rect =
      base.getBoundingClientRect();


    const p =
      e.touches
        ? e.touches[0]
        : e;


    let dx =
      p.clientX -
      (
        rect.left +
        rect.width / 2
      );


    let dy =
      p.clientY -
      (
        rect.top +
        rect.height / 2
      );


    const max = 40;


    const len =
      Math.hypot(dx,dy);


    if(len > max){

      dx =
        dx / len * max;

      dy =
        dy / len * max;

    }


    joystickX =
      dx / max;

    joystickY =
      dy / max;


    stick.style.transform =
      `translate(${dx}px,${dy}px)`;

  }


  function end(){

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

      move(e);

    },
    {passive:false}
  );


  base.addEventListener(
    "touchmove",
    e => {

      e.preventDefault();

      move(e);

    },
    {passive:false}
  );


  base.addEventListener(
    "touchend",
    end
  );


  base.addEventListener(
    "touchcancel",
    end
  );

}


function setupLook(){

  const el =
    renderer.domElement;


  el.addEventListener(
    "touchstart",
    e => {

      const t =
        e.touches[0];


      if(
        t.clientX >
        innerWidth * 0.38
      ){

        lookPointer =
          t.identifier;

        lookLastX =
          t.clientX;

        lookLastY =
          t.clientY;

      }

    },
    {passive:true}
  );


  el.addEventListener(
    "touchmove",
    e => {

      for(
        const t of e.touches
      ){

        if(
          t.identifier ===
          lookPointer
        ){

          const dx =
            t.clientX -
            lookLastX;


          const dy =
            t.clientY -
            lookLastY;


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


          lookLastX =
            t.clientX;


          lookLastY =
            t.clientY;


          break;

        }

      }

    },
    {passive:true}
  );


  el.addEventListener(
    "touchend",
    e => {

      for(
        const t of e.changedTouches
      ){

        if(
          t.identifier ===
          lookPointer
        ){

          lookPointer = null;

        }

      }

    },
    {passive:true}
  );


  let dragging = false;


  el.addEventListener(
    "pointerdown",
    e => {

      if(
        e.pointerType !== "mouse"
      ){

        return;

      }


      if(
        e.clientX >
        innerWidth * 0.38
      ){

        dragging = true;

        lookLastX =
          e.clientX;

        lookLastY =
          e.clientY;


        el.setPointerCapture(
          e.pointerId
        );

      }

    }
  );


  el.addEventListener(
    "pointermove",
    e => {

      if(!dragging) return;


      const dx =
        e.clientX -
        lookLastX;


      const dy =
        e.clientY -
        lookLastY;


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


      lookLastX =
        e.clientX;


      lookLastY =
        e.clientY;

    }
  );


  el.addEventListener(
    "pointerup",
    () => {
      dragging = false;
    }
  );

}


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
    e => {

      e.preventDefault();

      jumpQueued = true;

    },
    {passive:false}
  );


  run.addEventListener(
    "touchstart",
    e => {

      e.preventDefault();

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


function getInput(){

  let x = joystickX;
  let z = joystickY;


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


  const len =
    Math.hypot(x,z);


  if(len > 1){

    x /= len;
    z /= len;

  }


  return {
    x,
    z
  };

}


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


  if(moving){

    player.rotation.y =
      Math.atan2(
        moveX,
        moveZ
      );

  }


  if(
    jumpQueued &&
    onGround
  ){

    verticalVelocity = 9;

    onGround = false;

    jumpQueued = false;

  }


  verticalVelocity -=
    24 * dt;


  player.position.y +=
    verticalVelocity * dt;


  if(
    player.position.y <= 0
  ){

    player.position.y = 0;

    verticalVelocity = 0;

    onGround = true;

  }


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


  if(
    moving &&
    onGround
  ){

    walkCycle +=
      dt *
      (
        running
          ? 15
          : 9
      );


    const swing =
      Math.sin(walkCycle) *
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


  const nearGate =
    Math.abs(
      player.position.x
    ) < 26 &&
    Math.abs(
      player.position.z - 108
    ) < 13;


  const target =
    nearGate
      ? 5
      : 0;


  for(
    const gate of gateLeft
  ){

    gate.position.x =
      THREE.MathUtils.lerp(
        gate.position.x,
        -10 - target,
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
        10 + target,
        Math.min(
          1,
          dt * 6
        )
      );

  }

}


function updateCamera(dt){

  const distance = 8.5;


  const horizontal =
    Math.cos(cameraPitch) *
    distance;


  const vertical =
    Math.sin(cameraPitch) *
    distance;


  tmp.set(
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
    tmp,
    Math.min(
      1,
      dt * 10
    )
  );


  camera.lookAt(
    player.position.x,
    player.position.y + 1.45,
    player.position.z
  );

}


function updateHUD(){

  const d =
    player.position;


  let name =
    "Main Campus";


  if(
    d.z > 30 &&
    d.x < -55
  ){

    name =
      "CSA Boys Hostel";

  }
  else if(
    d.z > 30 &&
    d.x > 55
  ){

    name =
      "Girls Hostel";

  }
  else if(
    d.z < -35 &&
    Math.abs(d.x) < 32
  ){

    name =
      "Main College";

  }


  document.getElementById(
    "location"
  ).textContent = name;

}


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

  updateHUD();


  renderer.render(
    scene,
    camera
  );

}


function resize(){

  camera.aspect =
    innerWidth /
    innerHeight;


  camera.updateProjectionMatrix();


  renderer.setSize(
    innerWidth,
    innerHeight
  );

}


init();
