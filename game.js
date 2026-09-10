/* =========================================
   ABSS MAP
   GAME ENGINE
   ========================================= */


"use strict";


// =========================================
// CHECK THREE.JS
// =========================================

if (typeof THREE === "undefined") {

    document.getElementById("loading").style.display =
        "none";

    const errorBox =
        document.getElementById("error");

    errorBox.style.display = "block";

    errorBox.textContent =
        "Three.js load bhayena. Internet connection check gara.";

    throw new Error(
        "Three.js was not loaded."
    );
}


// =========================================
// ELEMENTS
// =========================================

const game =
    document.getElementById("game");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");


// =========================================
// ERROR FUNCTION
// =========================================

function showError(message) {

    loading.style.display = "none";

    errorBox.style.display = "block";

    errorBox.textContent =
        "Game Error: " + message;

    console.error(message);
}


// =========================================
// SCENE
// =========================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// =========================================
// CAMERA
// =========================================

const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
        window.innerHeight,
        0.1,
        2000
    );

camera.position.set(
    0,
    6,
    12
);


// =========================================
// RENDERER
// =========================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

game.appendChild(
    renderer.domElement
);


// =========================================
// SUN
// =========================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    50,
    100,
    50
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

scene.add(sun);


// =========================================
// AMBIENT LIGHT
// =========================================

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        1
    );

scene.add(ambient);


// =========================================
// GROUND
// =========================================

const groundGeometry =
    new THREE.PlaneGeometry(
        200,
        200
    );

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4d8f45
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// =========================================
// TEMPORARY BUILDING
// =========================================

const buildingGeometry =
    new THREE.BoxGeometry(
        25,
        12,
        18
    );

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


// =========================================
// TEMPORARY PLAYER
// =========================================

const playerGeometry =
    new THREE.CapsuleGeometry(
        0.5,
        1.2,
        8,
        16
    );

const playerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff
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


// =========================================
// KEYBOARD
// =========================================

const keys = {};

window.addEventListener(
    "keydown",
    function (event) {

        keys[
            event.key.toLowerCase()
        ] = true;

    }
);


window.addEventListener(
    "keyup",
    function (event) {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


// =========================================
// PLAYER MOVEMENT
// =========================================

function updatePlayer() {

    const speed = 0.08;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        player.position.z -= speed;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        player.position.z += speed;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        player.position.x -= speed;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        player.position.x += speed;

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


// =========================================
// RESIZE
// =========================================

window.addEventListener(
    "resize",
    function () {

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


// =========================================
// GAME LOOP
// =========================================

function animate() {

    requestAnimationFrame(
        animate
    );

    updatePlayer();

    renderer.render(
        scene,
        camera
    );
}


// =========================================
// START
// =========================================

try {

    animate();

    // Game successfully started

    loading.style.display =
        "none";

    console.log(
        "ABSS Map started successfully."
    );

} catch (error) {

    showError(
        error.message
    );

}
