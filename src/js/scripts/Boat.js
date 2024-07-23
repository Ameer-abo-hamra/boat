import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
let Vars = {
  m: 1000,
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
          console.log("boat now is moving ");
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
    this.m = 1000;
    this.Power = new THREE.Vector3(1, 1, 500);
    this.weight = new THREE.Vector3(1, 1, 1);
    this.Vfan = 10;
    this.rho = 1000;
    this.A = 10;
    this.accelerate = new THREE.Vector3(1, 1, 1);
    this.cd = 0.0001;
    this.Fthrust = new THREE.Vector3(1, 1, 1);
    this.Fd = new THREE.Vector3(1, 1, 1);
    this.Fb = new THREE.Vector3(1, 1, 1);
    this.speed_Air = new THREE.Vector3(1, 1, 20);
    this.speed_Water = new THREE.Vector3(1, 1, 1);
    this.volume_Water = this.m/this.rho
    this.initPromise = this.loadBoatModel();
    this.g = new THREE.Vector3(0, 9.8, 0);
    this.Drowning = false;
    this.isMoving = false;
    this.calcFthrust();
    this.calcFd();
    this.calcFb();
    this.calcWeight();
    this.clearInterval = 0 ;
  }
  calcFd() {
    let x = this.rho * this.A * this.cd * 0.5;
    let V = new THREE.Vector3(0, 0, 0);
    V.add(this.speed_Air);
    V.add(this.speed_Water);
    V.set(V.x * V.x, V.y * V.y, V.z * V.z);
    V.multiplyScalar(x);
    this.Fd.copy(V)
    return this.Fd;
  }
  calcFthrust() {
    let test = new THREE.Vector3();
    test.copy(this.Power);
    test.multiplyScalar(this.Vfan);
    return this.Fthrust.copy(test);
  }

  calcFb() {
    let test = new THREE.Vector3();
    test.copy(this.g);
    test.multiplyScalar(this.volume_Water).multiplyScalar(this.rho);
    return this.Fb.copy(test);
  }

  calcWeight() {
    let test = new THREE.Vector3(0, this.m * this.g.y, 0);
    this.weight.copy(test);

    return this.weight;
  }

  calcAccelerate() {
    let test = new THREE.Vector3(0, 0, 0);

    test.add(this.Fthrust).sub(this.Fd).add(this.Fb).sub(this.weight);

    let accelerate = new THREE.Vector3();

    if (this.m !== 0 && this.m !== 0 && this.m !== 0) {
      accelerate.set(test.x / this.m, test.y / this.m, test.z / this.m);
    } else {
      return "lkml";
    }
    this.accelerate.copy(accelerate)
    return this.accelerate;
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
      this.m = value;
      console.log(this.m);
    });
    BoatFolder.add(Vars, "g", 5, 20).onChange((value) => {
      this.g = value;
    });
    BoatFolder.open();
  }

  check() {
    this.calcAccelerate();
  }

  drowing() {
    let d = setInterval(() => {
      this.boat.position.y -= 0.0001;
      if (this.boat.position.y < -16) {
        clearInterval(d);
      }
    }, 1);
  }

  // move() {
  //   let time = 0 ; 
  
  
  // }

  // stop() {
  
  // }
}
