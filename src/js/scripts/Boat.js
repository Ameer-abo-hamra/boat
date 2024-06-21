import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
let Vars = {
  m: 10000,
  g: 9.8,
  p: 1000,
  v: 10,
  A: 10,
};
export class Boat {
  constructor(scene) {
    let drowing = setInterval(() => {
      if (this.Drowning) {
        this.drowing();
        clearInterval(drowing);
      }
    }, 10);
    setInterval(() => {
      let moviing = setInterval(() => {
        if (this.isMoving) {
          this.move();
          console.log("boat now is moving ")
          clearInterval(moviing);
        }
      }, 100);
    }, 1000);
    this.scene = scene;
    this.speed = {
      vel: new THREE.Vector3(0, 0, 0), // Velocity vector
      rot: 0,
    };
    this.gui();
    this.m = new THREE.Vector3(0, 1000, 0);
    this.Power = 50;
    this.w = 500;
    this.Vfan = 100;
    this.V0 = new THREE.Vector3(0, 0, 0);
    this.rho = 1000;
    this.A = 10;
    this.accelerate = new THREE.Vector3(0, 0, 0);
    this.cd = 0.0001;
    this.Fthrust = new THREE.Vector3(0, 0, 0);
    this.Fd = new THREE.Vector3(0, 0, 0);
    this.V_air = 1;
    this.V_water = 1.5;
    this.initPromise = this.loadBoatModel();
    this.g = 9.8;
    this.Drowning = false;
    this.isMoving = false;
    this.updateState();
  }

  calcFthrust() {
    return new THREE.Vector3(0, 0, this.Vfan * this.Power);
  }

  updateState() {
    this.Fthrust.add(this.calcFthrust());
  }
  calcFd() {
    return this.Fd.add(-0.5 * this.rho * this.cd * this.A * this.V, 1, 1);
  }
  calcV0() {
    let sqrtValue = Math.sqrt((2 * this.P * 10) / this.m.y);

    this.V0.set(this.V0.x + 0, this.V0.y + 0, sqrtValue);

    return this.V0;
  }

  calcAccelerate() {
    return this.accelerate();
  }

  calcFb() {
    return this.rho * this.g * this.V_water;
  }
  calcWieght() {
    return this.g * this.m.y;
  }
  async loadBoatModel() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("models/boat/bass_boat_2/scene.gltf");
    this.boat = gltf.scene;
    this.boat.position.set(0, 3, 0);
    this.boat.rotation.y = Math.PI; // Adjust rotation if needed
    this.boat.scale.set(10, 10, 10);
    this.scene.add(this.boat);
  }

  isLoaded() {
    return this.boat !== undefined;
  }

  gui() {
    let gui = new GUI();
    const BoatFolder = gui.addFolder("Boat");
    BoatFolder.add(Vars, "m", 500, 2000).onChange((value) => {
      this.m.y = value;
      console.log(this.m.y);
    });
    BoatFolder.add(Vars, "g", 5, 20).onChange((value) => {
      this.g = value;
    });
    BoatFolder.open();
  }

  check() {
    if (this.calcFb() < this.calcWieght()) {
      this.Drowning = true;
    }
  }

  drowing() {
    let d = setInterval(() => {
      this.boat.position.y -= 0.01;
      if (this.boat.position.y < -16) {
        clearInterval(d);
      }
    }, 1);
  }

  move() {
    let move = setInterval(() => {
        if(this.isMoving) {
          this.boat.position.z -=0.05
          console.log(this.boat.position.z)
        }else {
          console.log("done")
          clearInterval(move)
        }
    }, 10);
  }
}
