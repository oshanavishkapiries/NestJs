export default class Ball {
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;

    this.xSpeed = Math.floor(Math.random() * 5) + 1;
    this.ySpeed = Math.floor(Math.random() * 5) + 1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(params) {
    this.draw(params.ctx);
    this.move();
  }

  // move
  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x > window.innerWidth - this.r || this.x < this.r) {
      this.xSpeed *= -1;
    }
    if (this.y > window.innerHeight - this.r || this.y < this.r) {
      this.ySpeed *= -1;
    }
  }
}
