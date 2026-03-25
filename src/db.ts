import Dexie, { type Table } from 'dexie';
import type { ExpenseReport } from './types';

export class ExpenseDB extends Dexie {
  reports!: Table<ExpenseReport, string>;

  constructor() {
    super('ExpenseReportDB');
    this.version(1).stores({
      reports: 'id, lastName, firstName, month, year, createdAt',
    });
  }
}

export const db = new ExpenseDB();
