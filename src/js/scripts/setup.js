import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// Function to create the scene
export function createScene() {
  const scene = new THREE.Scene();
  return scene;
}

// Function to create the camera
export function createCamera() {
  return new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
}

// Function to create the renderer
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

// Function to create water
export function createWater(scene) {
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  const water = new Water(waterGeometry, {
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
  return water;
}

// Function to create sky
export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  return sky;
}

// Function to create the sun and update its position
export function createSun(sky, water, renderer, scene, parameters) {
  const sun = new THREE.Vector3();

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

  return { sun, updateSun };
}


// Function to setup GUI
export function setupGUI(parameters, water, updateSun) {
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
}
export function setupStats() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);
}
// Main function to setup the scene, camera, renderer, and other components
export function setup() {
  const renderer = createRenderer();
  const scene = createScene();
  const camera = createCamera();

  const water = createWater(scene);
  const sky = createSky(scene);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const parameters = {
    elevation: 2,
    azimuth: 180,
  };
  const { sun, updateSun } = createSun(sky, water, renderer, scene, parameters);

  const updateSunBound = () =>
    updateSun(sky, water, pmremGenerator, scene, parameters);
  updateSunBound();
  setupGUI(parameters, water, updateSunBound);
  setupStats();
  return { camera, scene, renderer, water, sun };
}
