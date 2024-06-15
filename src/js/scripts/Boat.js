import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Boat {
  constructor(scene) {
    this.scene = scene;
    this.speed = {
      vel: 0,
      rot: 0,
    };
    this.initPromise = this.loadBoatModel();
  }

  async loadBoatModel() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('models/boat/bass_boat_2/scene.gltf');
    this.boat = gltf.scene;
    this.boat.position.set(0, 2, 0);
    this.boat.rotation.y = Math.PI;  // Adjust rotation if needed
    this.boat.scale.set(10, 10, 10);
    this.scene.add(this.boat);
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

  isLoaded() {
    return this.boat !== undefined;
  }
}
