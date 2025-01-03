export default class Scene {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseDown = false;
    this.updatables = [];
  }

  addUpdate(object) {
    this.updatables.push(object);
  }

  start() {
    this.canvas.addEventListener("mousedown", () => {
      this.isMouseDown = true;
    });
    this.canvas.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });
    this.canvas.addEventListener("mousemove", (event) => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    });
    requestAnimationFrame(() => this.update());
  }

  update() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(`${window.innerWidth} x ${window.innerHeight}`, 20, 30);

    this.updatables.forEach((sprite) => {
      sprite.update(this.ctx, this.mouseX, this.mouseY, this.isMouseDown);
    });

    requestAnimationFrame(() => this.update());
  }
}
