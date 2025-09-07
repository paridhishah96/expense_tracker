import { v4 as uuidv4 } from 'uuid';

export default class RecurringTransaction {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.category = data.category || 'Other';
    this.frequency = data.frequency || 'monthly'; // monthly, biweekly, weekly
    this.startDate = data.startDate || new Date().toISOString().split('T')[0];
    this.endDate = data.endDate || null; // null means indefinite
    this.type = data.type || 'expense'; // expense or income
    this.lastProcessed = data.lastProcessed || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  getNextOccurrences(count = 1) {
    const occurrences = [];
    let currentDate = new Date(this.lastProcessed || this.startDate);
   
    for (let i = 0; i < count; i++) {
      // Move to next occurrence
      switch (this.frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
     
      // Check if we've passed the end date
      if (this.endDate && new Date(currentDate) > new Date(this.endDate)) {
        break;
      }
     
      occurrences.push(new Date(currentDate).toISOString().split('T')[0]);
    }
   
    return occurrences;
  }
}
