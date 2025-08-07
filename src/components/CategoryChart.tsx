import type { Transaction, CategorySummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CategoryChartProps {
  transactions: Transaction[];
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transaction.type === "expense" &&
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const categoryData: CategorySummary[] = currentMonthExpenses.reduce(
    (acc, transaction) => {
      const existing = acc.find(
        (item) => item.category === transaction.category
      );
      if (existing) {
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: transaction.category,
          amount: transaction.amount,
          count: 1,
        });
      }
      return acc;
    },
    [] as CategorySummary[]
  );

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#d084d0",
    "#87d068",
    "#ffc0cb",
    "#ffb347",
    "#98fb98",
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const monthName = new Date().toLocaleDateString("ja-JP", { month: "long" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monthName}のカテゴリ別支出</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            今月の支出データがありません
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, percent }) =>
                    `${category} ${(percent! * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "金額"]}
                  labelFormatter={(label) => `カテゴリ: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
