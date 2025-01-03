export default class Sprite {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.height / 2;
    this.isClicked = false;
  }

  update(ctx, mouseX, mouseY, isMouseDown) {
    this.draw(ctx);
    this.move(mouseX, mouseY, isMouseDown);
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "black";
    ctx.fillRect(this.centerX - 5, this.centerY - 5, 10, 10);

    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`${this.x} x ${this.y}`, this.x, this.y + this.height + 15);
  }

  move(mouseX, mouseY, isMouseDown) {
    if (
      isMouseDown &&
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    ) {
      this.x = mouseX - this.width / 2;
      this.y = mouseY - this.height / 2;
      this.centerX = this.x + this.width / 2;
      this.centerY = this.y + this.height / 2;
    }
  }
}
