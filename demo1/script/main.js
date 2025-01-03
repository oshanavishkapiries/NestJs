import Sprite from "./object/Sprite.js";
import Scene from "./Scene.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scene = new Scene(canvas, ctx);

const sprite1 = new Sprite(
  window.innerWidth / 2 - 50,
  window.innerHeight / 2,
  100,
  100,
  "red"
);

const sprite2 = new Sprite(
  window.innerWidth / 2 - 200,
  window.innerHeight / 2 + 100,
  400,
  100,
  "blue"
);

const sprite3 = new Sprite(50, 50, 50, 50, "lightgreen");
const sprite4 = new Sprite(110, 50, 50, 50, "lightgreen");
const sprite5 = new Sprite(210, 50, 50, 50, "lightgreen");
const sprite6 = new Sprite(310, 50, 50, 50, "lightgreen");

scene.addUpdate(sprite1);
scene.addUpdate(sprite2);
scene.addUpdate(sprite3);
scene.addUpdate(sprite4);
scene.addUpdate(sprite5);
scene.addUpdate(sprite6);

scene.start();
