import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { MonthlyReport, YearlyReport } from "../types";
import {
  formatCurrency,
  formatPercentage,
  getMonthName,
} from "../utils/reportUtils";

interface PDFMonthlyReportProps {
  report: MonthlyReport;
  comparison?: {
    previous: MonthlyReport;
    changes: {
      income: { amount: number; percentage: number };
      expense: { amount: number; percentage: number };
      net: { amount: number; percentage: number };
    };
  };
}

interface PDFYearlyReportProps {
  report: YearlyReport;
}

// 月別レポートPDF用コンポーネント
export const PDFMonthlyReportView = forwardRef<
  HTMLDivElement,
  PDFMonthlyReportProps
>(({ report, comparison }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-8 space-y-6"
      style={{
        minWidth: "210mm",
        maxWidth: "210mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {/* ヘッダー */}
      <div
        className="text-center border-b-2 border-gray-300 pb-4"
        style={{ borderBottomColor: "#d1d5db" }}
      >
        <h1
          className="text-3xl font-bold text-gray-800"
          style={{ color: "#1f2937" }}
        >
          家計簿月別レポート
        </h1>
        <h2 className="text-xl text-gray-600 mt-2" style={{ color: "#4b5563" }}>
          {getMonthName(report.month)}
        </h2>
        <p className="text-sm text-gray-500 mt-1" style={{ color: "#6b7280" }}>
          生成日時: {new Date().toLocaleString("ja-JP")}
        </p>
      </div>

      {/* 収支サマリー */}
      <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
        <CardHeader
          style={{
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <CardTitle style={{ color: "#111827" }}>月間収支サマリー</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: "1rem" }}>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                総収入
              </p>
              <p
                className="text-2xl font-bold text-green-600"
                style={{ color: "#059669" }}
              >
                {formatCurrency(report.totalIncome)}
              </p>
              {comparison && (
                <p
                  className={`text-sm ${
                    comparison.changes.income.amount >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{
                    color:
                      comparison.changes.income.amount >= 0
                        ? "#059669"
                        : "#dc2626",
                  }}
                >
                  前月比:{" "}
                  {formatCurrency(Math.abs(comparison.changes.income.amount))}(
                  {formatPercentage(comparison.changes.income.percentage)})
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                総支出
              </p>
              <p
                className="text-2xl font-bold text-red-600"
                style={{ color: "#dc2626" }}
              >
                {formatCurrency(report.totalExpense)}
              </p>
              {comparison && (
                <p
                  className={`text-sm ${
                    comparison.changes.expense.amount >= 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                  style={{
                    color:
                      comparison.changes.expense.amount >= 0
                        ? "#dc2626"
                        : "#059669",
                  }}
                >
                  前月比:{" "}
                  {formatCurrency(Math.abs(comparison.changes.expense.amount))}(
                  {formatPercentage(comparison.changes.expense.percentage)})
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                収支
              </p>
              <p
                className={`text-2xl font-bold ${
                  report.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
                style={{
                  color: report.netAmount >= 0 ? "#059669" : "#dc2626",
                }}
              >
                {formatCurrency(report.netAmount)}
              </p>
              {comparison && (
                <p
                  className={`text-sm ${
                    comparison.changes.net.amount >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{
                    color:
                      comparison.changes.net.amount >= 0
                        ? "#059669"
                        : "#dc2626",
                  }}
                >
                  前月比:{" "}
                  {formatCurrency(Math.abs(comparison.changes.net.amount))}(
                  {formatPercentage(comparison.changes.net.percentage)})
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
        <CardHeader
          style={{
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <CardTitle style={{ color: "#111827" }}>取引統計</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: "1rem" }}>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                取引件数
              </p>
              <p className="text-xl font-semibold" style={{ color: "#111827" }}>
                {report.transactionCount}件
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                平均取引額
              </p>
              <p className="text-xl font-semibold" style={{ color: "#111827" }}>
                {formatCurrency(report.averageTransactionAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                日平均収入
              </p>
              <p
                className="text-xl font-semibold text-green-600"
                style={{ color: "#059669" }}
              >
                {formatCurrency(report.dailyAverages.income)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                日平均支出
              </p>
              <p
                className="text-xl font-semibold text-red-600"
                style={{ color: "#dc2626" }}
              >
                {formatCurrency(report.dailyAverages.expense)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* トップカテゴリ */}
      <div className="grid grid-cols-2 gap-6">
        {report.topIncomeCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">最大収入カテゴリ</CardTitle>
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
                <p className="text-sm text-gray-600">
                  収入全体の
                  {(
                    (report.topIncomeCategory.amount / report.totalIncome) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {report.topExpenseCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">最大支出カテゴリ</CardTitle>
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
                <p className="text-sm text-gray-600">
                  支出全体の
                  {(
                    (report.topExpenseCategory.amount / report.totalExpense) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* カテゴリ別詳細 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>支出カテゴリ別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.expenseByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{category.count}件</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>収入カテゴリ別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.incomeByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{category.count}件</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

// 年別レポートPDF用コンポーネント
export const PDFYearlyReportView = forwardRef<
  HTMLDivElement,
  PDFYearlyReportProps
>(({ report }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-8 space-y-6"
      style={{
        minWidth: "297mm",
        maxWidth: "297mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {/* ヘッダー */}
      <div
        className="text-center border-b-2 border-gray-300 pb-4"
        style={{ borderBottomColor: "#d1d5db" }}
      >
        <h1
          className="text-3xl font-bold text-gray-800"
          style={{ color: "#1f2937" }}
        >
          家計簿年間レポート
        </h1>
        <h2 className="text-xl text-gray-600 mt-2" style={{ color: "#4b5563" }}>
          {report.year}年
        </h2>
        <p className="text-sm text-gray-500 mt-1" style={{ color: "#6b7280" }}>
          生成日時: {new Date().toLocaleString("ja-JP")}
        </p>
      </div>

      {/* 年間サマリー */}
      <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
        <CardHeader
          style={{
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <CardTitle style={{ color: "#111827" }}>年間収支サマリー</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: "1rem" }}>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                年間総収入
              </p>
              <p
                className="text-2xl font-bold text-green-600"
                style={{ color: "#059669" }}
              >
                {formatCurrency(report.totalIncome)}
              </p>
              {report.trends.incomeGrowth !== 0 && (
                <p
                  className={`text-sm ${
                    report.trends.incomeGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{
                    color:
                      report.trends.incomeGrowth >= 0 ? "#059669" : "#dc2626",
                  }}
                >
                  前年比: {formatPercentage(report.trends.incomeGrowth)}
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                年間総支出
              </p>
              <p
                className="text-2xl font-bold text-red-600"
                style={{ color: "#dc2626" }}
              >
                {formatCurrency(report.totalExpense)}
              </p>
              {report.trends.expenseGrowth !== 0 && (
                <p
                  className={`text-sm ${
                    report.trends.expenseGrowth >= 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                  style={{
                    color:
                      report.trends.expenseGrowth >= 0 ? "#dc2626" : "#059669",
                  }}
                >
                  前年比: {formatPercentage(report.trends.expenseGrowth)}
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                年間収支
              </p>
              <p
                className={`text-2xl font-bold ${
                  report.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
                style={{
                  color: report.netAmount >= 0 ? "#059669" : "#dc2626",
                }}
              >
                {formatCurrency(report.netAmount)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ color: "#4b5563" }}>
                平均月収支
              </p>
              <p
                className={`text-xl font-semibold ${
                  report.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
                style={{
                  color: report.netAmount >= 0 ? "#059669" : "#dc2626",
                }}
              >
                {formatCurrency(report.netAmount / 12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ベスト・ワーストマンス */}
      <div className="grid grid-cols-2 gap-6">
        {report.bestMonth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">最高収支月</CardTitle>
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
              <CardTitle className="text-red-600">最低収支月</CardTitle>
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

      {/* 月別収支テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>月別収支一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {report.monthlyData
              .filter((m) => m.income > 0 || m.expense > 0)
              .map((month) => (
                <div key={month.month} className="border rounded p-3">
                  <p className="font-medium text-center">
                    {getMonthName(month.month)}
                  </p>
                  <div className="text-sm space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>収入:</span>
                      <span className="text-green-600">
                        {formatCurrency(month.income)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>支出:</span>
                      <span className="text-red-600">
                        {formatCurrency(month.expense)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>収支:</span>
                      <span
                        className={
                          month.net >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(month.net)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別年間詳細 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>年間支出カテゴリ別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.expenseByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{category.count}件</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>年間収入カテゴリ別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.incomeByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{category.count}件</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

PDFMonthlyReportView.displayName = "PDFMonthlyReportView";
PDFYearlyReportView.displayName = "PDFYearlyReportView";
