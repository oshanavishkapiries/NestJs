import Scene from "./Scene.js";
import Ball from "./obj/Ball.js";

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new Scene();

// object
//const ball = new Ball(width / 2, height / 2, 30, "white");

//scene.addSpirit(ball);


for (let i = 0; i < 150; i++) {
    const hue = Math.floor(Math.random() * 360);
    const ball = new Ball(Math.random() * width, Math.random() * height, 30, `hsl(${hue}, 50%, 50%)`);
    scene.addSpirit(ball);
}


