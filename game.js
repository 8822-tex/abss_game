// ============================================
// ABSS MAP - GAME ENGINE
// ============================================

import * as THREE from "three";

// --------------------------------------------
// BASIC GAME SETUP
// --------------------------------------------

const game = document.getElementById("game");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

// --------------------------------------------
// CAMERA
// --------------------------------------------

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 5, 12);

// --------------------------------------------
// RENDERER
// --------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

game.appendChild(renderer.domElement);

// --------------------------------------------
// LIGHTING
// --------------------------------------------

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(50, 100, 50);

sunlight.castShadow = true;

scene.add(sunlight);


const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambientLight);

// --------------------------------------------
// TEMPORARY GROUND
// --------------------------------------------

const groundGeometry =
    new THREE.PlaneGeometry(200, 200);

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4d8f45
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// --------------------------------------------
// TEMPORARY ABSS BUILDING
// --------------------------------------------

const buildingGeometry =
    new THREE.BoxGeometry(25, 12, 18);

const buildingMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb94a3a
    });

const building =
    new THREE.Mesh(
        buildingGeometry,
        buildingMaterial
    );

building.position.set(
    0,
    6,
    -25
);

building.castShadow = true;
building.receiveShadow = true;

scene.add(building);

// --------------------------------------------
// SIMPLE PLAYER
// --------------------------------------------

const playerGeometry =
    new THREE.CapsuleGeometry(
        0.5,
        1.2,
        8,
        16
    );

const playerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xeeeeee
    });

const player =
    new THREE.Mesh(
        playerGeometry,
        playerMaterial
    );

player.position.set(
    0,
    1.1,
    5
);

player.castShadow = true;

scene.add(player);

// --------------------------------------------
// KEYBOARD MOVEMENT
// --------------------------------------------

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {
        keys[event.key.toLowerCase()] = true;
    }
);

window.addEventListener(
    "keyup",
    (event) => {
        keys[event.key.toLowerCase()] = false;
    }
);

// --------------------------------------------
// PLAYER MOVEMENT
// --------------------------------------------

const walkSpeed = 0.08;

function updatePlayer() {

    if (keys["w"] || keys["arrowup"]) {
        player.position.z -= walkSpeed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        player.position.z += walkSpeed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        player.position.x -= walkSpeed;
    }

    if (keys["d"] || keys["arrowright"]) {
        player.position.x += walkSpeed;
    }

    // Camera follows player
    camera.position.x =
        player.position.x;

    camera.position.z =
        player.position.z + 12;

    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );
}

// --------------------------------------------
// RESIZE
// --------------------------------------------

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

// --------------------------------------------
// GAME LOOP
// --------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    updatePlayer();

    renderer.render(
        scene,
        camera
    );
}

animate();

console.log("ABSS Map Game Engine Started");
