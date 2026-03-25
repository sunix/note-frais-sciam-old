export type ReceiptImage = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
};

export type ExpenseItem = {
  id: string;
  type: string;
  date: string;
  establishment: string;
  amount: number;
  receipts: ReceiptImage[];
};

export type ExpenseReport = {
  id: string;
  firstName: string;
  lastName: string;
  month: number;
  year: number;
  expenses: ExpenseItem[];
  createdAt: string;
  updatedAt: string;
};

export const EXPENSE_TYPES = [
  'Petit déjeuner',
  'Déjeuner',
  'Diner',
  'Collation',
  'Autres',
] as const;
