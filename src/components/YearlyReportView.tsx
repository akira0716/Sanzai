import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
} from "lucide-react";
import type { YearlyReport } from "../types";
import {
  formatCurrency,
  formatPercentage,
  getMonthName,
} from "../utils/reportUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface YearlyReportViewProps {
  report: YearlyReport;
}

export function YearlyReportView({ report }: YearlyReportViewProps) {
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

  const monthlyChartData = report.monthlyData.map((month) => ({
    月: parseInt(month.month.split("-")[1]),
    収入: month.income,
    支出: month.expense,
    収支: month.net,
  }));

  const expenseChartData = report.expenseByCategory
    .slice(0, 8)
    .map((category, index) => ({
      ...category,
      fill: COLORS[index % COLORS.length],
    }));

  const incomeChartData = report.incomeByCategory
    .slice(0, 8)
    .map((category, index) => ({
      ...category,
      fill: COLORS[index % COLORS.length],
    }));

  return (
    <div className="space-y-6">
      {/* ヘッダーサマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {report.year}年 年間レポート
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">年間総収入</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(report.totalIncome)}
              </p>
              {report.trends.incomeGrowth !== 0 && (
                <div
                  className={`flex items-center gap-1 ${
                    report.trends.incomeGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {report.trends.incomeGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    前年比 {formatPercentage(report.trends.incomeGrowth)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">年間総支出</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(report.totalExpense)}
              </p>
              {report.trends.expenseGrowth !== 0 && (
                <div
                  className={`flex items-center gap-1 ${
                    report.trends.expenseGrowth >= 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {report.trends.expenseGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    前年比 {formatPercentage(report.trends.expenseGrowth)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">年間収支</p>
              <p
                className={`text-2xl font-semibold ${
                  report.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(report.netAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                平均月収支: {formatCurrency(report.netAmount / 12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ベスト・ワーストマンス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {report.bestMonth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Award className="h-5 w-5" />
                最高収支月
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {getMonthName(report.bestMonth.month)}
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrency(report.bestMonth.net)}
                </p>
                <Badge variant="secondary">優秀</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {report.worstMonth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                最低収支月
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {getMonthName(report.worstMonth.month)}
                </p>
                <p className="text-2xl font-semibold text-red-600">
                  {formatCurrency(report.worstMonth.net)}
                </p>
                <Badge variant="destructive">注意</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 月次推移グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>月次収支推移</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="月" tickFormatter={(value) => `${value}月`} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name,
                ]}
                labelFormatter={(value) => `${value}月`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="収入"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="支出"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="収支"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 月別収支バーチャート */}
      <Card>
        <CardHeader>
          <CardTitle>月別収支比較</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="月" tickFormatter={(value) => `${value}月`} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name,
                ]}
                labelFormatter={(value) => `${value}月`}
              />
              <Legend />
              <Bar dataKey="収入" fill="#10b981" />
              <Bar dataKey="支出" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 年間カテゴリ別分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 年間支出カテゴリ */}
        {expenseChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>年間支出カテゴリ別内訳</CardTitle>
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

        {/* 年間収入カテゴリ */}
        {incomeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>年間収入カテゴリ別内訳</CardTitle>
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

      {/* カテゴリ別詳細テーブル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>支出カテゴリ詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.expenseByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count}件
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>収入カテゴリ詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.incomeByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count}件
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
