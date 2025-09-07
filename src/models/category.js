export default class Category {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color || this.getRandomColor();
  }

  getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
}
