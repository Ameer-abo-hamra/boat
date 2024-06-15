import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class Boat {
  constructor(scene) {
    this.scene = scene;
    this.speed = {
      vel: new THREE.Vector3(0, 0, 0), // Velocity vector
      rot: 0,
    };
    this.maxSpeed = 20; // Max speed of the boat
    this.acceleration = 0.5; // Acceleration rate
    this.deceleration = 1.5; // Deceleration rate
    this.initPromise = this.loadBoatModel();
  }

  async loadBoatModel() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("models/boat/bass_boat_2/scene.gltf");
    this.boat = gltf.scene;
    this.boat.position.set(0, 2, 0);
    this.boat.rotation.y = Math.PI; // Adjust rotation if needed
    this.boat.scale.set(10, 10, 10);
    this.scene.add(this.boat);
  }

  update(deltaTime) {
    console.log(this.speed.vel);
    // Update position based on velocity
    this.boat.position.add(this.speed.vel.clone().multiplyScalar(deltaTime));

    // Update rotation
    this.boat.rotation.y += this.speed.rot * deltaTime;

    // Apply deceleration to velocity
    this.speed.vel.multiplyScalar(this.deceleration);

    // Cap the velocity to the max speed
    if (this.speed.vel.length() > this.maxSpeed) {
      this.speed.vel.setLength(this.maxSpeed);
    }
  }

  stop() {
    this.speed.vel = 0;
    this.speed.rot = 0;
  }

  isLoaded() {
    return this.boat !== undefined;
  }
  accelerate(direction) {
    // Accelerate the boat in the given direction (forward or backward)
    const accelerationVector = new THREE.Vector3(
      Math.sin(this.boat.rotation.y),
      0,
      Math.cos(this.boat.rotation.y)
    ).multiplyScalar(this.acceleration * direction);
    this.speed.vel.add(accelerationVector);
  }
  turn(direction) {
    // Turn the boat (left or right)
    this.speed.rot = direction * 0.1;
  }
}
