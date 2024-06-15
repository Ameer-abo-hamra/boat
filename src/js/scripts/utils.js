import * as THREE from "three";
// Handle key down events
export function handleKeyDown(event, keys, boat, state, enterBoat, exitBoat) {
  //   console.log(event.key.toLowerCase());
  keys[event.key.toLowerCase()] = true;
  if (event.key === "Enter" && boat && boat.isLoaded()) {
    // console.log(state.inBoat);
    state.inBoat ? exitBoat() : enterBoat();
  }
}

// Handle key up events
export function handleKeyUp(event, keys) {
  keys[event.key.toLowerCase()] = false;
}

// Main animation loop
export function animate(
  boat,
  camera,
  scene,
  renderer,
  controls,
  keys,
  state,
  prompt,
  water,
) {
  const deltaTime = 0.016; // Assume a fixed time step for simplicity

  function render() {
    // console.log(inBoat);
    handleBoatMovement(keys, boat, deltaTime);
    if (!state.inBoat) {
      //   console.log("out");
      handlePlayerMovement(keys, controls);
      updatePromptVisibility(camera, boat, prompt);
    } else if (state.inBoat) {
      //   console.log("in");
      handleBoatMovement(keys, boat, deltaTime);
      updateCameraInBoat(camera, boat);
    }

    updateWater(water);
    // updateSun();

    renderer.render(scene, camera);
  }

  function loop() {
    requestAnimationFrame(loop);
    render();
  }

  loop();
}

// Handle player movement outside the boat with WASD keys
function handlePlayerMovement(keys, controls) {
  const moveSpeed = 1.2;
  if (keys["w"]) controls.moveForward(moveSpeed);
  if (keys["s"]) controls.moveForward(-moveSpeed);
  if (keys["a"]) controls.moveRight(-moveSpeed);
  if (keys["d"]) controls.moveRight(moveSpeed);
}

// Handle boat movement with arrow keys
function handleBoatMovement(keys, boat, deltaTime) {
  const moveSpeed = 50;
  boat.speed.vel = keys["arrowup"]
    ? moveSpeed * deltaTime
    : keys["arrowdown"]
    ? -moveSpeed * deltaTime
    : 0;
  boat.speed.rot = keys["arrowleft"]
    ? 0.2 * deltaTime
    : keys["arrowright"]
    ? -0.2 * deltaTime
    : 0;
  boat.update();
}

// Update camera position and rotation to stay in the boat
function updateCameraInBoat(camera, boat) {
  const offset = new THREE.Vector3(-0.8, 0.8, -0.8); // Adjust these offsets as needed
  const relativeCameraOffset = offset.applyMatrix4(boat.boat.matrixWorld);

  camera.position.copy(relativeCameraOffset);
  camera.rotation.copy(boat.boat.rotation);
  camera.rotation.y += Math.PI; // Rotate 180 degrees to face the opposite direction
}

// Update water properties
function updateWater(water) {
  if (water && water.material && water.material.uniforms) {
    water.material.uniforms["time"].value += 1.0 / 60.0;
  }
}

// Update prompt visibility
function updatePromptVisibility(camera, boat, prompt) {
  if (camera && boat && boat.isLoaded()) {
    const distance = camera.position.distanceTo(boat.boat.position);
    prompt.style.display = distance < 60 ? "block" : "none";
  }
}
