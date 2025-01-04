export default class Spirit {
  constructor(x, y, w, h, color, name) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.name = name;
  }
  draw({ ctx, mouseX, mouseY, isMouseDown }) {
    console.log(this.name, mouseX, mouseY, isMouseDown);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    this.move(mouseX, mouseY, isMouseDown);
  }

  move(mouseX, mouseY, isMouseDown) {
    if (isMouseDown) {
      if(this.isOnObject(mouseX, mouseY)){
        this.x = mouseX;
        this.y = mouseY;
      }
    }
  }

  isOnObject(mouseX, mouseY){
        return this.x < mouseX && this.x + this.w > mouseX && this.y < mouseY && this.y + this.h > mouseY;
  }
}
