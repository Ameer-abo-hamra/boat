import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Boat } from "./scripts/Boat";
import { setup } from "./scripts/setup";
import { handleKeyDown, handleKeyUp, animate } from "./scripts/utils";
import { showLoadingScreen, hideLoadingScreen } from "./scripts/loadingScreen";

let camera, scene, renderer, controlsO, controlsP;
let water, boat;
const state = { inBoat: false };
let prompt = document.getElementById("prompt");
let keys = {}; // Object to track the state of each key

init();

async function init() {
  showLoadingScreen();
  ({ camera, scene, renderer, water } = setup());

  boat = new Boat(scene);
  await boat.initPromise;
  hideLoadingScreen();
  console.log("Boat fully initialized.");

  console.log(boat.isLoaded());

  controlsO = new OrbitControls(camera, renderer.domElement);
  controlsO.maxPolarAngle = Math.PI * 0.495;
  controlsO.target.set(0, 10, 0);
  controlsO.minDistance = 40.0;
  controlsO.maxDistance = 200.0;
  controlsO.update();

  // Set up PointerLockControls
  controlsP = new PointerLockControls(camera, renderer.domElement);

  // Add event listener for click to enable pointer lock
  document.addEventListener(
    "click",
    () => {
      // controlsP.lock();
    },
    false
  );

  window.addEventListener("resize", onWindowResize);

  // Call the animate function with all required parameters
  animate(boat, camera, scene, renderer, controlsP, keys, state, prompt, water);
  // Add event listeners for keyboard inputs
  window.addEventListener("keydown", (event) =>
    handleKeyDown(event, keys, boat, state, enterBoat, exitBoat)
  );
  window.addEventListener("keyup", (event) => handleKeyUp(event, keys, boat));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function enterBoat() {
  if (prompt.style.display === "none") {
    return;
  }
  console.log("Entering boat");
  state.inBoat = true;
  prompt.style.display = "none";
  // Adjust camera position when entering the boat
  camera.position.copy(boat.boat.position);
  camera.position.y += 8; // Adjust height to sit inside the boat
  camera.position.z += 8;
  camera.position.x += 8;
  controlsP.lock();
  controlsO.enabled = false;
}
function exitBoat() {
  console.log("Exiting boat");
  state.inBoat = false;
  camera.position.set(
    boat.boat.position.x,
    boat.boat.position.y + 12,
    boat.boat.position.z + 55
  );
  controlsP.unlock();
  controlsO.enabled = true;
}
