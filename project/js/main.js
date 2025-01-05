import Scene from "./Scene.js";
import Ball from "./obj/Ball.js";

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new Scene();

// object
const ball = new Ball(width / 2, height / 2, 30, "white");

scene.addSpirit(ball);

scene.start();
