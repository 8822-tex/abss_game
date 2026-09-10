import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

"use strict";

let scene;
let camera;
let renderer;
let player;

let leftLeg;
let rightLeg;

let yaw = 0;
let pitch = 0;

let walkTime = 0;
let jumpVelocity = 0;
let onGround = true;
let running = false;

let joyX = 0;
let joyY = 0;

const keys = {};
const clock = new THREE.Clock();

const gateLeft = [];
const gateRight = [];


/* =========================
   MATERIAL
========================= */

function material(color){
  return new THREE.MeshStandardMaterial({
    color,
    roughness:0.72
  });
}


/* =========================
   BOX
========================= */

function box(w,h,d,color,x,y,z){

  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    material(color)
  );

  m.position.set(x,y,z);
  m.castShadow = true;
  m.receiveShadow = true;

  scene.add(m);

  return m;
}


/* =========================
   WINDOW
========================= */

function window3D(x,y,z,w,h,rot=0){

  const g = new THREE.Group();

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(w,h,.12),
    new THREE.MeshStandardMaterial({
      color:0x63abc8,
      roughness:.15,
      metalness:.05
    })
  );

  g.add(glass);

  const frame = material(0xf2eee5);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(w+.2,.12,.18),
    frame
  );

  const bottom = top.clone();

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(.12,h,.18),
    frame
  );

  const right = left.clone();

  top.position.y = h/2;
  bottom.position.y = -h/2;
  left.position.x = -w/2;
  right.position.x = w/2;

  const midV = new THREE.Mesh(
    new THREE.BoxGeometry(.08,h,.19),
    frame
  );

  const midH = new THREE.Mesh(
    new THREE.BoxGeometry(w,.08,.19),
    frame
  );

  g.add(top,bottom,left,right,midV,midH);

  g.position.set(x,y,z);
  g.rotation.y = rot;

  g.traverse(o=>{
    if(o.isMesh){
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  scene.add(g);
}


/* =========================
   BUILDING
========================= */

function building(x,z,w,d,name){

  const floorH = 4.2;
  const floors = 4;
  const height = floorH*floors;

  /* RED MAIN BLOCK */

  box(
    w,
    height,
    d,
    0xb94335,
    x,
    height/2,
    z
  );

  /* WHITE FLOOR BANDS */

  for(let i=1;i<floors;i++){

    box(
      w+.35,
      .25,
      d+.35,
      0xf0ede5,
      x,
      i*floorH,
      z
    );

  }

  /* ROOF */

  box(
    w+.5,
    .35,
    d+.5,
    0xf3efe7,
    x,
    height+.18,
    z
  );

  /* FRONT WINDOWS */

  for(let floor=0;floor<4;floor++){

    const y=1.65+floor*floorH;

    for(let col=-2;col<=2;col++){

      window3D(
        x+col*(w/5.5),
        y,
        z-d/2-.1,
        2.25,
        1.55
      );

    }
  }

  /* BACK WINDOWS */

  for(let floor=0;floor<4;floor++){

    const y=1.65+floor*floorH;

    for(let col=-2;col<=2;col++){

      window3D(
        x+col*(w/5.5),
        y,
        z+d/2+.1,
        2.25,
        1.55,
        Math.PI
      );

    }
  }

  /* SIDE WINDOWS */

  for(let floor=0;floor<4;floor++){

    const y=1.65+floor*floorH;

    for(let row=-1;row<=1;row++){

      window3D(
        x-w/2-.1,
        y,
        z+row*7,
        2.1,
        1.5,
        Math.PI/2
      );

      window3D(
        x+w/2+.1,
        y,
        z+row*7,
        2.1,
        1.5,
        -Math.PI/2
      );

    }
  }

  /* MAIN COLLEGE SPECIAL FRONT */

  if(name==="MAIN COLLEGE"){

    box(
      26,
      11,
      1,
      0xf1eee7,
      x,
      5.5,
      z-d/2-.65
    );

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(10,7.5,.2),
      new THREE.MeshStandardMaterial({
        color:0x5aadd1,
        roughness:.12
      })
    );

    glass.position.set(
      x,
      7.2,
      z-d/2-1.25
    );

    scene.add(glass);

    /* GLASS DIVIDERS */

    box(
      .22,
      7.5,
      .3,
      0xffffff,
      x,
      7.2,
      z-d/2-1.4
    );

    box(
      10,
      .22,
      .3,
      0xffffff,
      x,
      7.2,
      z-d/2-1.4
    );

    /* ENTRANCE */

    box(
      5.5,
      5,
      .45,
      0x6daabe,
      x,
      2.5,
      z-d/2-1.45
    );

    /* ROOF */

    box(
      29,
      .7,
      6,
      0xf2eee6,
      x,
      11,
      z-d/2-3
    );

    /* PILLARS */

    for(const px of [-11,-5.5,5.5,11]){

      box(
        .8,
        7,
        .8,
        0xf0ece4,
        x+px,
        3.5,
        z-d/2-4
      );

    }
  }

  board(
    name,
    x,
    height+1.1,
    z-d/2-.3
  );
}


/* =========================
   BOARD
========================= */

function board(text,x,y,z){

  const canvas =
    document.createElement("canvas");

  canvas.width=1024;
  canvas.height=180;

  const ctx=canvas.getContext("2d");

  ctx.fillStyle="#f3eee6";
  ctx.fillRect(0,0,1024,180);

  ctx.fillStyle="#9d302a";
  ctx.font="bold 54px Arial";
  ctx.textAlign="center";
  ctx.textBaseline="middle";

  ctx.fillText(text,512,90);

  const texture =
    new THREE.CanvasTexture(canvas);

  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(25,2.1),
      new THREE.MeshBasicMaterial({
        map:texture
      })
    );

  mesh.position.set(x,y,z);
  mesh.rotation.y=Math.PI;

  scene.add(mesh);
}


/* =========================
   COLLEGE
========================= */

function createCollege(){

  building(
    0,-72,58,31,
    "MAIN COLLEGE"
  );

  building(
    -62,-55,40,27,
    "MAHATMA GANDHI BLOCK"
  );

  building(
    62,-55,40,27,
    "VISHVESVARAYA BLOCK"
  );
}


/* =========================
   HOSTELS
========================= */

function createHostels(){

  building(
    -82,55,40,27,
    "CSA BOYS HOSTEL"
  );

  building(
    82,55,40,27,
    "GIRLS HOSTEL"
  );
}


/* =========================
   GROUND
========================= */

function createGround(){

  box(
    360,
    1,
    360,
    0x64964d,
    0,-.5,0
  );
}


/* =========================
   ROADS
========================= */

function createRoads(){

  box(
    18,.08,230,
    0x4e5150,
    0,.04,0
  );

  box(
    190,.08,14,
    0x4e5150,
    0,.05,25
  );

  box(
    190,.08,12,
    0x4e5150,
    0,.05,82
  );

  for(let z=-150;z<=150;z+=17){

    box(
      1,.09,7,
      0xe0ddd0,
      0,.1,z
    );

  }
}


/* =========================
   TREES
========================= */

function tree(x,z,s=1){

  box(
    .45*s,
    3*s,
    .45*s,
    0x70482c,
    x,
    1.5*s,
    z
  );

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.2*s,12,10
      ),
      material(0x39753a)
    );

  leaves.position.set(
    x,
    4*s,
    z
  );

  leaves.castShadow=true;

  scene.add(leaves);
}


/* =========================
   GARDEN
========================= */

function createGarden(){

  for(let i=0;i<60;i++){

    const x=((i*47)%300)-150;
    const z=((i*71)%250)-125;

    if(
      Math.abs(x)<35 &&
      Math.abs(z+72)<30
    ) continue;

    tree(
      x,
      z,
      .65+(i%4)*.1
    );
  }
}


/* =========================
   SPORTS
========================= */

function createSports(){

  box(
    48,.12,27,
    0xa94c38,
    0,.08,43
  );

  box(
    40,.12,21,
    0x477f9d,
    0,.1,80
  );
}


/* =========================
   GATE
========================= */

function createGate(){

  box(
    7,14,7,
    0x8e4032,
    -18,7,112
  );

  box(
    7,14,7,
    0x8e4032,
    18,7,112
  );

  board(
    "ABSS INSTITUTE OF TECHNOLOGY",
    0,
    17,
    111.4
  );

  const left=box(
    15,4.5,.45,
    0x26383e,
    -10,3,112
  );

  const right=box(
    15,4.5,.45,
    0x26383e,
    10,3,112
  );

  gateLeft.push(left);
  gateRight.push(right);
}


/* =========================
   PLAYER
========================= */

function createPlayer(){

  player=new THREE.Group();

  const body=new THREE.Mesh(
    new THREE.CapsuleGeometry(
      .52,1.2,5,10
    ),
    material(0xeeeeee)
  );

  body.position.y=1.5;
  player.add(body);

  const shirt=box(
    1.15,.85,.7,
    0xf5f5f5,
    0,1.75,0
  );

  /* remove from scene because box adds globally */

  scene.remove(shirt);
  player.add(shirt);

  const head=new THREE.Mesh(
    new THREE.SphereGeometry(
      .43,16,12
    ),
    material(0xd49a72)
  );

  head.position.y=2.7;
  player.add(head);

  leftLeg=new THREE.Mesh(
    new THREE.BoxGeometry(
      .36,1.1,.42
    ),
    material(0x20252b)
  );

  leftLeg.position.set(
    -.23,.55,0
  );

  player.add(leftLeg);

  rightLeg=leftLeg.clone();

  rightLeg.position.x=.23;

  player.add(rightLeg);

  player.position.set(
    0,0,100
  );

  scene.add(player);
}


/* =========================
   INPUT
========================= */

function setupKeyboard(){

  addEventListener(
    "keydown",
    e=>{
      keys[e.code]=true;

      if(
        e.code==="ShiftLeft" ||
        e.code==="ShiftRight"
      ){
        running=true;
      }
    }
  );

  addEventListener(
    "keyup",
    e=>{
      keys[e.code]=false;

      if(
        e.code==="ShiftLeft" ||
        e.code==="ShiftRight"
      ){
        running=false;
      }
    }
  );
}


/* =========================
   JOYSTICK
========================= */

function setupJoystick(){

  const base=
    document.getElementById("joystick");

  const stick=
    document.getElementById("stick");

  let active=false;

  function move(e){

    if(!active)return;

    const r=
      base.getBoundingClientRect();

    const t=
      e.touches ? e.touches[0] : e;

    let dx=
      t.clientX-
      (r.left+r.width/2);

    let dy=
      t.clientY-
      (r.top+r.height/2);

    const max=40;

    const len=
      Math.hypot(dx,dy);

    if(len>max){

      dx=dx/len*max;
      dy=dy/len*max;

    }

    joyX=dx/max;
    joyY=dy/max;

    stick.style.transform=
      `translate(${dx}px,${dy}px)`;
  }

  function stop(){

    active=false;
    joyX=0;
    joyY=0;

    stick.style.transform=
      "translate(0,0)";
  }

  base.addEventListener(
    "touchstart",
    e=>{
      active=true;
      move(e);
    },
    {passive:false}
  );

  base.addEventListener(
    "touchmove",
    e=>{
      e.preventDefault();
      move(e);
    },
    {passive:false}
  );

  base.addEventListener(
    "touchend",
    stop
  );

  base.addEventListener(
    "touchcancel",
    stop
  );
}


/* =========================
   FREE LOOK
========================= */

function setupLook(){

  let active=false;
  let lastX=0;
  let lastY=0;

  renderer.domElement.addEventListener(
    "touchstart",
    e=>{

      const t=e.touches[0];

      if(
        t.clientX>
        window.innerWidth*.35
      ){

        active=true;

        lastX=t.clientX;
        lastY=t.clientY;
      }
    },
    {passive:true}
  );

  renderer.domElement.addEventListener(
    "touchmove",
    e=>{

      if(!active)return;

      const t=e.touches[0];

      const dx=t.clientX-lastX;
      const dy=t.clientY-lastY;

      yaw-=dx*.006;
      pitch-=dy*.006;

      pitch=
        THREE.MathUtils.clamp(
          pitch,
          -1.48,
          1.48
        );

      lastX=t.clientX;
      lastY=t.clientY;
    },
    {passive:true}
  );

  renderer.domElement.addEventListener(
    "touchend",
    ()=>{
      active=false;
    }
  );
}


/* =========================
   BUTTONS
========================= */

function setupButtons(){

  const jump=
    document.getElementById("jump");

  const run=
    document.getElementById("run");

  jump.addEventListener(
    "touchstart",
    e=>{
      e.preventDefault();

      if(onGround){

        jumpVelocity=9;
        onGround=false;
      }
    },
    {passive:false}
  );

  run.addEventListener(
    "touchstart",
    e=>{
      e.preventDefault();
      running=true;
    },
    {passive:false}
  );

  run.addEventListener(
    "touchend",
    ()=>{
      running=false;
    }
  );

  run.addEventListener(
    "touchcancel",
    ()=>{
      running=false;
    }
  );
}


/* =========================
   PLAYER UPDATE
========================= */

function updatePlayer(dt){

  let x=joyX;
  let z=joyY;

  if(keys.KeyA || keys.ArrowLeft)x-=1;
  if(keys.KeyD || keys.ArrowRight)x+=1;
  if(keys.KeyW || keys.ArrowUp)z-=1;
  if(keys.KeyS || keys.ArrowDown)z+=1;

  const len=Math.hypot(x,z);

  if(len>1){
    x/=len;
    z/=len;
  }

  const moving=
    Math.hypot(x,z)>.08;

  const speed=
    running ? 13 : 6.5;

  /* CAMERA BASED MOVEMENT */

  const c=Math.cos(yaw);
  const s=Math.sin(yaw);

  const mx=
    x*c+z*s;

  const mz=
    -x*s+z*c;

  player.position.x+=
    mx*speed*dt;

  player.position.z+=
    mz*speed*dt;

  if(moving){

    player.rotation.y=
      Math.atan2(mx,mz);

    walkTime+=
      dt*(running?15:9);

    const swing=
      Math.sin(walkTime)*
      (running?.65:.42);

    leftLeg.rotation.x=swing;
    rightLeg.rotation.x=-swing;

  }else{

    leftLeg.rotation.x=
      THREE.MathUtils.lerp(
        leftLeg.rotation.x,
        0,
        dt*10
      );

    rightLeg.rotation.x=
      THREE.MathUtils.lerp(
        rightLeg.rotation.x,
        0,
        dt*10
      );
  }

  /* JUMP PHYSICS */

  if(!onGround){

    jumpVelocity-=24*dt;

    player.position.y+=
      jumpVelocity*dt;

    if(player.position.y<=0){

      player.position.y=0;
      jumpVelocity=0;
      onGround=true;
    }
  }

  /* MAP LIMIT */

  player.position.x=
    THREE.MathUtils.clamp(
      player.position.x,
      -165,165
    );

  player.position.z=
    THREE.MathUtils.clamp(
      player.position.z,
      -165,165
    );

  /* GATE */

  const gd=
    Math.hypot(
      player.position.x,
      player.position.z-112
    );

  const open=gd<24;

  const gap=open?6:0;

  gateLeft.forEach(g=>{
    g.position.x=
      THREE.MathUtils.lerp(
        g.position.x,
        -10-gap,
        dt*7
      );
  });

  gateRight.forEach(g=>{
    g.position.x=
      THREE.MathUtils.lerp(
        g.position.x,
        10+gap,
        dt*7
      );
  });
}


/* =========================
   CAMERA
========================= */

function updateCamera(dt){

  const distance=9;

  const horizontal=
    Math.cos(pitch)*distance;

  const vertical=
    Math.sin(pitch)*distance;

  const cx=
    player.position.x+
    Math.sin(yaw)*horizontal;

  const cy=
    player.position.y+
    2.8+
    vertical;

  const cz=
    player.position.z+
    Math.cos(yaw)*horizontal;

  camera.position.lerp(
    new THREE.Vector3(
      cx,cy,cz
    ),
    Math.min(1,dt*8)
  );

  camera.lookAt(
    player.position.x,
    player.position.y+1.5,
    player.position.z
  );
}


/* =========================
   LOCATION
========================= */

function location(){

  const x=player.position.x;
  const z=player.position.z;

  let text="Main Campus";

  if(
    z<-35 &&
    Math.abs(x)<35
  ){
    text="Main College";
  }
  else if(
    z>30 &&
    x<-55
  ){
    text="CSA Boys Hostel";
  }
  else if(
    z>30 &&
    x>55
  ){
    text="Girls Hostel";
  }
  else if(
    z>25 &&
    Math.abs(x)<30
  ){
    text="Sports Area";
  }

  document.getElementById(
    "place"
  ).textContent=text;
}


/* =========================
   INIT
========================= */

function init(){

  scene=new THREE.Scene();

  scene.background=
    new THREE.Color(0x80c8e8);

  scene.fog=
    new THREE.Fog(
      0x80c8e8,
      120,
      350
    );

  camera=
    new THREE.PerspectiveCamera(
      70,
      innerWidth/innerHeight,
      .1,
      600
    );

  renderer=
    new THREE.WebGLRenderer({
      antialias:false,
      powerPreference:"high-performance"
    });

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      1.5
    )
  );

  renderer.shadowMap.enabled=true;

  document.body.appendChild(
    renderer.domElement
  );

  /* LIGHT */

  scene.add(
    new THREE.HemisphereLight(
      0xe5f6ff,
      0x557548,
      2.4
    )
  );

  const sun=
    new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

  sun.position.set(
    80,130,70
  );

  sun.castShadow=true;

  scene.add(sun);

  /* WORLD */

  createGround();
  createRoads();
  createCollege();
  createHostels();
  createGate();
  createGarden();
  createSports();
  createPlayer();

  /* CONTROLS */

  setupKeyboard();
  setupJoystick();
  setupLook();
  setupButtons();

  addEventListener(
    "resize",
    resize
  );

  animate();
}


/* =========================
   RESIZE
========================= */

function resize(){

  camera.aspect=
    innerWidth/innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
}


/* =========================
   LOOP
========================= */

function animate(){

  requestAnimationFrame(
    animate
  );

  const dt=
    Math.min(
      clock.getDelta(),
      .05
    );

  updatePlayer(dt);
  updateCamera(dt);
  location();

  renderer.render(
    scene,
    camera
  );
}


/* =========================
   START
========================= */

init();
