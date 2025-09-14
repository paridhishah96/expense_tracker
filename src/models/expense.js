export default class Expense {
  constructor(id, date, description, amount, category = null) {
    this.id = id;
    this.date = date;
    this.description = description;
    this.amount = amount;
    this.category = category;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
