import Scene from "./Scene.js";
import Spirit from "./Spirit.js";

const scene = new Scene();

const spirit1 = new Spirit(0, 0, 50, 50, "red", "player1");
const spirit2 = new Spirit(60, 0, 50, 50, "red", "player2"); 

scene.addSpirit(spirit1);
scene.addSpirit(spirit2);

scene.start();

