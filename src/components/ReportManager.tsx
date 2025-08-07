import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { MonthlyReportView } from "./MonthlyReportView";
import { YearlyReportView } from "./YearlyReportView";
import { FileText, Download, Calendar } from "lucide-react";
import type { Transaction } from "../types";
import {
  generateMonthlyReport,
  generateYearlyReport,
  generateComparisonReport,
  getPreviousMonth,
} from "../utils/reportUtils";

interface ReportManagerProps {
  transactions: Transaction[];
}

export function ReportManager({ transactions }: ReportManagerProps) {
  const currentDate = new Date();
  const currentMonthStr = currentDate.toISOString().slice(0, 7);
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showComparison, setShowComparison] = useState(true);

  // 利用可能な月と年を取得
  const getAvailableMonths = () => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      months.add(t.date.slice(0, 7));
    });

    // 現在の月も追加（データがなくても）
    months.add(currentMonthStr);

    return Array.from(months).sort().reverse();
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    transactions.forEach((t) => {
      years.add(new Date(t.date).getFullYear());
    });

    // 現在の年も追加
    years.add(currentYear);

    return Array.from(years).sort().reverse();
  };

  const monthlyReport = generateMonthlyReport(transactions, selectedMonth);
  const yearlyReport = generateYearlyReport(transactions, selectedYear);

  // 前月比較データ
  const previousMonth = getPreviousMonth(selectedMonth);
  const comparisonReport = showComparison
    ? generateComparisonReport(transactions, selectedMonth, previousMonth)
    : undefined;

  const handleExportReport = (type: "monthly" | "yearly") => {
    // 将来のCSV/PDF出力機能の基盤
    const reportData = type === "monthly" ? monthlyReport : yearlyReport;
    const jsonData = JSON.stringify(reportData, null, 2);

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${
      type === "monthly" ? selectedMonth : selectedYear
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatMonthOption = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            詳細レポート
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            月別・年別の詳細な収支分析とトレンド表示
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">月別レポート</TabsTrigger>
          <TabsTrigger value="yearly">年別レポート</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4 mt-6">
          {/* 月選択とオプション */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">対象月:</span>
                  </div>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month} value={month}>
                          {formatMonthOption(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    {showComparison ? "比較を非表示" : "前月比較を表示"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportReport("monthly")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    エクスポート
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <MonthlyReportView
            report={monthlyReport}
            comparison={comparisonReport}
          />
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-6">
          {/* 年選択とオプション */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">対象年:</span>
                  </div>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportReport("yearly")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  エクスポート
                </Button>
              </div>
            </CardContent>
          </Card>

          <YearlyReportView report={yearlyReport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
