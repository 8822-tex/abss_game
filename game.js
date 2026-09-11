/*
  ABSS INSTITUTE OF TECHNOLOGY - 3D CAMPUS GAME
  game.js
  Existing index.html + style.css compatible
*/

(function () {
  "use strict";

  /* =====================================================
     THREE.JS LOADER
     Existing HTML can keep its current Three.js script.
     If that CDN fails, game.js tries another CDN.
     ===================================================== */

  var THREE_URLS = [
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js",
    "https://unpkg.com/three@0.180.0/build/three.min.js"
  ];

  var scene, camera, renderer, player, clock;
  var leftLeg, rightLeg, leftArm, rightArm;

  var velocityY = 0;
  var onGround = true;
  var running = false;

  var walkTime = 0;

  /* Full 360-degree camera */
  var yaw = 0;
  var pitch = -0.16;

  var lookActive = false;
  var lastLookX = 0;
  var lastLookY = 0;

  var joystick = {
    x: 0,
    y: 0,
    active: false
  };

  var keys = {
    forward: false,
    back: false,
    left: false,
    right: false
  };

  var interactPressed = false;

  var nearDoor = null;

  var doors = [];
  var lights = [];
  var npcs = [];
  var animals = [];
  var bicycles = [];

  var tmp;
  var cameraTarget;

  var gameStarted = false;


  /* =====================================================
     START
     ===================================================== */

  function boot() {

    if (typeof window.THREE !== "undefined") {
      startGame();
      return;
    }

    loadThreeFallback(0);
  }


  function loadThreeFallback(index) {

    if (index >= THREE_URLS.length) {

      showError(
        "Three.js could not load. Please check your internet connection and reload the page."
      );

      return;
    }

    var old =
      document.querySelector(
        'script[data-abss-three-fallback="true"]'
      );

    if (old) {
      old.remove();
    }

    var script = document.createElement("script");

    script.src = THREE_URLS[index];
    script.async = false;
    script.dataset.abssThreeFallback = "true";

    script.onload = function () {

      if (window.THREE) {
        startGame();
      } else {
        loadThreeFallback(index + 1);
      }

    };

    script.onerror = function () {
      loadThreeFallback(index + 1);
    };

    document.head.appendChild(script);
  }


  function showError(message) {

    document.body.innerHTML =
      '<div style="' +
      'min-height:100vh;' +
      'background:#111820;' +
      'color:#fff;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'text-align:center;' +
      'padding:30px;' +
      'font-family:Arial,sans-serif' +
      '">' +

      '<div>' +
      '<h2>ABSS MAP</h2>' +
      '<p>' + message + '</p>' +
      '<p style="opacity:.7;font-size:13px">' +
      'The 3D library is unavailable.' +
      '</p>' +
      '</div>' +

      '</div>';
  }


  /* =====================================================
     MATERIAL
     ===================================================== */

  function mat(color, roughness, metalness) {

    return new THREE.MeshStandardMaterial({
      color: color,
      roughness:
        roughness == null ? 0.82 : roughness,
      metalness:
        metalness == null ? 0 : metalness
    });
  }


  /* =====================================================
     BASIC BOX
     ===================================================== */

  function addBox(
    w,
    h,
    d,
    material,
    x,
    y,
    z,
    parent
  ) {

    var mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
      );

    mesh.position.set(
      x || 0,
      y || 0,
      z || 0
    );

    if (parent) {
      parent.add(mesh);
    } else {
      scene.add(mesh);
    }

    return mesh;
  }


  /* =====================================================
     SIGN / BOARD
     ===================================================== */

  function label(text, width) {

    var canvas =
      document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 180;

    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f4f1e8";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.strokeStyle = "#8c302c";
    ctx.lineWidth = 10;

    ctx.strokeRect(
      5,
      5,
      canvas.width - 10,
      canvas.height - 10
    );

    ctx.fillStyle = "#7f2927";
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var words = text.split(" ");
    var line = "";
    var lines = [];

    for (var i = 0; i < words.length; i++) {

      var test =
        line
          ? line + " " + words[i]
          : words[i];

      if (
        ctx.measureText(test).width > 900 &&
        line
      ) {

        lines.push(line);
        line = words[i];

      } else {

        line = test;
      }
    }

    if (line) {
      lines.push(line);
    }

    var start =
      canvas.height / 2 -
      (lines.length - 1) * 30;

    for (var j = 0; j < lines.length; j++) {

      ctx.fillText(
        lines[j],
        canvas.width / 2,
        start + j * 60
      );
    }

    var texture =
      new THREE.CanvasTexture(canvas);

    texture.colorSpace =
      THREE.SRGBColorSpace;

    var mesh =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          width || 8,
          (width || 8) * 0.176
        ),
        new THREE.MeshBasicMaterial({
          map: texture
        })
      );

    return mesh;
  }


  /* =====================================================
     GAME INITIALIZATION
     ===================================================== */

  function startGame() {

    if (gameStarted) {
      return;
    }

    if (!window.THREE) {
      showError("Three.js is unavailable.");
      return;
    }

    gameStarted = true;

    scene = new THREE.Scene();

    scene.background =
      new THREE.Color(0x8db9d0);

    scene.fog =
      new THREE.Fog(
        0x8db9d0,
        120,
        520
      );

    camera =
      new THREE.PerspectiveCamera(
        65,
        window.innerWidth /
          window.innerHeight,
        0.1,
        800
      );

    camera.position.set(
      0,
      4.5,
      16
    );

    try {

      renderer =
        new THREE.WebGLRenderer({
          antialias: true,
          powerPreference:
            "high-performance"
        });

    } catch (error) {

      showError(
        "WebGL could not start on this device."
      );

      return;
    }

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
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

    document.body.appendChild(
      renderer.domElement
    );

    clock =
      new THREE.Clock();

    tmp =
      new THREE.Vector3();

    cameraTarget =
      new THREE.Vector3();


    /* LIGHT */

    scene.add(
      new THREE.HemisphereLight(
        0xeaf7ff,
        0x38552f,
        1.8
      )
    );

    var sun =
      new THREE.DirectionalLight(
        0xfff0d0,
        2.6
      );

    sun.position.set(
      120,
      170,
      90
    );

    sun.castShadow = true;

    sun.shadow.mapSize.set(
      1024,
      1024
    );

    sun.shadow.camera.left = -210;
    sun.shadow.camera.right = 210;
    sun.shadow.camera.top = 210;
    sun.shadow.camera.bottom = -210;

    scene.add(sun);


    /* WORLD */

    createGround();
    createRoads();
    createMainGate();

    createAcademicBlocks();
    createHostels();

    createGardens();
    createSports();
    createParking();
    createTrees();

    createNpcs();
    createAnimals();
    createBicycles();

    createPlayer();

    createMiniMap();


    /* CONTROLS */

    setupKeyboard();
    setupJoystick();
    setupLook();
    setupButtons();
    setupInteraction();


    window.addEventListener(
      "resize",
      resize
    );


    var loading =
      document.getElementById(
        "loading"
      );

    if (loading) {

      setTimeout(
        function () {
          loading.classList.add("hide");
        },
        450
      );
    }

    animate();
  }


  /* =====================================================
     GROUND
     ===================================================== */

  function createGround() {

    var ground =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          500,
          500
        ),
        mat(0x4e7d45)
      );

    ground.rotation.x =
      -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);


    for (var i = 0; i < 55; i++) {

      var r =
        2.5 + (i % 5);

      var patch =
        new THREE.Mesh(
          new THREE.CircleGeometry(
            r,
            12
          ),
          mat(
            i % 2
              ? 0x598b4d
              : 0x47783f
          )
        );

      patch.rotation.x =
        -Math.PI / 2;

      patch.position.set(
        ((i * 47) % 280) - 140,
        0.012,
        ((i * 83) % 260) - 130
      );

      scene.add(patch);
    }
  }


  /* =====================================================
     ROADS
     ===================================================== */

  function road(
    x,
    z,
    w,
    d,
    color
  ) {

    var m =
      addBox(
        w,
        0.1,
        d,
        mat(
          color == null
            ? 0x55585b
            : color
        ),
        x,
        0.05,
        z
      );

    m.receiveShadow = true;

    return m;
  }


  function createRoads() {

    road(0, 25, 18, 290);

    road(0, -50, 300, 18);

    road(0, 108, 300, 16);

    road(-108, 20, 14, 250);

    road(108, 20, 14, 250);

    road(
      0,
      -12,
      8,
      55,
      0xb9b2a5
    );

    road(
      0,
      55,
      8,
      55,
      0xb9b2a5
    );
  }


  /* =====================================================
     MAIN GATE
     ===================================================== */

  function createMainGate() {

    var brick =
      mat(0x913f31);

    var dark =
      mat(0x5d3028);

    var white =
      mat(0xf0eee6);

    var metal =
      mat(
        0x544d49,
        0.32,
        0.65
      );


    [-13, 13].forEach(
      function (x) {

        var pillar =
          addBox(
            4.5,
            9,
            4.5,
            brick,
            x,
            4.5,
            108
          );

        pillar.castShadow = true;

        addBox(
          5,
          0.5,
          5,
          white,
          x,
          9.25,
          108
        );

        addBox(
          4.8,
          0.7,
          4.8,
          dark,
          x,
          0.35,
          108
        );


        var lamp =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              0.38,
              12,
              8
            ),
            new THREE.MeshStandardMaterial({
              color: 0xffd36b,
              emissive: 0xffa000,
              emissiveIntensity: 1.6
            })
          );

        lamp.position.set(
          x,
          9.75,
          108
        );

        scene.add(lamp);
      }
    );


    addBox(
      25,
      1.3,
      1.4,
      brick,
      0,
      7.9,
      108
    );


    var sign =
      label(
        "ABSS INSTITUTE OF TECHNOLOGY",
        12
      );

    sign.position.set(
      0,
      6.55,
      107.25
    );

    scene.add(sign);


    var left =
      new THREE.Group();

    var right =
      new THREE.Group();

    buildGatePanel(
      left,
      -1,
      metal
    );

    buildGatePanel(
      right,
      1,
      metal
    );


    left.position.set(
      0,
      2.45,
      106.5
    );

    right.position.set(
      0,
      2.45,
      106.5
    );


    scene.add(
      left,
      right
    );


    doors.push(
      {
        group: left,
        side: -1,
        gate: true
      },
      {
        group: right,
        side: 1,
        gate: true
      }
    );


    road(
      0,
      118,
      30,
      20,
      0x646667
    );
  }


  function buildGatePanel(
    group,
    side,
    metal
  ) {

    var panel =
      addBox(
        11,
        4.8,
        0.35,
        mat(0x493128),
        side * 5.5,
        0,
        0,
        group
      );

    panel.castShadow = true;


    for (var i = 0; i < 7; i++) {

      addBox(
        0.18,
        4.8,
        0.45,
        metal,
        side * (i * 1.55 + 1),
        0,
        0,
        group
      );
    }
  }


  /* =====================================================
     BUILDINGS
     ===================================================== */

  function createBuilding(
    x,
    z,
    w,
    d,
    floors,
    name,
    options
  ) {

    options = options || {};

    var h =
      floors * 4.1;

    var bodyMat =
      mat(
        options.bodyColor ||
          0xa9483b
      );


    var body =
      addBox(
        w,
        h,
        d,
        bodyMat,
        x,
        h / 2,
        z
      );

    body.castShadow = true;
    body.receiveShadow = true;


    for (
      var f = 1;
      f < floors;
      f++
    ) {

      addBox(
        w + 0.2,
        0.2,
        d + 0.2,
        mat(0xf0eee8),
        x,
        f * 4.1,
        z
      );
    }


    var roof =
      addBox(
        w + 1,
        0.35,
        d + 1,
        mat(0x7c2b2b),
        x,
        h + 0.18,
        z
      );

    roof.castShadow = true;


    createWindows(
      x,
      z,
      w,
      d,
      floors
    );


    var board =
      label(
        name,
        Math.min(
          12,
          Math.max(
            6,
            w * 0.25
          )
        )
      );

    board.position.set(
      x,
      h - 1.05,
      z - d / 2 - 0.08
    );

    scene.add(board);


    if (
      options.interior !== false
    ) {

      createBuildingInterior(
        x,
        z,
        w,
        d,
        floors,
        name
      );
    }
  }


  function createWindows(
    x,
    z,
    w,
    d,
    floors
  ) {

    var glass =
      mat(
        0x78b4c7,
        0.18,
        0.08
      );

    var frame =
      mat(0xf1eee5);


    var count =
      Math.max(
        4,
        Math.floor(w / 4.2)
      );


    for (
      var f = 0;
      f < floors;
      f++
    ) {

      var y =
        1.65 +
        f * 4.1;


      for (
        var i = 0;
        i < count;
        i++
      ) {

        var px =
          x -
          w / 2 +
          2.2 +
          i *
          (
            (w - 4.4) /
            Math.max(
              1,
              count - 1
            )
          );


        addBox(
          1.45,
          1.55,
          0.08,
          glass,
          px,
          y,
          z - d / 2 - 0.07
        );


        addBox(
          0.07,
          1.72,
          0.12,
          frame,
          px,
          y,
          z - d / 2 - 0.12
        );
      }
    }
  }


  /* =====================================================
     SIMPLE INTERIORS
     ===================================================== */

  function createBuildingInterior(
    x,
    z,
    w,
    d,
    floors,
    name
  ) {

    var floorMat =
      mat(0xaaa79f);


    for (
      var f = 0;
      f < floors;
      f++
    ) {

      var y =
        f * 4.1;


      addBox(
        w - 3,
        0.08,
        d - 3,
        floorMat,
        x,
        y + 0.04,
        z
      );


      addBox(
        0.18,
        3.7,
        d - 3,
        mat(0xe7e2d7),
        x,
        y + 1.9,
        z
      );


      for (
        var side = -1;
        side <= 1;
        side += 2
      ) {

        var roomX =
          x +
          side *
          (w / 4);


        for (
          var r = -1;
          r <= 1;
          r += 2
        ) {

          var roomZ =
            z +
            r *
            (d / 4);


          addFurnitureSet(
            roomX,
            y + 0.1,
            roomZ,
            Math.max(
              8,
              (w - 8) / 2
            ),
            f,
            side,
            name
          );
        }
      }
    }


    addStairs(
      x,
      z,
      w,
      d,
      floors
    );

    addEntryDoor(
      x,
      z,
      d,
      name
    );
  }


  function addFurnitureSet(
    x,
    y,
    z,
    roomW,
    floor,
    side,
    name
  ) {

    var wood =
      mat(0x80583c);

    var top =
      mat(0x8b6b4c);


    for (
      var i = -1;
      i <= 1;
      i++
    ) {

      var desk =
        addBox(
          2.3,
          0.16,
          0.8,
          top,
          x + i * 2.4,
          y + 1.0,
          z
        );


      addBox(
        0.12,
        1,
        0.12,
        wood,
        desk.position.x - 0.9,
        y + 0.5,
        z - 0.28
      );


      addBox(
        0.12,
        1,
        0.12,
        wood,
        desk.position.x + 0.9,
        y + 0.5,
        z - 0.28
      );


      addBox(
        1.8,
        0.12,
        0.35,
        wood,
        desk.position.x,
        y + 0.55,
        z + 0.75
      );
    }


    /* BOARD */

    addBox(
      Math.min(5.5, roomW),
      2.1,
      0.12,
      mat(0xeeeeea),
      x,
      y + 2.45,
      z - 1.3
    );


    /* CEILING FANS */

    for (
      var f = 0;
      f < 2;
      f++
    ) {

      var fan =
        new THREE.Group();


      var hub =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.13,
            0.13,
            0.12,
            12
          ),
          mat(0x5a5a58)
        );

      hub.rotation.x =
        Math.PI / 2;

      fan.add(hub);


      for (
        var b = 0;
        b < 4;
        b++
      ) {

        var blade =
          addBox(
            0.12,
            0.08,
            1.15,
            mat(0x777875),
            0,
            0,
            -0.55,
            fan
          );

        blade.rotation.y =
          b * Math.PI / 2;
      }


      fan.position.set(
        x +
        (
          f
            ? roomW * 0.25
            : -roomW * 0.25
        ),
        y + 3.75,
        z
      );

      fan.rotation.x =
        Math.PI / 2;

      scene.add(fan);


      lights.push({
        object: fan,
        type: "fan",
        speed: 2.5
      });
    }
  }


  /* =====================================================
     STAIRS
     ===================================================== */

  function addStairs(
    x,
    z,
    w,
    d,
    floors
  ) {

    var stairX =
      x +
      w / 2 -
      3;

    var stairZ = z;


    for (
      var f = 0;
      f < floors - 1;
      f++
    ) {

      for (
        var s = 0;
        s < 10;
        s++
      ) {

        addBox(
          2.8,
          0.28,
          0.8,
          mat(0xb6b1a7),
          stairX,
          f * 4.1 +
            0.2 +
            s * 0.18,
          stairZ -
            3.5 +
            s * 0.8
        );
      }


      addBox(
        0.08,
        1.0,
        8,
        mat(0x55524d),
        stairX - 1.4,
        f * 4.1 + 1,
        stairZ
      );


      addBox(
        0.08,
        1.0,
        8,
        mat(0x55524d),
        stairX + 1.4,
        f * 4.1 + 1,
        stairZ
      );
    }
  }


  /* =====================================================
     BUILDING ENTRY DOOR
     ===================================================== */

  function addEntryDoor(
    x,
    z,
    d,
    name
  ) {

    var door =
      addBox(
        3.4,
        3,
        0.22,
        mat(0x53332a),
        x,
        1.5,
        z - d / 2 - 0.14
      );


    door.userData = {
      name: name,
      open: false
    };


    doors.push({
      mesh: door,
      openX: x + 1.7,
      closedX: x,
      open: false,
      sliding: true
    });


    addBox(
      3.8,
      0.35,
      1.5,
      mat(0xe5e0d5),
      x,
      3.2,
      z - d / 2 - 0.4
    );
  }


  /* =====================================================
     ACADEMIC BLOCKS
     ===================================================== */

  function createAcademicBlocks() {

    createBuilding(
      0,
      -75,
      58,
      30,
      4,
      "ABSS INSTITUTE OF TECHNOLOGY"
    );


    createBuilding(
      -62,
      -58,
      42,
      27,
      4,
      "MAHATMA GANDHI BLOCK"
    );


    createBuilding(
      62,
      -58,
      42,
      27,
      4,
      "VISHVESVARAYA BLOCK"
    );


    var glass =
      mat(
        0x83c0d3,
        0.15,
        0.05
      );


    [-20, 20].forEach(
      function (x) {

        addBox(
          2.4,
          9,
          2.4,
          mat(0xf0eee8),
          x,
          4.5,
          -91
        );
      }
    );


    addBox(
      48,
      1.2,
      8,
      mat(0x922e2e),
      0,
      9,
      -91
    );


    addBox(
      17,
      6,
      0.22,
      glass,
      0,
      3.2,
      -90.35
    );


    var sign =
      label(
        "ABSS",
        6
      );

    sign.position.set(
      0,
      5.4,
      -90.5
    );

    scene.add(sign);
  }


  /* =====================================================
     HOSTELS
     ===================================================== */

  function createHostels() {

    createHostel(
      -78,
      65,
      "CHANDRASHEKHAR AZAD BOYS HOSTEL"
    );


    createHostel(
      78,
      65,
      "GIRLS HOSTEL"
    );
  }


  function createHostel(
    x,
    z,
    name
  ) {

    createBuilding(
      x,
      z,
      40,
      27,
      4,
      name,
      {
        bodyColor: 0xa2473b
      }
    );


    addBox(
      7,
      3.2,
      0.6,
      mat(0x6d332b),
      x,
      1.6,
      z - 13.7
    );


    addBox(
      10,
      0.55,
      4,
      mat(0xe7e2d8),
      x,
      4,
      z - 15
    );
  }


  /* =====================================================
     GARDENS
     ===================================================== */

  function createGardens() {

    var lawn =
      addBox(
        78,
        0.08,
        32,
        mat(0x58894a),
        0,
        0.04,
        -12
      );

    lawn.receiveShadow = true;


    for (
      var x = -36;
      x <= 36;
      x += 6
    ) {

      bush(x, -29);
      bush(x, 4);
    }


    for (
      var p = -25;
      p <= 25;
      p += 10
    ) {

      flower(p, -15);
    }


    for (
      var h = -36;
      h <= 36;
      h += 4
    ) {

      hedge(h, -35);
    }
  }


  function bush(x, z) {

    var b =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.25,
          8,
          6
        ),
        mat(0x2e6b35)
      );

    b.position.set(
      x,
      0.9,
      z
    );

    b.scale.y = 0.7;

    b.castShadow = true;

    scene.add(b);
  }


  function hedge(x, z) {

    addBox(
      3.5,
      1,
      0.7,
      mat(0x2d6834),
      x,
      0.5,
      z
    );
  }


  function flower(x, z) {

    addBox(
      0.04,
      0.45,
      0.04,
      mat(0x2d6a35),
      x,
      0.22,
      z
    );


    var f =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.16,
          6,
          5
        ),
        mat(0xe6c85a)
      );

    f.position.set(
      x,
      0.48,
      z
    );

    scene.add(f);
  }


  /* =====================================================
     SPORTS
     ===================================================== */

  function createSports() {

    var field =
      addBox(
        58,
        0.08,
        36,
        mat(0x3f7841),
        70,
        0.04,
        105
      );

    field.receiveShadow = true;


    addBox(
      32,
      0.1,
      20,
      mat(0x3d789e),
      70,
      0.09,
      105
    );


    var line =
      mat(0xf3f0e8);


    [54, 86].forEach(
      function (x) {

        addBox(
          0.16,
          0.03,
          20,
          line,
          x,
          0.16,
          105
        );
      }
    );


    [95, 115].forEach(
      function (z) {

        addBox(
          32,
          0.03,
          0.16,
          line,
          70,
          0.16,
          z
        );
      }
    );


    createHoop(
      54,
      105
    );

    createHoop(
      86,
      105
    );
  }


  function createHoop(
    x,
    z
  ) {

    addBox(
      0.16,
      3.2,
      0.16,
      mat(0x55595a),
      x,
      1.6,
      z
    );


    addBox(
      1.4,
      1,
      0.08,
      mat(0xe9e9e4),
      x,
      3.2,
      z
    );


    var ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.45,
          0.06,
          8,
          24
        ),
        mat(0xd96b2b)
      );

    ring.rotation.x =
      Math.PI / 2;

    ring.position.set(
      x,
      2.65,
      z - 0.45
    );

    scene.add(ring);
  }


  /* =====================================================
     PARKING
     ===================================================== */

  function createParking() {

    road(
      -75,
      20,
      46,
      26,
      0x686a6b
    );


    for (
      var x = -95;
      x <= -55;
      x += 5
    ) {

      addBox(
        0.12,
        0.03,
        20,
        mat(0xe7e7e7),
        x,
        0.1,
        20
      );
    }
  }


  /* =====================================================
     TREES
     ===================================================== */

  function createTree(
    x,
    z,
    s
  ) {

    s = s || 1;


    var trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.32 * s,
          0.46 * s,
          3 * s,
          8
        ),
        mat(0x68442e)
      );


    trunk.position.set(
      x,
      1.5 * s,
      z
    );

    trunk.castShadow = true;

    scene.add(trunk);


    var crown =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          2 * s,
          10,
          8
        ),
        mat(0x2d6834)
      );


    crown.position.set(
      x,
      3.65 * s,
      z
    );

    crown.castShadow = true;

    scene.add(crown);
  }


  function createTrees() {

    var positions = [

      [-120, -95],
      [-105, -82],
      [-90, -105],

      [90, -105],
      [108, -88],
      [122, -100],

      [-120, 20],
      [-115, 55],
      [-115, 95],

      [115, 20],
      [115, 55],
      [115, 95],

      [-48, 110],
      [48, 110],

      [-35, 35],
      [35, 35],

      [-42, -28],
      [42, -28]
    ];


    positions.forEach(
      function (p, i) {

        createTree(
          p[0],
          p[1],
          i % 3 === 0
            ? 1.3
            : 1
        );
      }
    );
  }


  /* =====================================================
     PLAYER
     ===================================================== */

  function createPlayer() {

    player =
      new THREE.Group();


    var shirt =
      addBox(
        1.15,
        0.9,
        0.62,
        mat(0xf3f3f3),
        0,
        1.7,
        0,
        player
      );

    shirt.castShadow = true;


    var body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.52,
          1.35,
          4,
          8
        ),
        mat(0xeeeeee)
      );

    body.position.y =
      1.5;

    body.castShadow = true;

    player.add(body);


    var head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.43,
          14,
          10
        ),
        mat(0xd89b72)
      );

    head.position.y =
      2.65;

    head.castShadow = true;

    player.add(head);


    var legMat =
      mat(0x20252b);


    leftLeg =
      addBox(
        0.35,
        1.1,
        0.4,
        legMat,
        -0.22,
        0.55,
        0,
        player
      );


    rightLeg =
      addBox(
        0.35,
        1.1,
        0.4,
        legMat,
        0.22,
        0.55,
        0,
        player
      );


    leftArm =
      addBox(
        0.25,
        0.9,
        0.28,
        mat(0xd89b72),
        -0.7,
        1.65,
        0,
        player
      );


    rightArm =
      addBox(
        0.25,
        0.9,
        0.28,
        mat(0xd89b72),
        0.7,
        1.65,
        0,
        player
      );


    leftLeg.castShadow =
      true;

    rightLeg.castShadow =
      true;

    leftArm.castShadow =
      true;

    rightArm.castShadow =
      true;


    var backLabel =
      label(
        "ABSSIT",
        1.4
      );

    backLabel.position.set(
      0,
      1.72,
      0.33
    );

    backLabel.rotation.y =
      Math.PI;

    player.add(backLabel);


    player.position.set(
      0,
      0,
      98
    );

    scene.add(player);
  }


  /* =====================================================
     NPCs
     ===================================================== */

  function createNpcs() {

    createNpc(
      -3,
      -7,
      0x6f2c2c,
      "Reception Mam"
    );


    createNpc(
      52,
      -47,
      0x2b4f7d,
      "Teacher"
    );


    createNpc(
      -50,
      -45,
      0x4e6738,
      "Teacher"
    );
  }


  function createNpc(
    x,
    z,
    shirtColor,
    name
  ) {

    var npc =
      new THREE.Group();


    npc.position.set(
      x,
      0,
      z
    );


    npc.userData = {
      name: name,
      target:
        new THREE.Vector3(
          x,
          0,
          z
        ),
      timer:
        Math.random() * 4
    };


    addBox(
      0.95,
      1,
      0.55,
      mat(shirtColor),
      0,
      1.65,
      0,
      npc
    );


    var head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.4,
          12,
          8
        ),
        mat(0xc98f68)
      );

    head.position.y =
      2.5;

    npc.add(head);


    addBox(
      0.32,
      1,
      0.38,
      mat(0x252a31),
      -0.2,
      0.5,
      0,
      npc
    );


    addBox(
      0.32,
      1,
      0.38,
      mat(0x252a31),
      0.2,
      0.5,
      0,
      npc
    );


    scene.add(npc);

    npcs.push(npc);
  }


  /* =====================================================
     ANIMALS
     ===================================================== */

  function createAnimals() {

    var specs = [

      {
        x: -30,
        z: -22,
        color: 0x8a6a48,
        scale: 0.45,
        kind: "squirrel"
      },

      {
        x: 28,
        z: -20,
        color: 0xe7e2d7,
        scale: 0.55,
        kind: "rabbit"
      },

      {
        x: -48,
        z: 8,
        color: 0x7c7c7c,
        scale: 0.5,
        kind: "monkey"
      }
    ];


    specs.forEach(
      function (s) {

        var a =
          new THREE.Group();


        a.position.set(
          s.x,
          s.scale,
          s.z
        );


        var body =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              s.scale,
              8,
              6
            ),
            mat(s.color)
          );

        body.scale.z = 1.4;

        a.add(body);


        var head =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              s.scale * 0.7,
              8,
              6
            ),
            mat(s.color)
          );

        head.position.z =
          -s.scale * 0.9;

        a.add(head);


        a.userData = {

          kind: s.kind,

          state: "wander",

          dir:
            Math.random() *
            Math.PI *
            2,

          speed:
            0.7 +
            Math.random() * 0.7,

          change: 0
        };


        scene.add(a);

        animals.push(a);
      }
    );
  }


  /* =====================================================
     BICYCLES
     ===================================================== */

  function createBicycles() {

    var positions = [
      [-83, 24],
      [-88, 24],
      [-93, 24]
    ];


    positions.forEach(
      function (p) {

        var bike =
          new THREE.Group();


        bike.position.set(
          p[0],
          0.75,
          p[1]
        );


        bike.userData = {
          riding: false
        };


        [-0.65, 0.65].forEach(
          function (x) {

            var wheel =
              new THREE.Mesh(
                new THREE.TorusGeometry(
                  0.65,
                  0.07,
                  8,
                  18
                ),
                mat(
                  0x242424,
                  0.45,
                  0.25
                )
              );

            wheel.rotation.y =
              Math.PI / 2;

            wheel.position.x =
              x;

            bike.add(wheel);
          }
        );


        var frame =
          mat(
            0x9b3430,
            0.5,
            0.15
          );


        addBox(
          0.08,
          0.08,
          1.3,
          frame,
          0,
          0.4,
          0,
          bike
        );


        addBox(
          0.08,
          0.7,
          0.08,
          frame,
          0,
          0.75,
          0,
          bike
        );


        addBox(
          0.08,
          0.08,
          0.75,
          frame,
          0,
          0.8,
          0,
          bike
        );


        scene.add(bike);

        bicycles.push(bike);
      }
    );
  }


  /* =====================================================
     KEYBOARD
     ===================================================== */

  function setupKeyboard() {

    window.addEventListener(
      "keydown",
      function (e) {

        if (
          e.code === "KeyW" ||
          e.code === "ArrowUp"
        ) {
          keys.forward = true;
        }


        if (
          e.code === "KeyS" ||
          e.code === "ArrowDown"
        ) {
          keys.back = true;
        }


        if (
          e.code === "KeyA" ||
          e.code === "ArrowLeft"
        ) {
          keys.left = true;
        }


        if (
          e.code === "KeyD" ||
          e.code === "ArrowRight"
        ) {
          keys.right = true;
        }


        if (
          e.code === "ShiftLeft" ||
          e.code === "ShiftRight"
        ) {
          running = true;
        }


        if (e.code === "Space") {
          jump();
        }


        if (
          e.code === "KeyE" ||
          e.code === "Enter"
        ) {
          interactPressed = true;
        }
      }
    );


    window.addEventListener(
      "keyup",
      function (e) {

        if (
          e.code === "KeyW" ||
          e.code === "ArrowUp"
        ) {
          keys.forward = false;
        }


        if (
          e.code === "KeyS" ||
          e.code === "ArrowDown"
        ) {
          keys.back = false;
        }


        if (
          e.code === "KeyA" ||
          e.code === "ArrowLeft"
        ) {
          keys.left = false;
        }


        if (
          e.code === "KeyD" ||
          e.code === "ArrowRight"
        ) {
          keys.right = false;
        }


        if (
          e.code === "ShiftLeft" ||
          e.code === "ShiftRight"
        ) {
          running = false;
        }
      }
    );
  }


  /* =====================================================
     JOYSTICK
     ===================================================== */

  function setupJoystick() {

    var base =
      document.getElementById(
        "joystick"
      );

    var stick =
      document.getElementById(
        "stick"
      );


    if (!base || !stick) {
      return;
    }


    function move(
      px,
      py
    ) {

      var r =
        base.getBoundingClientRect();


      var cx =
        r.left +
        r.width / 2;


      var cy =
        r.top +
        r.height / 2;


      var max =
        r.width / 2 -
        14;


      var dx =
        px - cx;

      var dy =
        py - cy;


      var d =
        Math.hypot(
          dx,
          dy
        );


      if (d > max) {

        dx =
          dx / d * max;

        dy =
          dy / d * max;
      }


      stick.style.transform =
        "translate(" +
        dx +
        "px," +
        dy +
        "px)";


      joystick.x =
        dx / max;

      joystick.y =
        dy / max;
    }


    function reset() {

      joystick.active =
        false;

      joystick.x = 0;
      joystick.y = 0;

      stick.style.transform =
        "translate(0,0)";
    }


    base.addEventListener(
      "pointerdown",
      function (e) {

        joystick.active =
          true;

        base.setPointerCapture(
          e.pointerId
        );

        move(
          e.clientX,
          e.clientY
        );
      }
    );


    base.addEventListener(
      "pointermove",
      function (e) {

        if (
          joystick.active
        ) {

          move(
            e.clientX,
            e.clientY
          );
        }
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


  /* =====================================================
     FREE CAMERA LOOK
     ===================================================== */

  function setupLook() {

    var area =
      document.getElementById(
        "lookArea"
      );


    if (!area) {
      return;
    }


    area.addEventListener(
      "pointerdown",
      function (e) {

        lookActive = true;

        lastLookX =
          e.clientX;

        lastLookY =
          e.clientY;

        area.setPointerCapture(
          e.pointerId
        );
      }
    );


    area.addEventListener(
      "pointermove",
      function (e) {

        if (!lookActive) {
          return;
        }


        var dx =
          e.clientX -
          lastLookX;


        var dy =
          e.clientY -
          lastLookY;


        lastLookX =
          e.clientX;

        lastLookY =
          e.clientY;


        var sensitivityEl =
          document.getElementById(
            "cameraSensitivity"
          );


        var sensitivity =
          sensitivityEl
            ? Number(
                sensitivityEl.value
              )
            : 0.006;


        if (
          !isFinite(
            sensitivity
          )
        ) {

          sensitivity =
            0.006;
        }


        yaw -=
          dx *
          sensitivity;


        pitch -=
          dy *
          sensitivity *
          0.67;


        pitch =
          THREE.MathUtils.clamp(
            pitch,
            -1.45,
            1.35
          );
      }
    );


    function stop() {
      lookActive = false;
    }


    area.addEventListener(
      "pointerup",
      stop
    );


    area.addEventListener(
      "pointercancel",
      stop
    );
  }


  /* =====================================================
     BUTTONS
     ===================================================== */

  function setupButtons() {

    var jumpBtn =
      document.getElementById(
        "jumpBtn"
      );


    var runBtn =
      document.getElementById(
        "runBtn"
      );


    if (jumpBtn) {

      jumpBtn.addEventListener(
        "pointerdown",
        function (e) {

          e.preventDefault();

          jump();
        }
      );
    }


    if (runBtn) {

      runBtn.addEventListener(
        "pointerdown",
        function (e) {

          e.preventDefault();

          running = true;
        }
      );


      [
        "pointerup",
        "pointercancel",
        "pointerleave"
      ].forEach(
        function (ev) {

          runBtn.addEventListener(
            ev,
            function () {

              running = false;
            }
          );
        }
      );
    }
  }


  /* =====================================================
     INTERACTION
     ===================================================== */

  function setupInteraction() {

    var hint =
      document.getElementById(
        "lookHint"
      );


    if (hint) {

      hint.textContent =
        "Drag right side to look • E to interact";
    }


    window.addEventListener(
      "pointerdown",
      function () {

        if (nearDoor) {
          interactPressed = true;
        }
      },
      {
        passive: true
      }
    );
  }


  /* =====================================================
     JUMP
     ===================================================== */

  function jump() {

    if (onGround) {

      velocityY = 7.2;

      onGround = false;
    }
  }


  /* =====================================================
     PLAYER MOVEMENT
     ===================================================== */

  function updatePlayer(dt) {

    var x = 0;
    var z = 0;


    if (keys.left) {
      x -= 1;
    }


    if (keys.right) {
      x += 1;
    }


    if (keys.forward) {
      z -= 1;
    }


    if (keys.back) {
      z += 1;
    }


    if (
      Math.abs(joystick.x) >
        0.08 ||
      Math.abs(joystick.y) >
        0.08
    ) {

      x = joystick.x;
      z = joystick.y;
    }


    var len =
      Math.hypot(
        x,
        z
      );


    if (len > 1) {

      x /= len;
      z /= len;
    }


    var moving =
      Math.abs(x) >
        0.08 ||
      Math.abs(z) >
        0.08;


    var speed =
      running
        ? 13
        : 6.5;


    /* CAMERA RELATIVE MOVEMENT */

    var sin =
      Math.sin(yaw);

    var cos =
      Math.cos(yaw);


    var moveX =
      x * cos +
      z * sin;


    var moveZ =
      -x * sin +
      z * cos;


    var oldX =
      player.position.x;

    var oldZ =
      player.position.z;


    player.position.x +=
      moveX *
      speed *
      dt;


    player.position.z +=
      moveZ *
      speed *
      dt;


    player.position.x =
      THREE.MathUtils.clamp(
        player.position.x,
        -145,
        145
      );


    player.position.z =
      THREE.MathUtils.clamp(
        player.position.z,
        -140,
        140
      );


    if (
      collidesWithSolid(
        player.position.x,
        player.position.z
      )
    ) {

      player.position.x =
        oldX;

      player.position.z =
        oldZ;
    }


    /* CHARACTER TURN */

    if (moving) {

      var target =
        Math.atan2(
          moveX,
          moveZ
        );


      player.rotation.y =
        lerpAngle(
          player.rotation.y,
          target,
          Math.min(
            1,
            dt * 10
          )
        );


      /* WALK ANIMATION */

      walkTime +=
        dt *
        (
          running
            ? 15
            : 9
        );


      var swing =
        Math.sin(
          walkTime
        ) *
        (
          running
            ? 0.68
            : 0.43
        );


      leftLeg.rotation.x =
        swing;

      rightLeg.rotation.x =
        -swing;


      leftArm.rotation.x =
        -swing * 0.75;

      rightArm.rotation.x =
        swing * 0.75;

    } else {

      var k =
        Math.min(
          1,
          dt * 10
        );


      leftLeg.rotation.x =
        THREE.MathUtils.lerp(
          leftLeg.rotation.x,
          0,
          k
        );


      rightLeg.rotation.x =
        THREE.MathUtils.lerp(
          rightLeg.rotation.x,
          0,
          k
        );


      leftArm.rotation.x =
        THREE.MathUtils.lerp(
          leftArm.rotation.x,
          0,
          k
        );


      rightArm.rotation.x =
        THREE.MathUtils.lerp(
          rightArm.rotation.x,
          0,
          k
        );
    }


    /* GRAVITY */

    velocityY -=
      18 * dt;


    player.position.y +=
      velocityY * dt;


    if (
      player.position.y <= 0
    ) {

      player.position.y = 0;

      velocityY = 0;

      onGround = true;
    }


    updateDoors(dt);

    updateNearestDoor();
  }


  /* =====================================================
     SIMPLE COLLISION
     ===================================================== */

  function collidesWithSolid(
    x,
    z
  ) {

    var solids = [

      [
        -29,
        -104,
        29,
        -60
      ],

      [
        -83,
        -72,
        -41,
        -45
      ],

      [
        41,
        -72,
        83,
        -45
      ],

      [
        -98,
        52,
        -58,
        78
      ],

      [
        58,
        52,
        98,
        78
      ]
    ];


    for (
      var i = 0;
      i < solids.length;
      i++
    ) {

      var s =
        solids[i];


      if (
        x > s[0] &&
        x < s[2] &&
        z > s[1] &&
        z < s[3]
      ) {

        return true;
      }
    }


    return false;
  }


  /* =====================================================
     DOORS + GATE
     ===================================================== */

  function updateDoors(dt) {

    var nearGate =
      player.position.z >
        96 &&
      player.position.z <
        122 &&
      Math.abs(
        player.position.x
      ) < 22;


    doors.forEach(
      function (d) {

        if (d.gate) {

          var target =
            nearGate
              ? 9
              : 0;


          d.group.position.x =
            THREE.MathUtils.lerp(
              d.group.position.x,
              d.side * target,
              Math.min(
                1,
                dt * 5
              )
            );

        } else if (d.sliding) {

          var distance =
            Math.hypot(
              player.position.x -
                d.closedX,

              player.position.z -
                (
                  d.mesh.position.z +
                  0.14
                )
            );


          var open =
            d.open;


          if (
            interactPressed &&
            distance < 5
          ) {

            open = !open;
          }


          d.open =
            open;


          d.mesh.position.x =
            THREE.MathUtils.lerp(
              d.mesh.position.x,
              open
                ? d.openX
                : d.closedX,
              Math.min(
                1,
                dt * 8
              )
            );
        }
      }
    );


    interactPressed = false;
  }


  function updateNearestDoor() {

    nearDoor = null;

    var best = 999;


    doors.forEach(
      function (d) {

        if (!d.mesh) {
          return;
        }


        var dist =
          Math.hypot(
            player.position.x -
              d.mesh.position.x,

            player.position.z -
              d.mesh.position.z
          );


        if (
          dist < 4.5 &&
          dist < best
        ) {

          best = dist;

          nearDoor = d;
        }
      }
    );
  }


  /* =====================================================
     CAMERA
     ===================================================== */

  function updateCamera(dt) {

    var distance =
      8.5;


    var horizontal =
      Math.cos(pitch) *
      distance;


    var targetX =
      player.position.x +
      Math.sin(yaw) *
      horizontal;


    var targetZ =
      player.position.z +
      Math.cos(yaw) *
      horizontal;


    var targetY =
      player.position.y +
      2.8 +
      Math.sin(pitch) *
      distance;


    cameraTarget.set(
      targetX,
      targetY,
      targetZ
    );


    camera.position.lerp(
      cameraTarget,
      Math.min(
        1,
        dt * 8
      )
    );


    tmp.set(
      player.position.x,
      player.position.y + 1.55,
      player.position.z
    );


    camera.lookAt(tmp);
  }


  /* =====================================================
     NPC WORLD UPDATE
     ===================================================== */

  function updateWorld(dt) {

    for (
      var i = 0;
      i < lights.length;
      i++
    ) {

      if (
        lights[i].type ===
        "fan"
      ) {

        lights[i].object.rotation.z +=
          dt *
          lights[i].speed;
      }
    }


    for (
      var n = 0;
      n < npcs.length;
      n++
    ) {

      var npc =
        npcs[n];


      npc.userData.timer -=
        dt;


      if (
        npc.userData.timer <=
        0
      ) {

        npc.userData.timer =
          3 +
          Math.random() * 4;


        npc.userData.target.set(
          npc.position.x +
            (
              Math.random() -
              0.5
            ) * 12,

          0,

          npc.position.z +
            (
              Math.random() -
              0.5
            ) * 12
        );
      }


      var dx =
        npc.userData.target.x -
        npc.position.x;


      var dz =
        npc.userData.target.z -
        npc.position.z;


      var d =
        Math.hypot(
          dx,
          dz
        );


      if (d > 0.8) {

        npc.position.x +=
          dx / d *
          dt *
          1.1;


        npc.position.z +=
          dz / d *
          dt *
          1.1;


        npc.rotation.y =
          Math.atan2(
            dx,
            dz
          );
      }
    }


    for (
      var a = 0;
      a < animals.length;
      a++
    ) {

      updateAnimal(
        animals[a],
        dt
      );
    }
  }


  /* =====================================================
     ANIMAL AI
     ===================================================== */

  function updateAnimal(
    animal,
    dt
  ) {

    var dx =
      animal.position.x -
      player.position.x;


    var dz =
      animal.position.z -
      player.position.z;


    var dist =
      Math.hypot(
        dx,
        dz
      );


    if (dist < 7) {

      animal.userData.state =
        "flee";
    }


    if (
      animal.userData.state ===
      "flee"
    ) {

      var len =
        Math.max(
          0.001,
          dist
        );


      animal.position.x +=
        dx / len *
        dt *
        (
          animal.userData.speed +
          2.2
        );


      animal.position.z +=
        dz / len *
        dt *
        (
          animal.userData.speed +
          2.2
        );


      if (dist > 20) {

        animal.userData.state =
          "wander";
      }


      return;
    }


    animal.userData.change -=
      dt;


    if (
      animal.userData.change <=
      0
    ) {

      animal.userData.change =
        2 +
        Math.random() * 4;


      animal.userData.dir +=
        (
          Math.random() -
          0.5
        ) * 2;
    }


    animal.position.x +=
      Math.sin(
        animal.userData.dir
      ) *
      animal.userData.speed *
      dt;


    animal.position.z +=
      Math.cos(
        animal.userData.dir
      ) *
      animal.userData.speed *
      dt;


    animal.rotation.y =
      animal.userData.dir;


    if (
      Math.abs(
        animal.position.x
      ) > 60
    ) {

      animal.userData.dir =
        Math.PI -
        animal.userData.dir;
    }


    if (
      Math.abs(
        animal.position.z
      ) > 50
    ) {

      animal.userData.dir =
        -animal.userData.dir;
    }
  }


  /* =====================================================
     MINI MAP
     ===================================================== */

  function createMiniMap() {

    var old =
      document.getElementById(
        "abssMiniMap"
      );


    if (old) {
      old.remove();
    }


    var map =
      document.createElement(
        "div"
      );


    map.id =
      "abssMiniMap";


    map.style.cssText =
      "position:fixed;" +
      "right:12px;" +
      "top:54px;" +
      "width:118px;" +
      "height:118px;" +
      "border:2px solid rgba(255,255,255,.7);" +
      "border-radius:12px;" +
      "background:rgba(20,30,25,.55);" +
      "z-index:8;" +
      "overflow:hidden;" +
      "pointer-events:none;" +
      "box-shadow:0 2px 8px #0008";


    map.innerHTML =

      '<div style="' +
      'position:absolute;' +
      'left:8px;' +
      'top:8px;' +
      'color:#fff;' +
      'font:700 8px Arial' +
      '">ABSS MAP</div>' +

      '<div style="' +
      'position:absolute;' +
      'left:48px;' +
      'top:28px;' +
      'width:22px;' +
      'height:42px;' +
      'background:#a94739;' +
      'border:1px solid #eee' +
      '"></div>' +

      '<div style="' +
      'position:absolute;' +
      'left:18px;' +
      'top:72px;' +
      'width:25px;' +
      'height:18px;' +
      'background:#a94739' +
      '"></div>' +

      '<div style="' +
      'position:absolute;' +
      'left:75px;' +
      'top:72px;' +
      'width:25px;' +
      'height:18px;' +
      'background:#a94739' +
      '"></div>' +

      '<div style="' +
      'position:absolute;' +
      'left:52px;' +
      'top:82px;' +
      'width:14px;' +
      'height:14px;' +
      'background:#3d789e' +
      '"></div>' +

      '<div id="abssMapPlayer" style="' +
      'position:absolute;' +
      'width:8px;' +
      'height:8px;' +
      'border-radius:50%;' +
      'background:#fff;' +
      'border:2px solid #222' +
      '"></div>';


    document.body.appendChild(
      map
    );
  }


  function updateMiniMap() {

    var p =
      document.getElementById(
        "abssMapPlayer"
      );


    if (
      !p ||
      !player
    ) {
      return;
    }


    var x =
      THREE.MathUtils.clamp(
        (
          player.position.x +
          150
        ) / 300,
        0,
        1
      );


    var z =
      THREE.MathUtils.clamp(
        (
          player.position.z +
          150
        ) / 300,
        0,
        1
      );


    p.style.left =
      (
        x * 102 + 5
      ) + "px";


    p.style.top =
      (
        (1 - z) * 102 + 5
      ) + "px";
  }


  /* =====================================================
     ANGLE INTERPOLATION
     ===================================================== */

  function lerpAngle(
    a,
    b,
    t
  ) {

    var d =
      (
        b -
        a +
        Math.PI
      ) %
      (
        Math.PI * 2
      ) -
      Math.PI;


    return a + d * t;
  }


  /* =====================================================
     RESIZE
     ===================================================== */

  function resize() {

    if (
      !camera ||
      !renderer
    ) {
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


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
    );
  }


  /* =====================================================
     GAME LOOP
     ===================================================== */

  function animate() {

    requestAnimationFrame(
      animate
    );


    var dt =
      Math.min(
        clock.getDelta(),
        0.05
      );


    updatePlayer(dt);

    updateWorld(dt);

    updateCamera(dt);

    updateMiniMap();


    renderer.render(
      scene,
      camera
    );
  }


  /* =====================================================
     START
     ===================================================== */

  boot();

})();
