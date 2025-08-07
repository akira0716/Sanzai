import type {
  Transaction,
  MonthlyReport,
  YearlyReport,
  ComparisonReport,
  CategorySummary,
} from "../types";

export function generateMonthlyReport(
  transactions: Transaction[],
  targetMonth: string
): MonthlyReport {
  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(targetMonth)
  );

  const incomeTransactions = monthTransactions.filter(
    (t) => t.type === "income"
  );
  const expenseTransactions = monthTransactions.filter(
    (t) => t.type === "expense"
  );

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const incomeByCategory = groupByCategory(incomeTransactions);
  const expenseByCategory = groupByCategory(expenseTransactions);

  const topExpenseCategory =
    expenseByCategory.length > 0
      ? expenseByCategory.reduce((max, cat) =>
          cat.amount > max.amount ? cat : max
        )
      : null;

  const topIncomeCategory =
    incomeByCategory.length > 0
      ? incomeByCategory.reduce((max, cat) =>
          cat.amount > max.amount ? cat : max
        )
      : null;

  // その月の日数を取得
  const [year, month] = targetMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return {
    month: targetMonth,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    incomeByCategory,
    expenseByCategory,
    transactionCount: monthTransactions.length,
    averageTransactionAmount:
      monthTransactions.length > 0
        ? (totalIncome + totalExpense) / monthTransactions.length
        : 0,
    topExpenseCategory,
    topIncomeCategory,
    dailyAverages: {
      income: totalIncome / daysInMonth,
      expense: totalExpense / daysInMonth,
    },
  };
}

export function generateYearlyReport(
  transactions: Transaction[],
  targetYear: number
): YearlyReport {
  const yearTransactions = transactions.filter((t) => {
    const transactionYear = new Date(t.date).getFullYear();
    return transactionYear === targetYear;
  });

  const totalIncome = yearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = yearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // 月別データを生成
  const monthlyData = [];
  for (let month = 1; month <= 12; month++) {
    const monthStr = `${targetYear}-${String(month).padStart(2, "0")}`;
    const monthTransactions = yearTransactions.filter((t) =>
      t.date.startsWith(monthStr)
    );

    const monthIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: monthStr,
      income: monthIncome,
      expense: monthExpense,
      net: monthIncome - monthExpense,
    });
  }

  const incomeByCategory = groupByCategory(
    yearTransactions.filter((t) => t.type === "income")
  );
  const expenseByCategory = groupByCategory(
    yearTransactions.filter((t) => t.type === "expense")
  );

  // 最高・最低の月を見つける
  const monthsWithData = monthlyData.filter(
    (m) => m.income > 0 || m.expense > 0
  );
  const bestMonth =
    monthsWithData.length > 0
      ? monthsWithData.reduce((max, month) =>
          month.net > max.net ? month : max
        )
      : null;

  const worstMonth =
    monthsWithData.length > 0
      ? monthsWithData.reduce((min, month) =>
          month.net < min.net ? month : min
        )
      : null;

  // トレンド計算（前年比較）
  const previousYearTransactions = transactions.filter((t) => {
    const transactionYear = new Date(t.date).getFullYear();
    return transactionYear === targetYear - 1;
  });

  const previousYearIncome = previousYearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousYearExpense = previousYearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeGrowth =
    previousYearIncome > 0
      ? ((totalIncome - previousYearIncome) / previousYearIncome) * 100
      : 0;

  const expenseGrowth =
    previousYearExpense > 0
      ? ((totalExpense - previousYearExpense) / previousYearExpense) * 100
      : 0;

  return {
    year: targetYear,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    monthlyData,
    incomeByCategory,
    expenseByCategory,
    bestMonth,
    worstMonth,
    trends: {
      incomeGrowth,
      expenseGrowth,
    },
  };
}

export function generateComparisonReport(
  transactions: Transaction[],
  currentMonth: string,
  previousMonth: string
): ComparisonReport {
  const current = generateMonthlyReport(transactions, currentMonth);
  const previous = generateMonthlyReport(transactions, previousMonth);

  const calculateChange = (current: number, previous: number) => {
    const amount = current - previous;
    const percentage = previous !== 0 ? (amount / previous) * 100 : 0;
    return { amount, percentage };
  };

  return {
    current,
    previous,
    changes: {
      income: calculateChange(current.totalIncome, previous.totalIncome),
      expense: calculateChange(current.totalExpense, previous.totalExpense),
      net: calculateChange(current.netAmount, previous.netAmount),
    },
  };
}

function groupByCategory(transactions: Transaction[]): CategorySummary[] {
  const grouped = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = {
        category: transaction.category,
        amount: 0,
        count: 0,
      };
    }
    acc[transaction.category].amount += transaction.amount;
    acc[transaction.category].count += 1;
    return acc;
  }, {} as Record<string, CategorySummary>);

  return Object.values(grouped).sort((a, b) => b.amount - a.amount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return `${year}年${parseInt(month)}月`;
}

export function getPreviousMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}
