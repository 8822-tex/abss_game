import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================================
   ABSS MAP — fresh base
   Low-poly realistic campus style + free camera look
   ========================================================= */

let scene, camera, renderer, player;
let leftLeg, rightLeg;
let velocityY = 0;
let onGround = true;
let running = false;
let walkCycle = 0;
let cameraYaw = 0;
let cameraPitch = -0.12;
let lookActive = false;
let lastLookX = 0;
let lastLookY = 0;
let gateLeft, gateRight;
let gateOpen = false;

const clock = new THREE.Clock();
const keys = {forward:false, backward:false, left:false, right:false};
const joystick = {x:0,y:0,active:false};

const tmp = new THREE.Vector3();

init();
animate();

function mat(color, roughness=.82, metalness=0){
  return new THREE.MeshStandardMaterial({color,roughness,metalness});
}

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x83b9d8);
  scene.fog = new THREE.Fog(0x83b9d8,150,500);

  camera = new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,700);
  camera.position.set(0,5,14);

  renderer = new THREE.WebGLRenderer({antialias:false,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xeaf7ff,0x3f5d35,2.0));
  const sun = new THREE.DirectionalLight(0xfff2d8,2.5);
  sun.position.set(120,160,80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-190; sun.shadow.camera.right=190;
  sun.shadow.camera.top=190; sun.shadow.camera.bottom=-190;
  scene.add(sun);

  createGround();
  createRoads();
  createMainGate();
  createAcademicBlocks();
  createHostels();
  createGardens();
  createSports();
  createParking();
  createTrees();
  createPlayer();
  setupKeyboard();
  setupJoystick();
  setupLook();
  setupButtons();
  addWorldBoundary();
  addEventListener("resize",resize);

  setTimeout(()=>document.getElementById("loading")?.classList.add("hide"),450);
}

function createGround(){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),mat(0x4f8147));
  ground.rotation.x=-Math.PI/2;
  ground.receiveShadow=true;
  scene.add(ground);

  for(let i=0;i<45;i++){
    const patch=new THREE.Mesh(new THREE.CircleGeometry(2.5+(i%4),8),mat(i%2?0x5b8d4e:0x47783f));
    const x=((i*47)%280)-140, z=((i*83)%260)-130;
    patch.rotation.x=-Math.PI/2;
    patch.position.set(x,.015,z);
    scene.add(patch);
  }
}

function road(x,z,w,d,color=0x55585b){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,.10,d),mat(color));
  m.position.set(x,.05,z); m.receiveShadow=true; scene.add(m); return m;
}

function createRoads(){
  road(0,25,18,290);
  road(0,-50,300,18);
  road(0,108,300,16);
  road(-108,20,14,250);
  road(108,20,14,250);
  road(0,-12,8,55,0xb8b2a6);
  road(0,55,8,55,0xb8b2a6);
}

function board(text,width=8){
  const c=document.createElement("canvas"); c.width=900;c.height=140;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#f0eee8";ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle="#8e2e2e";ctx.font="bold 48px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(text,c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,width*.155),new THREE.MeshBasicMaterial({map:t}));
}

function createBuilding(x,z,w,d,floors,name){
  const h=floors*4.1;
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(0xa94739));
  body.position.set(x,h/2,z);body.castShadow=true;body.receiveShadow=true;scene.add(body);

  for(let f=1;f<floors;f++){
    const band=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.20,d+.18),mat(0xf0eee8));
    band.position.set(x,f*4.1,z);scene.add(band);
  }

  const roof=new THREE.Mesh(new THREE.BoxGeometry(w+1,.35,d+1),mat(0x7f2a2a));
  roof.position.set(x,h+.18,z);roof.castShadow=true;scene.add(roof);
  windows(x,z,w,d,floors);
  const b=board(name,Math.min(10,w*.2));b.position.set(x,h-1.1,z-d/2-.08);scene.add(b);
}

function windows(x,z,w,d,floors){
  const glass=mat(0x79b4c6,.18,.08), frame=mat(0xf0eee8);
  const count=Math.max(4,Math.floor(w/4.2));
  for(let f=0;f<floors;f++){
    const y=1.65+f*4.1;
    for(let i=0;i<count;i++){
      const px=x-w/2+2.2+i*((w-4.4)/Math.max(1,count-1));
      const win=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.55,.08),glass);
      win.position.set(px,y,z-d/2-.07);scene.add(win);
      const v=new THREE.Mesh(new THREE.BoxGeometry(.07,1.72,.12),frame);
      v.position.set(px,y,z-d/2-.12);scene.add(v);
    }
  }
}

function createAcademicBlocks(){
  createBuilding(0,-75,58,30,4,"ABSS INSTITUTE OF TECHNOLOGY");
  createBuilding(-62,-58,42,27,4,"MAHATMA GANDHI BLOCK");
  createBuilding(62,-58,42,27,4,"VISHVESVARAYA BLOCK");

  const white=mat(0xf0eee8), glass=mat(0x83c0d3,.15,.05);
  for(const x of [-20,20]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(2.4,9,2.4),white);
    p.position.set(x,4.5,-91);p.castShadow=true;scene.add(p);
  }

  const roof=new THREE.Mesh(new THREE.BoxGeometry(48,1.2,8),mat(0x922e2e));
  roof.position.set(0,9,-91);roof.castShadow=true;scene.add(roof);

  const front=new THREE.Mesh(new THREE.BoxGeometry(17,6,.22),glass);
  front.position.set(0,3.2,-90.35);scene.add(front);
  const sign=board("ABSS",6);sign.position.set(0,5.4,-90.5);scene.add(sign);
}

function createHostel(x,z,name){
  createBuilding(x,z,40,27,4,name);
  const entrance=new THREE.Mesh(new THREE.BoxGeometry(7,3.2,.6),mat(0x6e3329));
  entrance.position.set(x,1.6,z-13.7);entrance.castShadow=true;scene.add(entrance);
  const canopy=new THREE.Mesh(new THREE.BoxGeometry(10,.55,4),mat(0xe7e2d8));
  canopy.position.set(x,4,z-15);scene.add(canopy);
}

function createHostels(){
  createHostel(-78,65,"CSA BOYS HOSTEL");
  createHostel(78,65,"GIRLS HOSTEL");
}

function createMainGate(){
  const brick=mat(0x8f4030), dark=mat(0x603025), white=mat(0xf0eee8), metal=mat(0x5b514c,.35,.7);
  for(const x of [-13,13]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(4,8,4),brick);p.position.set(x,4,108);p.castShadow=true;scene.add(p);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(4.5,.45,4.5),white);cap.position.set(x,8.2,108);scene.add(cap);
    const base=new THREE.Mesh(new THREE.BoxGeometry(4.3,.7,4.3),dark);base.position.set(x,.35,108);scene.add(base);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshStandardMaterial({color:0xffd66b,emissive:0xffa000,emissiveIntensity:1.4}));lamp.position.set(x,8.75,108);scene.add(lamp);
  }

  const top=new THREE.Mesh(new THREE.BoxGeometry(25,1.2,1.3),brick);top.position.set(0,7.3,108);top.castShadow=true;scene.add(top);
  const s=board("ABSS INSTITUTE OF TECHNOLOGY",11);s.position.set(0,6.05,107.25);scene.add(s);

  gateLeft=new THREE.Group();gateRight=new THREE.Group();
  buildGatePanel(gateLeft,-1);buildGatePanel(gateRight,1);
  gateLeft.position.set(0,2.4,106.7);gateRight.position.set(0,2.4,106.7);
  scene.add(gateLeft,gateRight);
  road(0,118,28,18,0x646567);
}

function buildGatePanel(group,side){
  const panel=new THREE.Mesh(new THREE.BoxGeometry(11,4.8,.35),mat(0x4c3228));
  panel.position.x=side*5.5;panel.castShadow=true;group.add(panel);
  for(let i=0;i<7;i++){
    const bar=new THREE.Mesh(new THREE.BoxGeometry(.18,4.8,.45),mat(0x6e6862,.3,.7));
    bar.position.set(side*(i*1.55+1),0,0);group.add(bar);
  }
}

function createGardens(){
  const lawn=new THREE.Mesh(new THREE.BoxGeometry(78,.08,32),mat(0x58894a));lawn.position.set(0,.04,-12);scene.add(lawn);
  for(let x=-36;x<=36;x+=6){bush(x,-29);bush(x,4)}
  for(let x=-25;x<=25;x+=10)flower(x,-15);
}

function bush(x,z){
  const b=new THREE.Mesh(new THREE.SphereGeometry(1.25,8,6),mat(0x2f6d36));
  b.position.set(x,.9,z);b.scale.y=.7;b.castShadow=true;scene.add(b)
}

function flower(x,z){
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.45,5),mat(0x2d6a35));
  stem.position.set(x,.22,z);scene.add(stem);
  const f=new THREE.Mesh(new THREE.SphereGeometry(.16,6,5),mat(0xe6c85a));
  f.position.set(x,.48,z);scene.add(f);
}

function createSports(){
  const field=new THREE.Mesh(new THREE.BoxGeometry(58,.08,36),mat(0x3f7841));field.position.set(70,.04,105);scene.add(field);
  const court=new THREE.Mesh(new THREE.BoxGeometry(32,.10,20),mat(0x3d789e));court.position.set(70,.09,105);scene.add(court);
  const line=mat(0xf3f0e8);
  for(const x of [54,86]){const l=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,20),line);l.position.set(x,.16,105);scene.add(l)}
  for(const z of [95,115]){const l=new THREE.Mesh(new THREE.BoxGeometry(32,.03,.16),line);l.position.set(70,.16,z);scene.add(l)}
}

function createParking(){
  const p=road(-75,20,46,26,0x686a6b);
  for(let x=-95;x<=-55;x+=5){
    const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.03,20),mat(0xe7e7e7));
    l.position.set(x,.1,20);scene.add(l)
  }
}

function createTree(x,z,s=1){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.32*s,.46*s,3*s,8),mat(0x68442e));
  trunk.position.set(x,1.5*s,z);trunk.castShadow=true;scene.add(trunk);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(2*s,10,8),mat(0x2d6834));
  crown.position.set(x,3.65*s,z);crown.castShadow=true;scene.add(crown);
}

function createTrees(){
  const p=[[-120,-95],[-105,-82],[-90,-105],[90,-105],[108,-88],[122,-100],[-120,20],[-115,55],[-115,95],[115,20],[115,55],[115,95],[-48,110],[48,110],[-35,35],[35,35]];
  p.forEach((v,i)=>createTree(v[0],v[1],i%3===0?1.3:1));
}

function createPlayer(){
  player=new THREE.Group();
  const shirt=new THREE.Mesh(new THREE.BoxGeometry(1,.9,.58),mat(0xf3f3f3));shirt.position.y=1.7;shirt.castShadow=true;player.add(shirt);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.52,1.35,4,8),mat(0xeeeeee));body.position.y=1.5;body.castShadow=true;player.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.43,14,10),mat(0xd89b72));head.position.y=2.65;head.castShadow=true;player.add(head);
  const legMat=mat(0x20252b);
  leftLeg=new THREE.Mesh(new THREE.BoxGeometry(.35,1.1,.4),legMat);
  rightLeg=leftLeg.clone();
  leftLeg.position.set(-.22,.55,0);rightLeg.position.set(.22,.55,0);
  leftLeg.castShadow=true;rightLeg.castShadow=true;player.add(leftLeg,rightLeg);
  player.position.set(0,0,92);scene.add(player);
}

function setupKeyboard(){
  addEventListener("keydown",e=>{
    if(["KeyW","ArrowUp"].includes(e.code))keys.forward=true;
    if(["KeyS","ArrowDown"].includes(e.code))keys.backward=true;
    if(["KeyA","ArrowLeft"].includes(e.code))keys.left=true;
    if(["KeyD","ArrowRight"].includes(e.code))keys.right=true;
    if(["ShiftLeft","ShiftRight"].includes(e.code))running=true;
    if(e.code==="Space")jump();
  });
  addEventListener("keyup",e=>{
    if(["KeyW","ArrowUp"].includes(e.code))keys.forward=false;
    if(["KeyS","ArrowDown"].includes(e.code))keys.backward=false;
    if(["KeyA","ArrowLeft"].includes(e.code))keys.left=false;
    if(["KeyD","ArrowRight"].includes(e.code))keys.right=false;
    if(["ShiftLeft","ShiftRight"].includes(e.code))running=false;
  });
}

function setupJoystick(){
  const base=document.getElementById("joystick"),stick=document.getElementById("stick");
  const move=(px,py)=>{
    const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width/2-14;
    let dx=px-cx,dy=py-cy,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}
    stick.style.transform=`translate(${dx}px,${dy}px)`;joystick.x=dx/max;joystick.y=dy/max;
  };
  const reset=()=>{joystick.active=false;joystick.x=0;joystick.y=0;stick.style.transform="translate(0,0)"};
  base.addEventListener("pointerdown",e=>{joystick.active=true;base.setPointerCapture(e.pointerId);move(e.clientX,e.clientY)});
  base.addEventListener("pointermove",e=>{if(joystick.active)move(e.clientX,e.clientY)});
  base.addEventListener("pointerup",reset);base.addEventListener("pointercancel",reset);
}

function setupLook(){
  const area=document.getElementById("lookArea");
  area.addEventListener("pointerdown",e=>{lookActive=true;lastLookX=e.clientX;lastLookY=e.clientY;area.setPointerCapture(e.pointerId)});
  area.addEventListener("pointermove",e=>{
    if(!lookActive)return;
    const dx=e.clientX-lastLookX,dy=e.clientY-lastLookY;lastLookX=e.clientX;lastLookY=e.clientY;
    cameraYaw-=dx*.006;cameraPitch-=dy*.004;cameraPitch=THREE.MathUtils.clamp(cameraPitch,-1.05,.8);
  });
  const stop=()=>lookActive=false;area.addEventListener("pointerup",stop);area.addEventListener("pointercancel",stop);
}

function setupButtons(){
  document.getElementById("jumpBtn").addEventListener("pointerdown",e=>{e.preventDefault();jump()});
  const run=document.getElementById("runBtn");
  run.addEventListener("pointerdown",e=>{e.preventDefault();running=true});
  run.addEventListener("pointerup",()=>running=false);run.addEventListener("pointercancel",()=>running=false);run.addEventListener("pointerleave",()=>running=false);
}

function jump(){if(onGround){velocityY=7.5;onGround=false}}

function updatePlayer(dt){
  let x=0,z=0;
  if(keys.left)x-=1;if(keys.right)x+=1;if(keys.forward)z-=1;if(keys.backward)z+=1;
  if(Math.abs(joystick.x)>.08||Math.abs(joystick.y)>.08){x=joystick.x;z=joystick.y}
  const len=Math.hypot(x,z);if(len>1){x/=len;z/=len}
  const moving=Math.abs(x)>.08||Math.abs(z)>.08;
  const speed=running?13:6.5;

  player.position.x+=x*speed*dt;player.position.z+=z*speed*dt;
  player.position.x=THREE.MathUtils.clamp(player.position.x,-145,145);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-140,140);

  if(moving){
    const target=Math.atan2(x,z);
    player.rotation.y=THREE.MathUtils.lerp(player.rotation.y,target,.18);
  }

  if(moving&&onGround){
    walkCycle+=dt*(running?15:9);
    const swing=Math.sin(walkCycle)*(running?.65:.42);
    leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;
    leftLeg.rotation.z=Math.sin(walkCycle*.5)*.04;rightLeg.rotation.z=-Math.sin(walkCycle*.5)*.04;
  }else{
    const k=Math.min(1,dt*10);
    leftLeg.rotation.x=THREE.MathUtils.lerp(leftLeg.rotation.x,0,k);rightLeg.rotation.x=THREE.MathUtils.lerp(rightLeg.rotation.x,0,k);
    leftLeg.rotation.z=THREE.MathUtils.lerp(leftLeg.rotation.z,0,k);rightLeg.rotation.z=THREE.MathUtils.lerp(rightLeg.rotation.z,0,k);
  }

  velocityY-=18*dt;player.position.y+=velocityY*dt;
  if(player.position.y<=0){player.position.y=0;velocityY=0;onGround=true}

  updateGate();
}

function updateGate(){
  if(!gateLeft||!gateRight)return;
  const near=player.position.z>96&&player.position.z<122&&Math.abs(player.position.x)<22;
  if(near!==gateOpen)gateOpen=near;
  const target=gateOpen?9:0;
  gateLeft.position.x=THREE.MathUtils.lerp(gateLeft.position.x,-target,.09);
  gateRight.position.x=THREE.MathUtils.lerp(gateRight.position.x,target,.09);
}

function updateCamera(dt){
  const distance=9;
  const horizontal=Math.cos(cameraPitch)*distance;
  const targetX=player.position.x+Math.sin(cameraYaw)*horizontal;
  const targetZ=player.position.z+Math.cos(cameraYaw)*horizontal;
  const targetY=player.position.y+2.8+Math.sin(cameraPitch)*distance;
  tmp.set(targetX,targetY,targetZ);
  camera.position.lerp(tmp,Math.min(1,dt*7));
  camera.lookAt(player.position.x,player.position.y+1.55,player.position.z);
}

function addWorldBoundary(){
  const b=new THREE.Mesh(new THREE.BoxGeometry(300,.4,2),mat(0x5a4638));
  b.position.set(0,.2,-150);scene.add(b);
  const b2=b.clone();b2.position.z=150;scene.add(b2);
}

function resize(){
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))
}

function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  updatePlayer(dt);
  updateCamera(dt);
  renderer.render(scene,camera)
}
