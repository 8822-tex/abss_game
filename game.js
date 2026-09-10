"use strict";

(function () {
    if (typeof THREE === "undefined") {
        const loading = document.getElementById("loadingScreen");
        const error = document.getElementById("error");

        if (loading) loading.style.display = "none";

        if (error) {
            error.style.display = "flex";
            error.innerHTML =
                "<div><h2>Three.js could not load</h2>" +
                "<p>Check your internet connection and reload the page.</p></div>";
        }

        return;
    }

    const canvas = document.getElementById("gameCanvas");
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingProgress = document.getElementById("loadingProgress");

    const accountScreen = document.getElementById("accountScreen");
    const characterSetupScreen = document.getElementById("characterSetupScreen");
    const loginScreen = document.getElementById("loginScreen");
    const gameUI = document.getElementById("gameUI");

    const gameMenu = document.getElementById("gameMenu");
    const settingsScreen = document.getElementById("settingsScreen");
    const mapScreen = document.getElementById("mapScreen");
    const missionsScreen = document.getElementById("missionsScreen");

    const playerNameInput = document.getElementById("playerName");
    const playerPasswordInput = document.getElementById("playerPassword");
    const loginPasswordInput = document.getElementById("loginPassword");

    const savedPlayerName = document.getElementById("savedPlayerName");
    const playerNameDisplay = document.getElementById("playerNameDisplay");
    const loginError = document.getElementById("loginError");

    const lookArea = document.getElementById("lookArea");
    const joystickBase = document.getElementById("joystickBase");
    const joystickStick = document.getElementById("joystickStick");

    const jumpButton = document.getElementById("jumpButton");
    const runButton = document.getElementById("runButton");
    const interactButton = document.getElementById("interactButton");

    const menuButton = document.getElementById("menuButton");
    const resumeButton = document.getElementById("resumeButton");

    const settingsButton = document.getElementById("settingsButton");
    const closeSettingsButton = document.getElementById("closeSettingsButton");

    const mapButton = document.getElementById("mapButton");
    const closeMapButton = document.getElementById("closeMapButton");

    const missionButton = document.getElementById("missionButton");
    const closeMissionsButton = document.getElementById("closeMissionsButton");

    const logoutButton = document.getElementById("logoutButton");

    const cameraSensitivity =
        document.getElementById("cameraSensitivity");

    const playerNameDisplayElement =
        document.getElementById("playerNameDisplay");

    const createAccountButton =
        document.getElementById("createAccountButton");

    const generateCharacterButton =
        document.getElementById("generateCharacterButton");

    const loginButton =
        document.getElementById("loginButton");

    const facePhoto =
        document.getElementById("facePhoto");

    const maleButton =
        document.getElementById("maleButton");

    const femaleButton =
        document.getElementById("femaleButton");

    const missionText =
        document.getElementById("missionText");

    const destinationDistance =
        document.getElementById("destinationDistance");

    const interactionMessage =
        document.getElementById("interactionMessage");

    const interactionText =
        document.getElementById("interactionText");

    const navigationArrow =
        document.getElementById("navigationArrow");

    /* =====================================================
       THREE.JS
       ===================================================== */

    const scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x87ceeb);

    scene.fog =
        new THREE.Fog(0x87ceeb, 90, 430);

    const camera =
        new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            700
        );

    const renderer =
        new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    /* =====================================================
       LIGHT
       ===================================================== */

    const hemi =
        new THREE.HemisphereLight(
            0xffffff,
            0x3d5136,
            1.7
        );

    scene.add(hemi);

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            2.2
        );

    sun.position.set(80, 120, 70);
    sun.castShadow = true;

    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;

    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = 180;
    sun.shadow.camera.bottom = -180;

    scene.add(sun);

    /* =====================================================
       VARIABLES
       ===================================================== */

    const colliders = [];
    const doors = [];
    const animatedTrees = [];

    const keys = Object.create(null);

    let player;
    let playerBody;
    let playerHead;
    let leftLeg;
    let rightLeg;
    let leftArm;
    let rightArm;

    let selectedGender = "male";

    let isRunning = false;
    let touchRun = false;

    let isGrounded = true;
    let verticalVelocity = 0;

    let walkCycle = 0;

    /*
       IMPORTANT:

       cameraYaw has NO horizontal limit.

       This gives TRUE 360° horizontal rotation.
    */

    let cameraYaw = 0;

    /*
       Nearly straight up/down.
       Only vertical flip is prevented.
    */

    let cameraPitch = -0.12;

    let lookPointerId = null;
    let lookLastX = 0;
    let lookLastY = 0;

    let joystickPointerId = null;

    let joystickX = 0;
    let joystickY = 0;

    let paused = false;

    let interactTarget = null;

    let currentMission = "Main Gate";

    let lastTime = performance.now();

    const cameraDistance = 8.5;
    const cameraTargetHeight = 1.65;

    /* =====================================================
       MATERIALS
       ===================================================== */

    const mats = {

        grass:
            new THREE.MeshStandardMaterial({
                color: 0x4f843f,
                roughness: 1
            }),

        road:
            new THREE.MeshStandardMaterial({
                color: 0x666a6e,
                roughness: 0.9
            }),

        red:
            new THREE.MeshStandardMaterial({
                color: 0xa94337,
                roughness: 0.85
            }),

        redDark:
            new THREE.MeshStandardMaterial({
                color: 0x843329,
                roughness: 0.9
            }),

        white:
            new THREE.MeshStandardMaterial({
                color: 0xf2f2ed,
                roughness: 0.8
            }),

        glass:
            new THREE.MeshStandardMaterial({
                color: 0x6ca8c9,
                metalness: 0.15,
                roughness: 0.2,
                transparent: true,
                opacity: 0.72
            }),

        dark:
            new THREE.MeshStandardMaterial({
                color: 0x20262c,
                roughness: 0.8
            }),

        green:
            new THREE.MeshStandardMaterial({
                color: 0x2e6b35,
                roughness: 1
            }),

        trunk:
            new THREE.MeshStandardMaterial({
                color: 0x65462c,
                roughness: 1
            }),

        gate:
            new THREE.MeshStandardMaterial({
                color: 0x31363b,
                metalness: 0.35,
                roughness: 0.55
            })
    };

    /* =====================================================
       BASIC BOX
       ===================================================== */

    function box(
        w,
        h,
        d,
        material,
        x,
        y,
        z,
        parent
    ) {
        const mesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                material
            );

        mesh.position.set(
            x || 0,
            y || 0,
            z || 0
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        (parent || scene).add(mesh);

        return mesh;
    }

    /* =====================================================
       COLLIDER
       ===================================================== */

    function addCollider(
        x,
        z,
        w,
        d,
        minY,
        maxY
    ) {
        colliders.push({
            minX: x - w / 2,
            maxX: x + w / 2,
            minZ: z - d / 2,
            maxZ: z + d / 2,
            minY: minY || 0,
            maxY: maxY || 20
        });
    }

    /* =====================================================
       GROUND
       ===================================================== */

    function createGround() {

        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(500, 500),
                mats.grass
            );

        ground.rotation.x = -Math.PI / 2;

        ground.receiveShadow = true;

        scene.add(ground);

        box(
            28,
            0.06,
            190,
            mats.road,
            0,
            0.03,
            0
        );

        box(
            190,
            0.06,
            18,
            mats.road,
            0,
            0.04,
            -8
        );

        box(
            120,
            0.06,
            10,
            mats.road,
            0,
            0.05,
            55
        );

        box(
            10,
            0.06,
            95,
            mats.road,
            -62,
            0.05,
            50
        );

        box(
            10,
            0.06,
            95,
            mats.road,
            62,
            0.05,
            50
        );
    }

    /* =====================================================
       BUILDINGS
       ===================================================== */

    function createBuilding(
        name,
        x,
        z,
        width,
        depth,
        floors,
        withGlassEntrance
    ) {

        const group =
            new THREE.Group();

        group.position.set(x, 0, z);

        scene.add(group);

        const floorHeight = 3.2;
        const totalHeight =
            floors * floorHeight;

        box(
            width,
            totalHeight,
            depth,
            mats.red,
            0,
            totalHeight / 2,
            0,
            group
        );

        for (
            let f = 1;
            f < floors;
            f++
        ) {

            box(
                width + 0.15,
                0.16,
                depth + 0.15,
                mats.white,
                0,
                f * floorHeight,
                0,
                group
            );
        }

        const columns =
            Math.max(
                4,
                Math.floor(width / 5)
            );

        const windowW =
            Math.min(
                2.4,
                width / columns - 0.5
            );

        const frontZ =
            -depth / 2 - 0.03;

        for (
            let f = 0;
            f < floors;
            f++
        ) {

            for (
                let c = 0;
                c < columns;
                c++
            ) {

                const wx =
                    -width / 2 +
                    (c + 0.5) *
                    (width / columns);

                box(
                    windowW,
                    1.35,
                    0.08,
                    mats.glass,
                    wx,
                    1.25 +
                        f * floorHeight,
                    frontZ,
                    group
                );
            }
        }

        for (
            let f = 0;
            f < floors;
            f++
        ) {

            box(
                width + 0.35,
                0.13,
                1.1,
                mats.white,
                0,
                0.18 +
                    f * floorHeight,
                depth / 2 + 0.35,
                group
            );
        }

        if (withGlassEntrance) {

            box(
                5.8,
                3.5,
                0.18,
                mats.glass,
                0,
                1.75,
                -depth / 2 - 0.16,
                group
            );

            box(
                0.18,
                3.6,
                0.3,
                mats.dark,
                -3,
                1.8,
                -depth / 2 - 0.2,
                group
            );

            box(
                0.18,
                3.6,
                0.3,
                mats.dark,
                3,
                1.8,
                -depth / 2 - 0.2,
                group
            );
        }

        addCollider(
            x,
            z,
            width,
            depth,
            0,
            totalHeight
        );

        return group;
    }

    /* =====================================================
       MAIN GATE
       ===================================================== */

    function createMainGate() {

        const z = 106;

        box(
            4.2,
            10,
            4.2,
            mats.redDark,
            -10,
            5,
            z
        );

        box(
            4.2,
            10,
            4.2,
            mats.redDark,
            10,
            5,
            z
        );

        box(
            20,
            2.1,
            0.7,
            mats.white,
            0,
            8.7,
            z - 0.1
        );

        box(
            18.5,
            1,
            0.25,
            mats.red,
            0,
            8.7,
            z - 0.5
        );

        const left =
            box(
                9.5,
                4.8,
                0.25,
                mats.gate,
                -4.8,
                2.4,
                z - 0.25
            );

        const right =
            box(
                9.5,
                4.8,
                0.25,
                mats.gate,
                4.8,
                2.4,
                z - 0.25
            );

        doors.push({
            left: left,
            right: right,
            closedLeft: -4.8,
            closedRight: 4.8,
            openLeft: -9.6,
            openRight: 9.6,
            progress: 0
        });

        addCollider(
            -10,
            z,
            4.2,
            4.2,
            0,
            10
        );

        addCollider(
            10,
            z,
            4.2,
            4.2,
            0,
            10
        );
    }

    /* =====================================================
       TREES
       ===================================================== */

    function createTree(
        x,
        z,
        scale
    ) {

        const group =
            new THREE.Group();

        group.position.set(x, 0, z);

        group.scale.setScalar(
            scale || 1
        );

        scene.add(group);

        box(
            0.75,
            4.2,
            0.75,
            mats.trunk,
            0,
            2.1,
            0,
            group
        );

        const crown =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    2.5,
                    10,
                    8
                ),
                mats.green
            );

        crown.position.y = 5;
        crown.castShadow = true;

        group.add(crown);

        animatedTrees.push({
            crown: crown,
            phase: Math.random() *
                Math.PI * 2
        });
    }

    function createGarden(
        x,
        z,
        width,
        depth
    ) {

        const garden =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    0.12,
                    depth
                ),
                mats.green
            );

        garden.position.set(
            x,
            0.06,
            z
        );

        garden.receiveShadow = true;

        scene.add(garden);

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const tx =
                x -
                width / 2 +
                4 +
                (i % 4) *
                (width - 8) / 3;

            const tz =
                z -
                depth / 2 +
                4 +
                Math.floor(i / 4) *
                (depth - 8);

            createTree(
                tx,
                tz,
                0.75 +
                (i % 2) * 0.18
            );
        }
    }

    /* =====================================================
       PLAYER
       ===================================================== */

    function createPlayer() {

        player =
            new THREE.Group();

        const bodyMat =
            new THREE.MeshStandardMaterial({
                color: 0xf0f0f0,
                roughness: 0.75
            });

        const skinMat =
            new THREE.MeshStandardMaterial({
                color: 0xc88963,
                roughness: 0.85
            });

        const legMat =
            new THREE.MeshStandardMaterial({
                color: 0x222831,
                roughness: 0.9
            });

        const shoeMat =
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.85
            });

        playerBody =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.5,
                    1.2,
                    5,
                    10
                ),
                bodyMat
            );

        playerBody.position.y = 1.65;
        playerBody.castShadow = true;

        player.add(playerBody);

        playerHead =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.43,
                    16,
                    12
                ),
                skinMat
            );

        playerHead.position.y = 2.75;
        playerHead.castShadow = true;

        player.add(playerHead);

        leftLeg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    1.1,
                    0.4
                ),
                legMat
            );

        rightLeg =
            leftLeg.clone();

        leftLeg.position.set(
            -0.22,
            0.55,
            0
        );

        rightLeg.position.set(
            0.22,
            0.55,
            0
        );

        player.add(
            leftLeg,
            rightLeg
        );

        leftArm =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.28,
                    1,
                    0.28
                ),
                bodyMat
            );

        rightArm =
            leftArm.clone();

        leftArm.position.set(
            -0.63,
            1.65,
            0
        );

        rightArm.position.set(
            0.63,
            1.65,
            0
        );

        player.add(
            leftArm,
            rightArm
        );

        const shoeL =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.42,
                    0.18,
                    0.65
                ),
                shoeMat
            );

        const shoeR =
            shoeL.clone();

        shoeL.position.set(
            -0.22,
            0.08,
            -0.12
        );

        shoeR.position.set(
            0.22,
            0.08,
            -0.12
        );

        player.add(
            shoeL,
            shoeR
        );

        player.position.set(
            0,
            0,
            92
        );

        scene.add(player);
    }

    /* =====================================================
       BUILD ABSS WORLD
       ===================================================== */

    function buildWorld() {

        createGround();

        createBuilding(
            "Mahatma Gandhi Block",
            -58,
            -42,
            38,
            25,
            4,
            false
        );

        createBuilding(
            "Main ABSS College",
            0,
            -30,
            56,
            30,
            4,
            true
        );

        createBuilding(
            "Vishvesvaraya Block",
            58,
            -42,
            38,
            25,
            4,
            false
        );

        createBuilding(
            "CSA Boys Hostel",
            -68,
            53,
            38,
            25,
            4,
            true
        );

        createBuilding(
            "Girls Hostel",
            68,
            53,
            38,
            25,
            4,
            true
        );

        createMainGate();

        createGarden(
            -30,
            25,
            34,
            25
        );

        createGarden(
            30,
            25,
            34,
            25
        );

        createGarden(
            -35,
            -78,
            45,
            22
        );

        createGarden(
            35,
            -78,
            45,
            22
        );

        for (
            let i = -5;
            i <= 5;
            i++
        ) {
            createTree(
                i * 13,
                82,
                0.8
            );
        }

        for (
            let i = -4;
            i <= 4;
            i++
        ) {
            createTree(
                i * 15,
                -95,
                0.75
            );
        }
    }

    /* =====================================================
       SCREEN CONTROL
       ===================================================== */

    function showOnly(element) {

        [
            accountScreen,
            characterSetupScreen,
            loginScreen,
            gameMenu,
            settingsScreen,
            mapScreen,
            missionsScreen
        ].forEach(function (el) {

            if (el) {
                el.classList.add("hidden");
            }
        });

        if (element) {
            element.classList.remove("hidden");
        }
    }

    function startGameUI() {

        [
            accountScreen,
            characterSetupScreen,
            loginScreen,
            gameMenu,
            settingsScreen,
            mapScreen,
            missionsScreen
        ].forEach(function (el) {

            if (el) {
                el.classList.add("hidden");
            }
        });

        gameUI.classList.remove("hidden");

        paused = false;
    }

    /* =====================================================
       ACCOUNT
       ===================================================== */

    function loadAccount() {

        try {
            return JSON.parse(
                localStorage.getItem(
                    "abssMapAccount"
                ) || "null"
            );
        } catch (error) {
            return null;
        }
    }

    function saveAccount(account) {

        localStorage.setItem(
            "abssMapAccount",
            JSON.stringify(account)
        );
    }

    function selectGender(gender) {

        selectedGender = gender;

        maleButton.style.opacity =
            gender === "male"
                ? "1"
                : "0.55";

        femaleButton.style.opacity =
            gender === "female"
                ? "1"
                : "0.55";
    }

    function handleCreateAccount() {

        const name =
            playerNameInput.value.trim();

        const password =
            playerPasswordInput.value;

        if (
            !name ||
            password.length < 4
        ) {

            alert(
                "Enter your name and a password of at least 4 characters."
            );

            return;
        }

        saveAccount({
            name: name,
            password: password,
            gender: selectedGender,
            photoName: ""
        });

        savedPlayerName.textContent =
            "Account created for " +
            name;

        characterSetupScreen.classList.remove(
            "hidden"
        );

        accountScreen.classList.add(
            "hidden"
        );
    }

    function handleCharacterCreate() {

        const account =
            loadAccount();

        if (!account) return;

        account.gender =
            selectedGender;

        account.photoName =
            facePhoto.files.length
                ? facePhoto.files[0].name
                : "";

        saveAccount(account);

        playerNameDisplayElement.textContent =
            account.name;

        startGameUI();
    }

    function handleLogin() {

        const account =
            loadAccount();

        if (!account) {

            loginError.textContent =
                "No account found. Create an account first.";

            return;
        }

        if (
            loginPasswordInput.value !==
            account.password
        ) {

            loginError.textContent =
                "Incorrect password.";

            return;
        }

        playerNameDisplayElement.textContent =
            account.name;

        startGameUI();
    }

    /* =====================================================
       JOYSTICK
       ===================================================== */

    function resetJoystick() {

        joystickX = 0;
        joystickY = 0;

        joystickStick.style.transform =
            "translate(-50%, -50%)";
    }

    function updateJoystick(
        clientX,
        clientY
    ) {

        const rect =
            joystickBase.getBoundingClientRect();

        const radius =
            rect.width * 0.38;

        let dx =
            clientX -
            (rect.left +
                rect.width / 2);

        let dy =
            clientY -
            (rect.top +
                rect.height / 2);

        const length =
            Math.hypot(dx, dy);

        if (length > radius) {

            dx =
                (dx / length) *
                radius;

            dy =
                (dy / length) *
                radius;
        }

        joystickX =
            dx / radius;

        joystickY =
            dy / radius;

        joystickStick.style.transform =
            "translate(calc(-50% + " +
            dx +
            "px), calc(-50% + " +
            dy +
            "px))";
    }

    /* =====================================================
       TRUE 360° FREE LOOK
       ===================================================== */

    function startLook(
        clientX,
        clientY,
        pointerId
    ) {

        lookPointerId =
            pointerId;

        lookLastX =
            clientX;

        lookLastY =
            clientY;
    }

    function moveLook(
        clientX,
        clientY
    ) {

        if (
            lookPointerId === null
        ) {
            return;
        }

        const sensitivity =
            Number(
                cameraSensitivity.value || 1
            ) * 0.006;

        const dx =
            clientX - lookLastX;

        const dy =
            clientY - lookLastY;

        lookLastX =
            clientX;

        lookLastY =
            clientY;

        /*
           TRUE 360° HORIZONTAL LOOK

           NO yaw clamp.
           Player can continuously rotate
           left/right without any limit.
        */

        cameraYaw +=
            dx * sensitivity;

        /*
           Vertical look:
           almost straight down/up.
        */

        cameraPitch -=
            dy * sensitivity;

        cameraPitch =
            THREE.MathUtils.clamp(
                cameraPitch,
                -Math.PI / 2 + 0.04,
                Math.PI / 2 - 0.04
            );
    }

    function stopLook(pointerId) {

        if (
            lookPointerId === pointerId
        ) {
            lookPointerId = null;
        }
    }

    /* =====================================================
       COLLISION
       ===================================================== */

    function isBlocked(
        nextX,
        nextZ
    ) {

        const radius = 0.55;

        for (
            let i = 0;
            i < colliders.length;
            i++
        ) {

            const c =
                colliders[i];

            if (
                nextX + radius > c.minX &&
                nextX - radius < c.maxX &&
                nextZ + radius > c.minZ &&
                nextZ - radius < c.maxZ
            ) {
                return true;
            }
        }

        return false;
    }

    /* =====================================================
       PLAYER UPDATE
       ===================================================== */

    function updatePlayer(dt) {

        if (
            !player ||
            paused
        ) {
            return;
        }

        let forward = 0;
        let strafe = 0;

        if (
            keys.KeyW ||
            keys.ArrowUp
        ) {
            forward += 1;
        }

        if (
            keys.KeyS ||
            keys.ArrowDown
        ) {
            forward -= 1;
        }

        if (
            keys.KeyA ||
            keys.ArrowLeft
        ) {
            strafe -= 1;
        }

        if (
            keys.KeyD ||
            keys.ArrowRight
        ) {
            strafe += 1;
        }

        forward += -joystickY;
        strafe += joystickX;

        const inputLength =
            Math.hypot(
                forward,
                strafe
            );

        if (inputLength > 1) {

            forward /=
                inputLength;

            strafe /=
                inputLength;
        }

        const moving =
            inputLength > 0.08;

        const running =
            isRunning ||
            touchRun ||
            keys.ShiftLeft ||
            keys.ShiftRight;

        const speed =
            running
                ? 13
                : 6.5;

        if (moving) {

            const sin =
                Math.sin(cameraYaw);

            const cos =
                Math.cos(cameraYaw);

            /*
               Movement follows camera direction.
            */

            const moveX =
                strafe * cos +
                forward * sin;

            const moveZ =
                strafe * -sin +
                forward * cos;

            const nextX =
                player.position.x +
                moveX * speed * dt;

            const nextZ =
                player.position.z +
                moveZ * speed * dt;

            if (
                !isBlocked(
                    nextX,
                    player.position.z
                )
            ) {
                player.position.x =
                    nextX;
            }

            if (
                !isBlocked(
                    player.position.x,
                    nextZ
                )
            ) {
                player.position.z =
                    nextZ;
            }

            /*
               Character faces movement direction.
            */

            const faceAngle =
                Math.atan2(
                    moveX,
                    moveZ
                );

            player.rotation.y =
                THREE.MathUtils.lerp(
                    player.rotation.y,
                    faceAngle,
                    Math.min(
                        1,
                        dt * 12
                    )
                );

            /* Walking / running animation */

            const animationSpeed =
                running
                    ? 15
                    : 9;

            const swingAmount =
                running
                    ? 0.65
                    : 0.42;

            walkCycle +=
                dt *
                animationSpeed;

            const swing =
                Math.sin(
                    walkCycle
                ) *
                swingAmount;

            leftLeg.rotation.x =
                swing;

            rightLeg.rotation.x =
                -swing;

            leftArm.rotation.x =
                -swing * 0.65;

            rightArm.rotation.x =
                swing * 0.65;

        } else {

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

            leftArm.rotation.x =
                THREE.MathUtils.lerp(
                    leftArm.rotation.x,
                    0,
                    Math.min(
                        1,
                        dt * 10
                    )
                );

            rightArm.rotation.x =
                THREE.MathUtils.lerp(
                    rightArm.rotation.x,
                    0,
                    Math.min(
                        1,
                        dt * 10
                    )
                );
        }

        /* Jump */

        if (
            (
                keys.Space ||
                jumpButton.dataset.pressed === "true"
            ) &&
            isGrounded
        ) {

            verticalVelocity = 9.5;

            isGrounded = false;

            jumpButton.dataset.pressed =
                "false";
        }

        verticalVelocity -=
            24 * dt;

        player.position.y +=
            verticalVelocity * dt;

        if (
            player.position.y <= 0
        ) {

            player.position.y = 0;

            verticalVelocity = 0;

            isGrounded = true;
        }
    }

    /* =====================================================
       CAMERA
       ===================================================== */

    function updateCamera(dt) {

        if (!player) return;

        const horizontal =
            Math.cos(cameraPitch) *
            cameraDistance;

        const vertical =
            Math.sin(cameraPitch) *
            cameraDistance;

        const targetX =
            player.position.x +
            Math.sin(cameraYaw) *
            horizontal;

        const targetZ =
            player.position.z +
            Math.cos(cameraYaw) *
            horizontal;

        const targetY =
            player.position.y +
            cameraTargetHeight +
            vertical;

        tmpVec.set(
            targetX,
            targetY,
            targetZ
        );

        camera.position.lerp(
            tmpVec,
            Math.min(
                1,
                dt * 10
            )
        );

        const lookTarget =
            new THREE.Vector3(
                player.position.x,
                player.position.y +
                    cameraTargetHeight,
                player.position.z
            );

        camera.lookAt(
            lookTarget
        );
    }

    /* =====================================================
       GATE
       ===================================================== */

    function updateGate(dt) {

        if (
            !doors.length ||
            !player
        ) {
            return;
        }

        const gate =
            doors[0];

        const distance =
            Math.hypot(
                player.position.x,
                player.position.z - 106
            );

        const target =
            distance < 16
                ? 1
                : 0;

        gate.progress =
            THREE.MathUtils.lerp(
                gate.progress,
                target,
                Math.min(
                    1,
                    dt * 3
                )
            );

        gate.left.position.x =
            THREE.MathUtils.lerp(
                gate.closedLeft,
                gate.openLeft,
                gate.progress
            );

        gate.right.position.x =
            THREE.MathUtils.lerp(
                gate.closedRight,
                gate.openRight,
                gate.progress
            );
    }

    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    function updateEnvironment(time) {

        animatedTrees.forEach(
            function (tree) {

                tree.crown.rotation.z =
                    Math.sin(
                        time * 0.8 +
                        tree.phase
                    ) * 0.015;
            }
        );
    }

    /* =====================================================
       MISSION
       ===================================================== */

    function updateMission() {

        if (!player) return;

        const targets = {

            "Main Gate":
                new THREE.Vector3(
                    0,
                    0,
                    106
                ),

            "Reception":
                new THREE.Vector3(
                    0,
                    0,
                    -46
                ),

            "Teachers' Office":
                new THREE.Vector3(
                    -8,
                    0,
                    -46
                ),

            "Chemistry Lab":
                new THREE.Vector3(
                    12,
                    0,
                    -15
                ),

            "Physics Lab":
                new THREE.Vector3(
                    -12,
                    0,
                    -15
                ),

            "Sports Ground":
                new THREE.Vector3(
                    95,
                    0,
                    0
                ),

            "CSA Boys Hostel":
                new THREE.Vector3(
                    -68,
                    0,
                    53
                ),

            "Girls Hostel":
                new THREE.Vector3(
                    68,
                    0,
                    53
                )
        };

        const target =
            targets[currentMission] ||
            targets["Main Gate"];

        const distance =
            player.position.distanceTo(
                target
            );

        missionText.textContent =
            currentMission;

        destinationDistance.textContent =
            Math.round(distance) +
            " m";

        const dx =
            target.x -
            player.position.x;

        const dz =
            target.z -
            player.position.z;

        const targetAngle =
            Math.atan2(
                dx,
                dz
            );

        let relative =
            targetAngle -
            cameraYaw;

        relative =
            Math.atan2(
                Math.sin(relative),
                Math.cos(relative)
            );

        navigationArrow.style.transform =
            "translate(-50%, -50%) rotate(" +
            relative +
            "rad)";
    }

    /* =====================================================
       INTERACTION
       ===================================================== */

    function checkInteraction() {

        if (!player) return;

        const possible = [

            {
                name: "Main Gate",
                position:
                    new THREE.Vector3(
                        0,
                        0,
                        106
                    ),
                action:
                    "Open main gate"
            },

            {
                name: "Reception",
                position:
                    new THREE.Vector3(
                        0,
                        0,
                        -46
                    ),
                action:
                    "Enter reception"
            },

            {
                name:
                    "CSA Boys Hostel",
                position:
                    new THREE.Vector3(
                        -68,
                        0,
                        53
                    ),
                action:
                    "Enter CSA Boys Hostel"
            },

            {
                name:
                    "Girls Hostel",
                position:
                    new THREE.Vector3(
                        68,
                        0,
                        53
                    ),
                action:
                    "Enter Girls Hostel"
            }
        ];

        interactTarget = null;

        let best =
            Infinity;

        possible.forEach(
            function (item) {

                const d =
                    player.position.distanceTo(
                        item.position
                    );

                if (
                    d < 8 &&
                    d < best
                ) {

                    best = d;

                    interactTarget =
                        item;
                }
            }
        );

        if (interactTarget) {

            interactionText.textContent =
                interactTarget.action;

            interactionMessage.classList.remove(
                "hidden"
            );

            interactButton.style.display =
                "block";

        } else {

            interactionMessage.classList.add(
                "hidden"
            );

            interactButton.style.display =
                "none";
        }
    }

    function interact() {

        if (!interactTarget) {
            return;
        }

        currentMission =
            interactTarget.name;
    }

    /* =====================================================
       MENU
       ===================================================== */

    function openGameMenu() {

        paused = true;

        gameMenu.classList.remove(
            "hidden"
        );
    }

    function closeGameMenu() {

        gameMenu.classList.add(
            "hidden"
        );

        paused = false;
    }

    /* =====================================================
       KEYBOARD
       ===================================================== */

    window.addEventListener(
        "keydown",
        function (event) {

            keys[event.code] = true;

            if (
                event.code === "Space"
            ) {
                event.preventDefault();
            }

            if (
                event.code === "Escape"
            ) {

                if (
                    gameMenu.classList.contains(
                        "hidden"
                    )
                ) {
                    openGameMenu();
                } else {
                    closeGameMenu();
                }
            }
        }
    );

    window.addEventListener(
        "keyup",
        function (event) {

            keys[event.code] = false;
        }
    );

    /* =====================================================
       FREE LOOK POINTER
       ===================================================== */

    lookArea.addEventListener(
        "pointerdown",
        function (event) {

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            startLook(
                event.clientX,
                event.clientY,
                event.pointerId
            );

            try {
                lookArea.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {}
        }
    );

    lookArea.addEventListener(
        "pointermove",
        function (event) {

            moveLook(
                event.clientX,
                event.clientY
            );
        }
    );

    lookArea.addEventListener(
        "pointerup",
        function (event) {

            stopLook(
                event.pointerId
            );
        }
    );

    lookArea.addEventListener(
        "pointercancel",
        function (event) {

            stopLook(
                event.pointerId
            );
        }
    );

    /* =====================================================
       JOYSTICK POINTER
       ===================================================== */

    joystickBase.addEventListener(
        "pointerdown",
        function (event) {

            joystickPointerId =
                event.pointerId;

            try {
                joystickBase.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {}

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    joystickBase.addEventListener(
        "pointermove",
        function (event) {

            if (
                event.pointerId ===
                joystickPointerId
            ) {

                updateJoystick(
                    event.clientX,
                    event.clientY
                );
            }
        }
    );

    function releaseJoystick(
        event
    ) {

        if (
            event.pointerId ===
            joystickPointerId
        ) {

            joystickPointerId =
                null;

            resetJoystick();
        }
    }

    joystickBase.addEventListener(
        "pointerup",
        releaseJoystick
    );

    joystickBase.addEventListener(
        "pointercancel",
        releaseJoystick
    );

    /* =====================================================
       ACTION BUTTONS
       ===================================================== */

    jumpButton.addEventListener(
        "pointerdown",
        function () {

            jumpButton.dataset.pressed =
                "true";
        }
    );

    runButton.addEventListener(
        "pointerdown",
        function () {

            touchRun = true;
        }
    );

    runButton.addEventListener(
        "pointerup",
        function () {

            touchRun = false;
        }
    );

    runButton.addEventListener(
        "pointercancel",
        function () {

            touchRun = false;
        }
    );

    interactButton.addEventListener(
        "click",
        interact
    );

    menuButton.addEventListener(
        "click",
        openGameMenu
    );

    resumeButton.addEventListener(
        "click",
        closeGameMenu
    );

    /* =====================================================
       SETTINGS
       ===================================================== */

    settingsButton.addEventListener(
        "click",
        function () {

            gameMenu.classList.add(
                "hidden"
            );

            settingsScreen.classList.remove(
                "hidden"
            );
        }
    );

    closeSettingsButton.addEventListener(
        "click",
        function () {

            settingsScreen.classList.add(
                "hidden"
            );

            gameMenu.classList.remove(
                "hidden"
            );
        }
    );

    /* =====================================================
       MAP
       ===================================================== */

    mapButton.addEventListener(
        "click",
        function () {

            paused = true;

            mapScreen.classList.remove(
                "hidden"
            );
        }
    );

    closeMapButton.addEventListener(
        "click",
        function () {

            mapScreen.classList.add(
                "hidden"
            );

            paused = false;
        }
    );

    /* =====================================================
       MISSIONS
       ===================================================== */

    missionButton.addEventListener(
        "click",
        function () {

            paused = true;

            missionsScreen.classList.remove(
                "hidden"
            );
        }
    );

    closeMissionsButton.addEventListener(
        "click",
        function () {

            missionsScreen.classList.add(
                "hidden"
            );

            paused = false;
        }
    );

    document
        .querySelectorAll(
            "#missionList li"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        currentMission =
                            item.textContent.trim();

                        missionsScreen.classList.add(
                            "hidden"
                        );

                        paused = false;
                    }
                );
            }
        );

    /* =====================================================
       LOGOUT
       ===================================================== */

    logoutButton.addEventListener(
        "click",
        function () {

            gameMenu.classList.add(
                "hidden"
            );

            loginScreen.classList.remove(
                "hidden"
            );

            gameUI.classList.add(
                "hidden"
            );

            paused = true;
        }
    );

    /* =====================================================
       ACCOUNT BUTTONS
       ===================================================== */

    createAccountButton.addEventListener(
        "click",
        handleCreateAccount
    );

    generateCharacterButton.addEventListener(
        "click",
        handleCharacterCreate
    );

    loginButton.addEventListener(
        "click",
        handleLogin
    );

    maleButton.addEventListener(
        "click",
        function () {
            selectGender("male");
        }
    );

    femaleButton.addEventListener(
        "click",
        function () {
            selectGender("female");
        }
    );

    /* =====================================================
       RESIZE
       ===================================================== */

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

    /* =====================================================
       GAME LOOP
       ===================================================== */

    function animate(now) {

        requestAnimationFrame(
            animate
        );

        const dt =
            Math.min(
                (now - lastTime) / 1000,
                0.05
            );

        lastTime = now;

        updatePlayer(dt);
        updateCamera(dt);
        updateGate(dt);
        updateEnvironment(now / 1000);
        updateMission();
        checkInteraction();

        renderer.render(
            scene,
            camera
        );
    }

    /* =====================================================
       START
       ===================================================== */

    buildWorld();

    createPlayer();

    selectGender("male");

    const account =
        loadAccount();

    if (account) {

        savedPlayerName.textContent =
            account.name;

        playerNameDisplay.textContent =
            account.name;

        showOnly(loginScreen);

    } else {

        showOnly(accountScreen);
    }

    if (loadingProgress) {
        loadingProgress.style.width =
            "100%";
    }

    setTimeout(
        function () {

            loadingScreen.classList.add(
                "hidden"
            );

        },
        500
    );

    camera.position.set(
        0,
        5,
        100
    );

    animate(
        performance.now()
    );

})();
