export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export const INCOME_CATEGORIES = [
  '給与',
  'ボーナス',
  '副収入',
  '投資収益',
  'その他'
];

export const EXPENSE_CATEGORIES = [
  '食費',
  '交通費',
  '住居費',
  '水道光熱費',
  '通信費',
  '医療費',
  '娯楽費',
  'ショッピング',
  'その他'
];