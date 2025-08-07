import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
} from "lucide-react";
import type { MonthlyReport, ComparisonReport } from "../types";
import { formatCurrency, formatPercentage } from "../utils/reportUtils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface MonthlyReportViewProps {
  report: MonthlyReport;
  comparison?: ComparisonReport;
}

export function MonthlyReportView({
  report,
  comparison,
}: MonthlyReportViewProps) {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ];

  const expenseChartData = report.expenseByCategory.map((category, index) => ({
    ...category,
    fill: COLORS[index % COLORS.length],
  }));

  const incomeChartData = report.incomeByCategory.map((category, index) => ({
    ...category,
    fill: COLORS[index % COLORS.length],
  }));

  const categoryBarData = [
    ...report.incomeByCategory.map((cat) => ({
      name: cat.category,
      収入: cat.amount,
      支出: 0,
      type: "income",
    })),
    ...report.expenseByCategory.map((cat) => ({
      name: cat.category,
      収入: 0,
      支出: cat.amount,
      type: "expense",
    })),
  ];

  const renderChangeIndicator = (change: {
    amount: number;
    percentage: number;
  }) => {
    const isPositive = change.amount >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm">
          {formatCurrency(Math.abs(change.amount))} (
          {formatPercentage(change.percentage)})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーサマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {report.month.split("-").join("年")}月 詳細レポート
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">総収入</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(report.totalIncome)}
              </p>
              {comparison && renderChangeIndicator(comparison.changes.income)}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">総支出</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(report.totalExpense)}
              </p>
              {comparison && renderChangeIndicator(comparison.changes.expense)}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">収支</p>
              <p
                className={`text-2xl font-semibold ${
                  report.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(report.netAmount)}
              </p>
              {comparison && renderChangeIndicator(comparison.changes.net)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">取引件数</p>
              <p className="text-xl font-semibold">
                {report.transactionCount}件
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">平均取引額</p>
              <p className="text-xl font-semibold">
                {formatCurrency(report.averageTransactionAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">日平均収入</p>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrency(report.dailyAverages.income)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">日平均支出</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(report.dailyAverages.expense)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* トップカテゴリ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {report.topIncomeCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">最大収入カテゴリ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {report.topIncomeCategory.category}
                  </span>
                  <Badge variant="secondary">
                    {report.topIncomeCategory.count}件
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrency(report.topIncomeCategory.amount)}
                </p>
                <Progress
                  value={
                    (report.topIncomeCategory.amount / report.totalIncome) * 100
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {report.topExpenseCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">最大支出カテゴリ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {report.topExpenseCategory.category}
                  </span>
                  <Badge variant="secondary">
                    {report.topExpenseCategory.count}件
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-red-600">
                  {formatCurrency(report.topExpenseCategory.amount)}
                </p>
                <Progress
                  value={
                    (report.topExpenseCategory.amount / report.totalExpense) *
                    100
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出カテゴリ円グラフ */}
        {expenseChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                支出カテゴリ別内訳
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) =>
                      `${category}: ${formatCurrency(amount)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 収入カテゴリ円グラフ */}
        {incomeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                収入カテゴリ別内訳
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) =>
                      `${category}: ${formatCurrency(amount)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {incomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* カテゴリ別バーチャート */}
      {categoryBarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別収支比較</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="収入" fill="#10b981" />
                <Bar dataKey="支出" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
