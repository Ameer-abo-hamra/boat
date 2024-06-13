import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const loader = new GLTFLoader();

let stats;
let camera, scene, renderer;
let controls, water, sun, mesh, model;
let keys = {}; // Object to track the state of each key
let controlsP;

class Boat {
  constructor() {
    loader.load("models/boat/bass_boat_2/scene.gltf", (gltf) => {
      console.log(gltf);
      model = gltf.scene;
      scene.add(model);
      model.position.set(0, 2, 0);
      model.rotation.y = 550;
      model.scale.set(10, 10, 10);

      this.boat = model;
      this.speed = {
        vel: 0,
        rot: 0,
      };
    });
  }
  update() {
    if (this.boat) {
      this.boat.rotation.y += this.speed.rot;
      this.boat.translateZ(this.speed.vel);
    }
  }
  stop() {
    this.speed.vel = 0;
    this.speed.rot = 0;
  }
}

const boat = new Boat();

init();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(30, 30, 100);

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    side: THREE.DoubleSide,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  updateSun();

  //

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const material = new THREE.MeshStandardMaterial({ roughness: 0 });

  mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  //
  //
  // Set up PointerLockControls
  controlsP = new PointerLockControls(camera, renderer.domElement);

  // Add event listener for click to enable pointer lock
  document.addEventListener(
    "click",
    () => {
      controlsP.lock();
    },
    false
  );

  scene.add(controlsP.getObject());

  //
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // GUI

  const gui = new GUI();

  const folderSky = gui.addFolder("Sky");
  folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
  folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
  folderSky.open();

  const waterUniforms = water.material.uniforms;

  const folderWater = gui.addFolder("Water");
  folderWater
    .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
    .name("distortionScale");
  folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
  folderWater.open();

  //

  window.addEventListener("resize", onWindowResize);

  // Event listener for keydown
  window.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    updateBoat();
  });

  // Event listener for keyup
  window.addEventListener("keyup", function (event) {
    keys[event.key] = false;
    updateBoat();
  });

  function updateBoat() {
    if (keys["ArrowUp"]) {
      boat.speed.vel = 1;
    } else if (keys["ArrowDown"]) {
      boat.speed.vel = -1;
    } else {
      boat.speed.vel = 0; // Stop if neither Up nor Down is pressed
    }

    // Update the boat's rotation only if ArrowUp or ArrowDown is pressed
    if (keys["ArrowUp"] || keys["ArrowDown"]) {
      if (keys["ArrowRight"]) {
        boat.speed.rot = -0.01;
      } else if (keys["ArrowLeft"]) {
        boat.speed.rot = 0.01;
      } else {
        boat.speed.rot = 0; // Stop rotating if neither Right nor Left is pressed
      }
    } else {
      boat.speed.rot = 0; // Stop rotating if neither ArrowUp nor ArrowDown is pressed
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  render();
  stats.update();
  boat.update();
}

function render() {
  const time = performance.now() * 0.001;

  mesh.position.y = Math.sin(time) * 20 + 5;
  mesh.rotation.x = time * 0.5;
  mesh.rotation.z = time * 0.51;

  water.material.uniforms["time"].value += 1.0 / 60.0;
  let moveSpeed = 1;
  let moveForward = keys["w"] || keys["W"];
  let moveBackward = keys["s"] || keys["S"];
  let moveLeft = keys["a"] || keys["A"];
  let moveRight = keys["d"] || keys["D"];

  if (moveForward) {
    controlsP.moveForward(moveSpeed);
  }
  if (moveBackward) {
    controlsP.moveForward(-moveSpeed);
  }
  if (moveLeft) {
    controlsP.moveRight(-moveSpeed);
  }
  if (moveRight) {
    controlsP.moveRight(moveSpeed);
  }
  renderer.render(scene, camera);
}
