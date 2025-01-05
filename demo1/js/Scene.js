export default class Scene {
  isMouseDown = false;
  mouseX = 0;
  mouseY = 0;
  isStarted = false;

  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");

    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const playButton = document.getElementById("playButton");
    playButton.addEventListener("click", () => {
      if (!this.isStarted) {
        this.isStarted = true;
        playButton.textContent = "Stop";
        this.render();
      } else {
        this.isStarted = false;
        playButton.textContent = "Play";
      }
    });

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

    this.spirits = [];
  }

  addSpirit(spirit) {
    this.spirits.push(spirit);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.spirits.forEach((spirit) => {
      spirit.update({
        canvas: this.canvas,
        ctx: this.ctx,
        mouseX: this.mouseX,
        mouseY: this.mouseY,
        isMouseDown: this.isMouseDown,
      });
    });
    if (this.isStarted) {
      requestAnimationFrame(this.render.bind(this));
    }
  }
}
