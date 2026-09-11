/* =========================================================
   ABSS INSTITUTE OF TECHNOLOGY - 3D CAMPUS GAME
   Krishna's ABSS Project
   game.js
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. BASIC SAFETY CHECK
       ===================================================== */

    if (typeof THREE === "undefined") {
        document.body.innerHTML = `
            <div style="
                color:white;
                background:#111;
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                padding:30px;
                font-family:Arial,sans-serif;
            ">
                <div>
                    <h2>Three.js could not load</h2>
                    <p>Please check your internet connection and reload the page.</p>
                </div>
            </div>
        `;
        return;
    }

    /* =====================================================
       2. DOM REFERENCES
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    const canvas = $("gameCanvas");
    const loadingScreen = $("loadingScreen");
    const accountScreen = $("accountScreen");
    const characterScreen = $("characterScreen");
    const loginScreen = $("loginScreen");

    const nameInput = $("nameInput");
    const passwordInput = $("passwordInput");
    const loginPassword = $("loginPassword");

    const photoInput = $("photoInput");
    const photoPreview = $("photoPreview");

    const boyButton = $("boyButton");
    const girlButton = $("girlButton");

    const gameUI = $("gameUI");
    const missionHUD = $("missionHUD");
    const missionText = $("missionText");
    const interactionMessage = $("interactionMessage");
    const dialogueBox = $("dialogueBox");
    const dialogueText = $("dialogueText");

    const navigationArrow = $("navigationArrow");

    const joystick = $("joystick");
    const joystickKnob = $("joystickKnob");

    const jumpButton = $("jumpButton");
    const runButton = $("runButton");
    const interactButton = $("interactButton");

    const menuScreen = $("menuScreen");
    const mapScreen = $("mapScreen");
    const missionsScreen = $("missionsScreen");
    const settingsScreen = $("settingsScreen");

    /* =====================================================
       3. GAME STATE
       ===================================================== */

    let scene;
    let camera;
    let renderer;

    let player;
    let playerBody;
    let playerHead;
    let leftArm;
    let rightArm;
    let leftLeg;
    let rightLeg;

    let clock;

    let gameStarted = false;
    let gamePaused = false;

    let selectedGender = "boy";
    let playerName = "";

    let playerVelocityY = 0;
    let playerGrounded = true;

    let isRunning = false;
    let isJumping = false;

    let joystickX = 0;
    let joystickY = 0;

    let keyboardForward = false;
    let keyboardBackward = false;
    let keyboardLeft = false;
    let keyboardRight = false;

    let cameraYaw = 0;
    let cameraPitch = -0.25;

    let lookPointerActive = false;
    let lastLookX = 0;
    let lastLookY = 0;

    let cameraDistance = 6;
    let cameraHeight = 2.5;

    let currentInteraction = null;

    const greetedTeachers = {};

    let dayTime = 0.35;

    /* =====================================================
       4. CONSTANTS
       ===================================================== */

    const PLAYER_SPEED = 3.2;
    const RUN_SPEED = 6.0;
    const JUMP_FORCE = 7.0;
    const GRAVITY = 18.0;

    const LOOK_SENSITIVITY = 0.005;

    const WORLD_SIZE = 300;

    const PLAYER_RADIUS = 0.45;

    /* =====================================================
       5. SIMPLE STORAGE
       ===================================================== */

    const STORAGE_KEY = "ABSS_GAME_ACCOUNT";

    function getAccount() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Storage read error:", error);
            return null;
        }
    }

    function saveAccount(account) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
        } catch (error) {
            console.error("Storage write error:", error);
        }
    }

    /* =====================================================
       6. SCREEN CONTROL
       ===================================================== */

    function hideAllScreens() {
        [
            loadingScreen,
            accountScreen,
            characterScreen,
            loginScreen,
            menuScreen,
            mapScreen,
            missionsScreen,
            settingsScreen
        ].forEach((el) => {
            if (el) el.classList.add("hidden");
        });
    }

    function showElement(el) {
        if (el) el.classList.remove("hidden");
    }

    function hideElement(el) {
        if (el) el.classList.add("hidden");
    }

    function startGameUI() {
        hideAllScreens();

        if (gameUI) {
            gameUI.classList.remove("hidden");
        }

        gameStarted = true;
        gamePaused = false;

        if (renderer) {
            renderer.domElement.style.display = "block";
        }
    }

    /* =====================================================
       7. LOADING
       ===================================================== */

    function finishLoading() {
        setTimeout(() => {
            hideElement(loadingScreen);

            const account = getAccount();

            if (account) {
                showElement(loginScreen);
            } else {
                showElement(accountScreen);
            }
        }, 900);
    }

    /* =====================================================
       8. ACCOUNT CREATION
       ===================================================== */

    function createAccount() {
        if (!nameInput || !passwordInput) return;

        const name = nameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name) {
            alert("Please enter your name.");
            return;
        }

        if (password.length < 4) {
            alert("Password must contain at least 4 characters.");
            return;
        }

        playerName = name;

        const account = {
            name: name,
            password: password,
            gender: "boy",
            photoName: "",
            greetedTeachers: {},
            createdAt: Date.now()
        };

        saveAccount(account);

        hideElement(accountScreen);
        showElement(characterScreen);
    }

    /* =====================================================
       9. CHARACTER SELECTION
       ===================================================== */

    function selectGender(gender) {
        selectedGender = gender;

        if (boyButton) boyButton.classList.remove("selected");
        if (girlButton) girlButton.classList.remove("selected");

        if (gender === "boy" && boyButton) {
            boyButton.classList.add("selected");
        }

        if (gender === "girl" && girlButton) {
            girlButton.classList.add("selected");
        }
    }

    if (boyButton) {
        boyButton.addEventListener("click", () => selectGender("boy"));
    }

    if (girlButton) {
        girlButton.addEventListener("click", () => selectGender("girl"));
    }

    /* =====================================================
       10. PHOTO PREVIEW
       ===================================================== */

    if (photoInput) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files && photoInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image.");
                photoInput.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                if (photoPreview) {
                    photoPreview.src = event.target.result;
                    photoPreview.classList.remove("hidden");
                }
            };

            reader.readAsDataURL(file);
        });
    }

    /* =====================================================
       11. LOGIN
       ===================================================== */

    function loginUser() {
        const account = getAccount();

        if (!account) {
            hideElement(loginScreen);
            showElement(accountScreen);
            return;
        }

        const enteredPassword = loginPassword
            ? loginPassword.value
            : "";

        if (enteredPassword !== account.password) {
            alert("Wrong password.");
            return;
        }

        playerName = account.name;
        selectedGender = account.gender || "boy";

        Object.assign(
            greetedTeachers,
            account.greetedTeachers || {}
        );

        startGame();
    }

    /* =====================================================
       12. FINISH CHARACTER CREATION
       ===================================================== */

    function finishCharacterCreation() {
        const account = getAccount();

        if (!account) {
            alert("Please create an account first.");
            return;
        }

        account.gender = selectedGender;

        if (photoInput && photoInput.files && photoInput.files[0]) {
            account.photoName = photoInput.files[0].name;
        }

        saveAccount(account);

        playerName = account.name;

        startGame();
    }

    /* =====================================================
       13. THREE.JS INITIALIZATION
       ===================================================== */

    function initThree() {
        scene = new THREE.Scene();

        scene.background = new THREE.Color(0x87b9e8);

        scene.fog = new THREE.Fog(
            0x87b9e8,
            90,
            270
        );

        clock = new THREE.Clock();

        camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );

        camera.position.set(
            0,
            cameraHeight,
            cameraDistance
        );

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.05;

        setupLights();
        createWorld();
        createPlayer();
        setupInput();

        window.addEventListener(
            "resize",
            onResize
        );

        animate();
    }

    /* =====================================================
       14. LIGHTING
       ===================================================== */

    let sunLight;
    let ambientLight;

    function setupLights() {
        ambientLight = new THREE.HemisphereLight(
            0xffffff,
            0x4d6744,
            1.5
        );

        scene.add(ambientLight);

        sunLight = new THREE.DirectionalLight(
            0xffffff,
            2.0
        );

        sunLight.position.set(
            70,
            100,
            50
        );

        sunLight.castShadow = true;

        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;

        sunLight.shadow.camera.left = -120;
        sunLight.shadow.camera.right = 120;
        sunLight.shadow.camera.top = 120;
        sunLight.shadow.camera.bottom = -120;

        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 300;

        scene.add(sunLight);
    }

    /* =====================================================
       15. MATERIAL HELPERS
       ===================================================== */

    function material(color, roughness = 0.8) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: 0
        });
    }

    function box(
        width,
        height,
        depth,
        color,
        x,
        y,
        z
    ) {
        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const mesh = new THREE.Mesh(
            geometry,
            material(color)
        );

        mesh.position.set(x, y, z);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;
    }

    /* =====================================================
       16. GROUND
       ===================================================== */

    function createGround() {
        const geometry =
            new THREE.PlaneGeometry(
                WORLD_SIZE,
                WORLD_SIZE,
                20,
                20
            );

        const ground =
            new THREE.Mesh(
                geometry,
                material(0x3f7041)
            );

        ground.rotation.x = -Math.PI / 2;

        ground.receiveShadow = true;

        scene.add(ground);
    }

    /* =====================================================
       17. ROADS
       ===================================================== */

    function createRoad(
        width,
        length,
        x,
        z,
        rotation = 0
    ) {
        const road = box(
            width,
            0.08,
            length,
            0x454545,
            x,
            0.04,
            z
        );

        road.rotation.y = rotation;

        return road;
    }

    /* =====================================================
       18. PATHS
       ===================================================== */

    function createPath(
        width,
        length,
        x,
        z,
        rotation = 0
    ) {
        const path = box(
            width,
            0.06,
            length,
            0xb9b29d,
            x,
            0.07,
            z
        );

        path.rotation.y = rotation;

        return path;
    }

    /* =====================================================
       19. BUILDING CREATOR
       ===================================================== */

    const buildings = [];

    function createBuilding(
        name,
        width,
        height,
        depth,
        x,
        z
    ) {
        const group =
            new THREE.Group();

        group.name = name;

        const main =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                ),
                material(0xb94b3b)
            );

        main.position.y =
            height / 2;

        main.castShadow = true;
        main.receiveShadow = true;

        group.add(main);

        /* White floor bands */

        const floorCount = 4;

        for (let i = 1; i <= floorCount; i++) {
            const band =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        width + 0.08,
                        0.14,
                        depth + 0.08
                    ),
                    material(0xf2f0e8)
                );

            band.position.y =
                (height / floorCount) * i;

            band.castShadow = true;

            group.add(band);
        }

        /* Windows */

        const windowMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x78b7d6,
                roughness: 0.2,
                metalness: 0.15
            });

        const windowRows = 4;
        const windowsPerRow =
            Math.max(
                3,
                Math.floor(width / 4)
            );

        for (let row = 0; row < windowRows; row++) {
            for (
                let col = 0;
                col < windowsPerRow;
                col++
            ) {
                const w =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            1.35,
                            1.15,
                            0.08
                        ),
                        windowMaterial
                    );

                const spacing =
                    width /
                    (windowsPerRow + 1);

                w.position.set(
                    -width / 2 +
                    spacing * (col + 1),
                    2.1 + row * 3.1,
                    depth / 2 + 0.05
                );

                group.add(w);

                const backW =
                    w.clone();

                backW.position.z =
                    -depth / 2 - 0.05;

                group.add(backW);
            }
        }

        group.position.set(
            x,
            0,
            z
        );

        scene.add(group);

        buildings.push({
            name,
            object: group,
            width,
            height,
            depth,
            x,
            z
        });

        return group;
    }

    /* =====================================================
       20. MAIN COLLEGE
       ===================================================== */

    function createCollege() {
        createBuilding(
            "Mahatma Gandhi Block",
            42,
            15,
            22,
            -42,
            -30
        );

        createBuilding(
            "Main ABSS College",
            50,
            15,
            25,
            0,
            -32
        );

        createBuilding(
            "Vishvesvaraya Block",
            42,
            15,
            22,
            44,
            -30
        );

        createBuilding(
            "Madan Mohan Malviya Block",
            38,
            15,
            21,
            0,
            -65
        );
    }

    /* =====================================================
       21. HOSTELS
       ===================================================== */

    function createHostels() {
        createBuilding(
            "Chandrashekhar Azad Boys Hostel",
            38,
            15,
            23,
            -52,
            42
        );

        createBuilding(
            "Girls Hostel",
            38,
            15,
            23,
            52,
            42
        );
    }

    /* =====================================================
       22. MAIN GATE
       ===================================================== */

    let leftGate;
    let rightGate;

    function createMainGate() {
        const gateGroup =
            new THREE.Group();

        gateGroup.name =
            "ABSS Main Gate";

        const pillarMaterial =
            material(0x8d4035);

        const pillar1 =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.5,
                    8,
                    2.5
                ),
                pillarMaterial
            );

        pillar1.position.set(
            -9,
            4,
            82
        );

        pillar1.castShadow = true;

        gateGroup.add(pillar1);

        const pillar2 =
            pillar1.clone();

        pillar2.position.x = 9;

        gateGroup.add(pillar2);

        const sign =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    16,
                    2,
                    0.6
                ),
                material(0xe8dfca)
            );

        sign.position.set(
            0,
            7.5,
            82
        );

        sign.castShadow = true;

        gateGroup.add(sign);

        const signCanvas =
            document.createElement("canvas");

        signCanvas.width = 1024;
        signCanvas.height = 160;

        const ctx =
            signCanvas.getContext("2d");

        ctx.fillStyle = "#eee6d2";
        ctx.fillRect(
            0,
            0,
            signCanvas.width,
            signCanvas.height
        );

        ctx.fillStyle = "#7e2e25";
        ctx.font =
            "bold 58px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "ABSS INSTITUTE OF TECHNOLOGY",
            512,
            80
        );

        const texture =
            new THREE.CanvasTexture(
                signCanvas
            );

        const signFront =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    15.6,
                    1.8
                ),
                new THREE.MeshBasicMaterial({
                    map: texture
                })
            );

        signFront.position.set(
            0,
            7.5,
            82.34
        );

        gateGroup.add(signFront);

        leftGate =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    8,
                    5,
                    0.35
                ),
                material(0x222222)
            );

        rightGate =
            leftGate.clone();

        leftGate.position.set(
            -4,
            2.5,
            81.6
        );

        rightGate.position.set(
            4,
            2.5,
            81.6
        );

        gateGroup.add(leftGate);
        gateGroup.add(rightGate);

        scene.add(gateGroup);
    }

    /* =====================================================
       23. TREES
       ===================================================== */

    const trees = [];

    function createTree(x, z, scale = 1) {
        const tree =
            new THREE.Group();

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.25 * scale,
                    0.38 * scale,
                    3 * scale,
                    8
                ),
                material(0x65452d)
            );

        trunk.position.y =
            1.5 * scale;

        trunk.castShadow = true;

        tree.add(trunk);

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.8 * scale,
                    12,
                    10
                ),
                material(0x286b35)
            );

        leaves.position.y =
            4 * scale;

        leaves.castShadow = true;

        tree.add(leaves);

        tree.position.set(
            x,
            0,
            z
        );

        scene.add(tree);

        trees.push(tree);

        return tree;
    }

    function createPalm(x, z, scale = 1) {
        const palm =
            new THREE.Group();

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.18 * scale,
                    0.3 * scale,
                    5 * scale,
                    8
                ),
                material(0x715238)
            );

        trunk.position.y =
            2.5 * scale;

        trunk.castShadow = true;

        palm.add(trunk);

        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const leaf =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.18 * scale,
                        0.08 * scale,
                        2.5 * scale
                    ),
                    material(0x2e7534)
                );

            leaf.position.y =
                5.1 * scale;

            leaf.rotation.y =
                (i / 7) *
                Math.PI *
                2;

            leaf.rotation.x =
                -0.35;

            palm.add(leaf);
        }

        palm.position.set(
            x,
            0,
            z
        );

        scene.add(palm);

        trees.push(palm);

        return palm;
    }

    /* =====================================================
       24. GARDENS
       ===================================================== */

    function createGarden(x, z, width, depth) {
        const garden =
            box(
                width,
                0.04,
                depth,
                0x5a9149,
                x,
                0.02,
                z
            );

        garden.receiveShadow = true;

        for (
            let i = 0;
            i < 10;
            i++
        ) {
            const px =
                x +
                (Math.random() - 0.5) *
                width *
                0.85;

            const pz =
                z +
                (Math.random() - 0.5) *
                depth *
                0.85;

            createTree(
                px,
                pz,
                0.5 +
                Math.random() * 0.4
            );
        }
    }

    /* =====================================================
       25. SPORTS AREA
       ===================================================== */

    function createSportsArea() {
        const court =
            box(
                28,
                0.08,
                18,
                0x8c4d35,
                55,
                -5,
                0
            );

        court.receiveShadow = true;

        const line =
            new THREE.LineSegments(
                new THREE.EdgesGeometry(
                    new THREE.BoxGeometry(
                        28,
                        0.1,
                        18
                    )
                ),
                new THREE.LineBasicMaterial({
                    color: 0xffffff
                })
            );

        line.position.set(
            55,
            0.12,
            -5
        );

        scene.add(line);

        const center =
            box(
                0.15,
                0.15,
                18,
                0xffffff,
                55,
                0.15,
                -5
            );

        center.receiveShadow = true;
    }

    /* =====================================================
       26. SIMPLE BENCHES
       ===================================================== */

    function createBench(x, z, rotation = 0) {
        const bench =
            new THREE.Group();

        const seat =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.8,
                    0.25,
                    0.55
                ),
                material(0x69452e)
            );

        seat.position.y = 1;

        bench.add(seat);

        const back =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.8,
                    1.1,
                    0.18
                ),
                material(0x69452e)
            );

        back.position.set(
            0,
            1.45,
            -0.2
        );

        bench.add(back);

        for (
            const lx of [-1.05, 1.05]
        ) {
            const leg =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.2,
                        1,
                        0.2
                    ),
                    material(0x333333)
                );

            leg.position.set(
                lx,
                0.5,
                0
            );

            bench.add(leg);
        }

        bench.position.set(
            x,
            0,
            z
        );

        bench.rotation.y =
            rotation;

        scene.add(bench);
    }

    /* =====================================================
       27. WORLD CREATION
       ===================================================== */

    function createWorld() {
        createGround();

        createRoad(
            10,
            190,
            0,
            0,
            0
        );

        createRoad(
            10,
            190,
            0,
            0,
            Math.PI / 2
        );

        createPath(
            5,
            70,
            0,
            35,
            0
        );

        createPath(
            5,
            65,
            -30,
            15,
            Math.PI / 2
        );

        createCollege();
        createHostels();
        createMainGate();

        createSportsArea();

        createGarden(
            -75,
            -20,
            25,
            35
        );

        createGarden(
            75,
            -25,
            25,
            35
        );

        createGarden(
            -10,
            55,
            25,
            18
        );

        const treePositions = [
            [-80, 70],
            [-70, 55],
            [-78, 35],
            [-25, 78],
            [25, 78],
            [70, 70],
            [80, 45],
            [75, 20],
            [-75, 10],
            [-82, -45],
            [82, -45]
        ];

        treePositions.forEach(
            ([x, z]) =>
                createTree(
                    x,
                    z,
                    0.8 +
                    Math.random() * 0.5
                )
        );

        createPalm(
            -70,
            -5,
            1
        );

        createPalm(
            70,
            -5,
            1
        );

        createPalm(
            -65,
            60,
            1.1
        );

        createPalm(
            65,
            60,
            1.1
        );

        createBench(
            -15,
            15,
            Math.PI / 2
        );

        createBench(
            18,
            15,
            -Math.PI / 2
        );
    }

    /* =====================================================
       28. PLAYER
       ===================================================== */

    function createPlayer() {
        player =
            new THREE.Group();

        player.name = "Player";

        /* Body */

        playerBody =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.9,
                    1.25,
                    0.55
                ),
                material(0xf4f4f4)
            );

        playerBody.position.y =
            1.55;

        playerBody.castShadow = true;

        player.add(playerBody);

        /* Head */

        playerHead =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.38,
                    16,
                    16
                ),
                material(0xc98762)
            );

        playerHead.position.y =
            2.5;

        playerHead.castShadow = true;

        player.add(playerHead);

        /* Hair */

        const hair =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.4,
                    16,
                    8,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI * 0.55
                ),
                material(0x211814)
            );

        hair.position.y =
            2.68;

        player.add(hair);

        /* ABSSIT shirt marking */

        const shirtCanvas =
            document.createElement("canvas");

        shirtCanvas.width = 256;
        shirtCanvas.height = 256;

        const shirtCtx =
            shirtCanvas.getContext("2d");

        shirtCtx.fillStyle = "#f4f4f4";

        shirtCtx.fillRect(
            0,
            0,
            256,
            256
        );

        shirtCtx.fillStyle = "#9c3028";

        shirtCtx.font =
            "bold 38px Arial";

        shirtCtx.textAlign =
            "center";

        shirtCtx.fillText(
            "ABSSIT",
            128,
            145
        );

        const shirtTexture =
            new THREE.CanvasTexture(
                shirtCanvas
            );

        playerBody.material =
            new THREE.MeshStandardMaterial({
                map: shirtTexture,
                roughness: 0.8
            });

        /* Arms */

        leftArm =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.25,
                    1.05,
                    0.25
                ),
                material(0xc98762)
            );

        rightArm =
            leftArm.clone();

        leftArm.position.set(
            -0.62,
            1.55,
            0
        );

        rightArm.position.set(
            0.62,
            1.55,
            0
        );

        leftArm.castShadow = true;
        rightArm.castShadow = true;

        player.add(leftArm);
        player.add(rightArm);

        /* Legs */

        leftLeg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.3,
                    1.15,
                    0.32
                ),
                material(0x26364d)
            );

        rightLeg =
            leftLeg.clone();

        leftLeg.position.set(
            -0.25,
            0.55,
            0
        );

        rightLeg.position.set(
            0.25,
            0.55,
            0
        );

        leftLeg.castShadow = true;
        rightLeg.castShadow = true;

        player.add(leftLeg);
        player.add(rightLeg);

        /* Shoes */

        const shoeMaterial =
            material(0x202020);

        const shoe1 =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.38,
                    0.18,
                    0.55
                ),
                shoeMaterial
            );

        const shoe2 =
            shoe1.clone();

        shoe1.position.set(
            -0.25,
            -0.02,
            0.08
        );

        shoe2.position.set(
            0.25,
            -0.02,
            0.08
        );

        player.add(shoe1);
        player.add(shoe2);

        player.position.set(
            0,
            0,
            65
        );

        scene.add(player);
    }

    /* =====================================================
       29. PLAYER COLLISION
       ===================================================== */

    function isInsideBuilding(
        x,
        z
    ) {
        for (const b of buildings) {
            const halfW =
                b.width / 2 +
                PLAYER_RADIUS;

            const halfD =
                b.depth / 2 +
                PLAYER_RADIUS;

            if (
                x >
                    b.x - halfW &&
                x <
                    b.x + halfW &&
                z >
                    b.z - halfD &&
                z <
                    b.z + halfD
            ) {
                return true;
            }
        }

        return false;
    }

    function clampPlayerToWorld() {
        player.position.x =
            THREE.MathUtils.clamp(
                player.position.x,
                -WORLD_SIZE / 2 + 2,
                WORLD_SIZE / 2 - 2
            );

        player.position.z =
            THREE.MathUtils.clamp(
                player.position.z,
                -WORLD_SIZE / 2 + 2,
                WORLD_SIZE / 2 - 2
            );
    }

    /* =====================================================
       30. INPUT
       ===================================================== */

    function setupInput() {
        window.addEventListener(
            "keydown",
            (event) => {
                switch (event.code) {
                    case "KeyW":
                    case "ArrowUp":
                        keyboardForward = true;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        keyboardBackward = true;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        keyboardLeft = true;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        keyboardRight = true;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        isRunning = true;
                        break;

                    case "Space":
                        event.preventDefault();
                        jump();
                        break;

                    case "KeyE":
                        interact();
                        break;

                    case "Escape":
                        toggleMenu();
                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {
                switch (event.code) {
                    case "KeyW":
                    case "ArrowUp":
                        keyboardForward = false;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        keyboardBackward = false;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        keyboardLeft = false;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        keyboardRight = false;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        isRunning = false;
                        break;
                }
            }
        );

        setupJoystick();
        setupFreeLook();
        setupActionButtons();
    }

    /* =====================================================
       31. JOYSTICK
       ===================================================== */

    function setupJoystick() {
        if (!joystick) return;

        const start = (event) => {
            event.preventDefault();

            const touch =
                event.touches
                    ? event.touches[0]
                    : event;

            updateJoystick(
                touch.clientX,
                touch.clientY
            );
        };

        const move = (event) => {
            event.preventDefault();

            const touch =
                event.touches
                    ? event.touches[0]
                    : event;

            updateJoystick(
                touch.clientX,
                touch.clientY
            );
        };

        const end = (event) => {
            event.preventDefault();

            joystickX = 0;
            joystickY = 0;

            if (joystickKnob) {
                joystickKnob.style.transform =
                    "translate(-50%, -50%)";
            }
        };

        joystick.addEventListener(
            "touchstart",
            start,
            { passive: false }
        );

        joystick.addEventListener(
            "touchmove",
            move,
            { passive: false }
        );

        joystick.addEventListener(
            "touchend",
            end,
            { passive: false }
        );

        joystick.addEventListener(
            "mousedown",
            start
        );

        window.addEventListener(
            "mousemove",
            (event) => {
                if (
                    event.buttons === 1
                ) {
                    updateJoystick(
                        event.clientX,
                        event.clientY
                    );
                }
            }
        );

        window.addEventListener(
            "mouseup",
            end
        );
    }

    function updateJoystick(
        clientX,
        clientY
    ) {
        const rect =
            joystick.getBoundingClientRect();

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

        const radius =
            rect.width / 2;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance > radius) {
            dx =
                dx /
                distance *
                radius;

            dy =
                dy /
                distance *
                radius;
        }

        joystickX =
            dx / radius;

        joystickY =
            dy / radius;

        if (joystickKnob) {
            joystickKnob.style.transform =
                `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        }
    }

    /* =====================================================
       32. FREE LOOK
       ===================================================== */

    function setupFreeLook() {
        const lookArea =
            $("lookArea");

        if (!lookArea) return;

        lookArea.addEventListener(
            "pointerdown",
            (event) => {
                lookPointerActive = true;

                lastLookX =
                    event.clientX;

                lastLookY =
                    event.clientY;

                lookArea.setPointerCapture(
                    event.pointerId
                );
            }
        );

        lookArea.addEventListener(
            "pointermove",
            (event) => {
                if (!lookPointerActive) {
                    return;
                }

                const dx =
                    event.clientX -
                    lastLookX;

                const dy =
                    event.clientY -
                    lastLookY;

                lastLookX =
                    event.clientX;

                lastLookY =
                    event.clientY;

                cameraYaw -=
                    dx *
                    LOOK_SENSITIVITY *
                    2.2;

                cameraPitch -=
                    dy *
                    LOOK_SENSITIVITY *
                    2.2;

                cameraPitch =
                    THREE.MathUtils.clamp(
                        cameraPitch,
                        -1.45,
                        1.45
                    );
            }
        );

        lookArea.addEventListener(
            "pointerup",
            (event) => {
                lookPointerActive = false;

                try {
                    lookArea.releasePointerCapture(
                        event.pointerId
                    );
                } catch (_) {}
            }
        );

        lookArea.addEventListener(
            "pointercancel",
            () => {
                lookPointerActive = false;
            }
        );
    }

    /* =====================================================
       33. ACTION BUTTONS
       ===================================================== */

    function setupActionButtons() {
        if (jumpButton) {
            jumpButton.addEventListener(
                "click",
                jump
            );

            jumpButton.addEventListener(
                "touchstart",
                (event) => {
                    event.preventDefault();
                    jump();
                },
                { passive: false }
            );
        }

        if (runButton) {
            const runStart = (event) => {
                event.preventDefault();
                isRunning = true;
            };

            const runEnd = (event) => {
                event.preventDefault();
                isRunning = false;
            };

            runButton.addEventListener(
                "pointerdown",
                runStart
            );

            runButton.addEventListener(
                "pointerup",
                runEnd
            );

            runButton.addEventListener(
                "pointercancel",
                runEnd
            );

            runButton.addEventListener(
                "pointerleave",
                runEnd
            );
        }

        if (interactButton) {
            interactButton.addEventListener(
                "click",
                interact
            );
        }
    }

    /* =====================================================
       34. JUMP
       ===================================================== */

    function jump() {
        if (
            !player ||
            !playerGrounded ||
            gamePaused
        ) {
            return;
        }

        playerVelocityY =
            JUMP_FORCE;

        playerGrounded =
            false;

        isJumping = true;
    }

    /* =====================================================
       35. MOVEMENT
       ===================================================== */

    function updatePlayer(delta) {
        if (!player || gamePaused) {
            return;
        }

        let forward =
            keyboardForward;

        let backward =
            keyboardBackward;

        let left =
            keyboardLeft;

        let right =
            keyboardRight;

        let moveForward =
            (forward ? 1 : 0) -
            (backward ? 1 : 0);

        let moveSide =
            (right ? 1 : 0) -
            (left ? 1 : 0);

        moveForward +=
            -joystickY;

        moveSide +=
            joystickX;

        const length =
            Math.sqrt(
                moveForward *
                    moveForward +
                moveSide *
                    moveSide
            );

        if (length > 1) {
            moveForward /= length;
            moveSide /= length;
        }

        const moving =
            Math.abs(moveForward) > 0.01 ||
            Math.abs(moveSide) > 0.01;

        if (moving) {
            const sin =
                Math.sin(cameraYaw);

            const cos =
                Math.cos(cameraYaw);

            const directionX =
                moveSide * cos +
                moveForward * sin;

            const directionZ =
                moveSide * sin -
                moveForward * cos;

            const speed =
                isRunning
                    ? RUN_SPEED
                    : PLAYER_SPEED;

            const oldX =
                player.position.x;

            const oldZ =
                player.position.z;

            player.position.x +=
                directionX *
                speed *
                delta;

            player.position.z +=
                directionZ *
                speed *
                delta;

            if (
                isInsideBuilding(
                    player.position.x,
                    player.position.z
                )
            ) {
                player.position.x =
                    oldX;

                player.position.z =
                    oldZ;
            }

            const targetRotation =
                Math.atan2(
                    directionX,
                    directionZ
                );

            player.rotation.y =
                smoothAngle(
                    player.rotation.y,
                    targetRotation,
                    Math.min(
                        1,
                        delta * 10
                    )
                );

            animatePlayer(
                delta,
                speed
            );
        } else {
            resetPlayerAnimation(delta);
        }

        /* Gravity */

        if (!playerGrounded) {
            playerVelocityY -=
                GRAVITY * delta;

            player.position.y +=
                playerVelocityY *
                delta;

            if (
                player.position.y <= 0
            ) {
                player.position.y = 0;
                playerVelocityY = 0;
                playerGrounded = true;
                isJumping = false;
            }
        }

        clampPlayerToWorld();
    }

    function smoothAngle(
        current,
        target,
        amount
    ) {
        let difference =
            target - current;

        while (
            difference > Math.PI
        ) {
            difference -=
                Math.PI * 2;
        }

        while (
            difference < -Math.PI
        ) {
            difference +=
                Math.PI * 2;
        }

        return current +
            difference * amount;
    }

    /* =====================================================
       36. PLAYER ANIMATION
       ===================================================== */

    let walkTime = 0;

    function animatePlayer(
        delta,
        speed
    ) {
        walkTime +=
            delta *
            speed *
            2.2;

        const amount =
            Math.min(
                0.7,
                speed / 6
            );

        const swing =
            Math.sin(walkTime) *
            amount;

        if (leftLeg) {
            leftLeg.rotation.x =
                swing;
        }

        if (rightLeg) {
            rightLeg.rotation.x =
                -swing;
        }

        if (leftArm) {
            leftArm.rotation.x =
                -swing * 0.7;
        }

        if (rightArm) {
            rightArm.rotation.x =
                swing * 0.7;
        }

        if (playerBody) {
            playerBody.position.y =
                1.55 +
                Math.abs(
                    Math.sin(
                        walkTime * 2
                    )
                ) *
                0.025;
        }
    }

    function resetPlayerAnimation(
        delta
    ) {
        const amount =
            Math.min(
                1,
                delta * 10
            );

        if (leftLeg) {
            leftLeg.rotation.x =
                THREE.MathUtils.lerp(
                    leftLeg.rotation.x,
                    0,
                    amount
                );
        }

        if (rightLeg) {
            rightLeg.rotation.x =
                THREE.MathUtils.lerp(
                    rightLeg.rotation.x,
                    0,
                    amount
                );
        }

        if (leftArm) {
            leftArm.rotation.x =
                THREE.MathUtils.lerp(
                    leftArm.rotation.x,
                    0,
                    amount
                );
        }

        if (rightArm) {
            rightArm.rotation.x =
                THREE.MathUtils.lerp(
                    rightArm.rotation.x,
                    0,
                    amount
                );
        }
    }

    /* =====================================================
       37. CAMERA
       ===================================================== */

    function updateCamera(delta) {
        if (!camera || !player) {
            return;
        }

        const horizontalDistance =
            cameraDistance *
            Math.cos(cameraPitch);

        const verticalDistance =
            cameraDistance *
            Math.sin(cameraPitch);

        const targetX =
            player.position.x -
            Math.sin(cameraYaw) *
            horizontalDistance;

        const targetZ =
            player.position.z -
            Math.cos(cameraYaw) *
            horizontalDistance;

        const targetY =
            player.position.y +
            cameraHeight +
            verticalDistance;

        const smooth =
            Math.min(
                1,
                delta * 8
            );

        camera.position.x =
            THREE.MathUtils.lerp(
                camera.position.x,
                targetX,
                smooth
            );

        camera.position.y =
            THREE.MathUtils.lerp(
                camera.position.y,
                targetY,
                smooth
            );

        camera.position.z =
            THREE.MathUtils.lerp(
                camera.position.z,
                targetZ,
                smooth
            );

        const lookTarget =
            new THREE.Vector3(
                player.position.x,
                player.position.y + 1.5,
                player.position.z
            );

        camera.lookAt(
            lookTarget
        );
    }

    /* =====================================================
       38. GATE ANIMATION
       ===================================================== */

    function updateGate() {
        if (
            !leftGate ||
            !rightGate ||
            !player
        ) {
            return;
        }

        const distance =
            Math.hypot(
                player.position.x,
                player.position.z - 82
            );

        const near =
            distance < 18;

        const targetLeft =
            near ? -8 : -4;

        const targetRight =
            near ? 8 : 4;

        leftGate.position.x =
            THREE.MathUtils.lerp(
                leftGate.position.x,
                targetLeft,
                0.05
            );

        rightGate.position.x =
            THREE.MathUtils.lerp(
                rightGate.position.x,
                targetRight,
                0.05
            );
    }

    /* =====================================================
       39. INTERACTION
       ===================================================== */

    function updateInteraction() {
        if (
            !player ||
            !interactionMessage
        ) {
            return;
        }

        const px =
            player.position.x;

        const pz =
            player.position.z;

        const gateDistance =
            Math.hypot(
                px,
                pz - 82
            );

        if (gateDistance < 12) {
            currentInteraction =
                "gate";

            showInteraction(
                "Press E / INTERACT to enter ABSS campus"
            );

            return;
        }

        const receptionDistance =
            Math.hypot(
                px,
                pz + 32
            );

        if (
            receptionDistance < 18
        ) {
            currentInteraction =
                "reception";

            showInteraction(
                "Reception — Press E / INTERACT"
            );

            return;
        }

        currentInteraction = null;

        hideElement(
            interactionMessage
        );
    }

    function showInteraction(text) {
        if (!interactionMessage) {
            return;
        }

        interactionMessage.textContent =
            text;

        showElement(
            interactionMessage
        );
    }

    function interact() {
        if (
            gamePaused ||
            !currentInteraction
        ) {
            return;
        }

        if (
            currentInteraction ===
            "gate"
        ) {
            showDialogue(
                "Welcome to ABSS Institute of Technology!"
            );

            completeMission(
                "mainGate"
            );
        }

        if (
            currentInteraction ===
            "reception"
        ) {
            showDialogue(
                "Namaste Mam"
            );

            setTimeout(
                () => {
                    showDialogue(
                        "Namaste! Welcome to ABSSIT."
                    );
                },
                900
            );

            completeMission(
                "reception"
            );
        }
    }

    /* =====================================================
       40. DIALOGUE
       ===================================================== */

    let dialogueTimer = null;

    function showDialogue(text) {
        if (!dialogueBox) return;

        if (dialogueText) {
            dialogueText.textContent =
                text;
        }

        showElement(dialogueBox);

        if (dialogueTimer) {
            clearTimeout(
                dialogueTimer
            );
        }

        dialogueTimer =
            setTimeout(
                () => {
                    hideElement(
                        dialogueBox
                    );
                },
                3000
            );
    }

    /* =====================================================
       41. MISSIONS
       ===================================================== */

    const missions = [
        {
            id: "mainGate",
            title: "Visit Main Gate",
            target: new THREE.Vector3(
                0,
                0,
                75
            )
        },
        {
            id: "reception",
            title: "Visit Reception",
            target: new THREE.Vector3(
                0,
                0,
                -30
            )
        },
        {
            id: "college",
            title: "Explore Main College",
            target: new THREE.Vector3(
                0,
                0,
                -32
            )
        },
        {
            id: "csa",
            title: "Visit CSA Boys Hostel",
            target: new THREE.Vector3(
                -52,
                0,
                42
            )
        },
        {
            id: "girls",
            title: "Visit Girls Hostel",
            target: new THREE.Vector3(
                52,
                0,
                42
            )
        },
        {
            id: "sports",
            title: "Visit Sports Ground",
            target: new THREE.Vector3(
                55,
                0,
                -5
            )
        }
    ];

    const completedMissions =
        {};

    function completeMission(id) {
        completedMissions[id] =
            true;

        updateMissionHUD();
    }

    function updateMissionHUD() {
        if (!missionText) return;

        const next =
            missions.find(
                (mission) =>
                    !completedMissions[
                        mission.id
                    ]
            );

        if (!next) {
            missionText.textContent =
                "ABSS Campus Explorer — COMPLETE!";
            return;
        }

        missionText.textContent =
            next.title;
    }

    function updateNavigation() {
        if (
            !navigationArrow ||
            !player
        ) {
            return;
        }

        const next =
            missions.find(
                (mission) =>
                    !completedMissions[
                        mission.id
                    ]
            );

        if (!next) {
            hideElement(
                navigationArrow
            );
            return;
        }

        showElement(
            navigationArrow
        );

        const dx =
            next.target.x -
            player.position.x;

        const dz =
            next.target.z -
            player.position.z;

        const targetAngle =
            Math.atan2(
                dx,
                dz
            );

        const difference =
            targetAngle -
            player.rotation.y;

        navigationArrow.style.transform =
            `rotate(${difference}rad)`;
    }

    /* =====================================================
       42. MENU
       ===================================================== */

    function toggleMenu() {
        if (!menuScreen) return;

        if (
            menuScreen.classList.contains(
                "hidden"
            )
        ) {
            showElement(menuScreen);
            gamePaused = true;
        } else {
            hideElement(menuScreen);
            gamePaused = false;
        }
    }

    /* =====================================================
       43. MAP
       ===================================================== */

    function openMap() {
        hideElement(menuScreen);
        showElement(mapScreen);
        gamePaused = true;
    }

    function closeMap() {
        hideElement(mapScreen);
        gamePaused = false;
    }

    /* =====================================================
       44. MISSIONS SCREEN
       ===================================================== */

    function openMissions() {
        hideElement(menuScreen);
        showElement(missionsScreen);
        gamePaused = true;

        const list =
            $("missionList");

        if (!list) return;

        list.innerHTML = "";

        missions.forEach(
            (mission) => {
                const item =
                    document.createElement(
                        "div"
                    );

                const completed =
                    !!completedMissions[
                        mission.id
                    ];

                item.textContent =
                    completed
                        ? "✓ " + mission.title
                        : "○ " + mission.title;

                item.className =
                    completed
                        ? "mission-complete"
                        : "mission-pending";

                list.appendChild(item);
            }
        );
    }

    function closeMissions() {
        hideElement(
            missionsScreen
        );

        gamePaused = false;
    }

    /* =====================================================
       45. SETTINGS
       ===================================================== */

    function openSettings() {
        hideElement(menuScreen);
        showElement(settingsScreen);
        gamePaused = true;
    }

    function closeSettings() {
        hideElement(settingsScreen);
        gamePaused = false;
    }

    /* =====================================================
       46. MENU BUTTON AUTO-CONNECTION
       ===================================================== */

    function connectButton(
        id,
        callback
    ) {
        const element = $(id);

        if (!element) return;

        element.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                callback();
            }
        );
    }

    connectButton(
        "menuButton",
        toggleMenu
    );

    connectButton(
        "mapButton",
        openMap
    );

    connectButton(
        "missionsButton",
        openMissions
    );

    connectButton(
        "settingsButton",
        openSettings
    );

    connectButton(
        "closeMapButton",
        closeMap
    );

    connectButton(
        "closeMissionsButton",
        closeMissions
    );

    connectButton(
        "closeSettingsButton",
        closeSettings
    );

    connectButton(
        "resumeButton",
        toggleMenu
    );

    connectButton(
        "createAccountButton",
        createAccount
    );

    connectButton(
        "loginButton",
        loginUser
    );

    connectButton(
        "finishCharacterButton",
        finishCharacterCreation
    );

    /* =====================================================
       47. SETTINGS CONTROLS
       ===================================================== */

    connectButton(
        "qualityLow",
        () => setQuality("low")
    );

    connectButton(
        "qualityMedium",
        () => setQuality("medium")
    );

    connectButton(
        "qualityHigh",
        () => setQuality("high")
    );

    function setQuality(level) {
        if (!renderer) return;

        if (level === "low") {
            renderer.setPixelRatio(1);
        }

        if (level === "medium") {
            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,
                    1.5
                )
            );
        }

        if (level === "high") {
            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                )
            );
        }

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }

    /* =====================================================
       48. DAY / NIGHT
       ===================================================== */

    function updateDayNight(delta) {
        dayTime +=
            delta *
            0.008;

        if (dayTime > 1) {
            dayTime = 0;
        }

        const angle =
            dayTime *
            Math.PI *
            2;

        const sunX =
            Math.cos(angle) *
            100;

        const sunY =
            Math.sin(angle) *
            100;

        sunLight.position.set(
            sunX,
            Math.max(15, sunY),
            50
        );

        const daylight =
            THREE.MathUtils.clamp(
                Math.sin(angle) *
                    0.5 +
                    0.5,
                0.15,
                1
            );

        sunLight.intensity =
            0.5 +
            daylight * 1.7;

        ambientLight.intensity =
            0.5 +
            daylight * 1.1;
    }

    /* =====================================================
       49. TREES WIND
       ===================================================== */

    function updateEnvironment(time) {
        trees.forEach(
            (tree, index) => {
                tree.rotation.z =
                    Math.sin(
                        time * 0.8 +
                        index
                    ) *
                    0.015;

                tree.rotation.x =
                    Math.cos(
                        time * 0.6 +
                        index
                    ) *
                    0.01;
            }
        );
    }

    /* =====================================================
       50. MINIMAP
       ===================================================== */

    function updateMinimap() {
        const minimap =
            $("minimap");

        const playerMarker =
            $("playerMarker");

        if (
            !minimap ||
            !playerMarker ||
            !player
        ) {
            return;
        }

        const rect =
            minimap.getBoundingClientRect();

        const mapSize =
            Math.min(
                rect.width,
                rect.height
            );

        const normalizedX =
            (player.position.x +
                WORLD_SIZE / 2) /
            WORLD_SIZE;

        const normalizedZ =
            (player.position.z +
                WORLD_SIZE / 2) /
            WORLD_SIZE;

        playerMarker.style.left =
            `${normalizedX * 100}%`;

        playerMarker.style.top =
            `${normalizedZ * 100}%`;
    }

    /* =====================================================
       51. RESIZE
       ===================================================== */

    function onResize() {
        if (!camera || !renderer) {
            return;
        }

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }

    /* =====================================================
       52. MAIN GAME LOOP
       ===================================================== */

    function animate() {
        requestAnimationFrame(
            animate
        );

        const delta =
            Math.min(
                clock.getDelta(),
                0.05
            );

        const elapsed =
            clock.elapsedTime;

        if (gameStarted) {
            updatePlayer(delta);
            updateCamera(delta);
            updateGate();
            updateInteraction();
            updateNavigation();
            updateMinimap();
            updateDayNight(delta);
            updateEnvironment(elapsed);
        }

        renderer.render(
            scene,
            camera
        );
    }

    /* =====================================================
       53. INITIAL START
       ===================================================== */

    initThree();
    finishLoading();

})();
