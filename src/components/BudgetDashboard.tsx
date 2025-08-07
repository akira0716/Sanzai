import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AlertTriangle, Target, Trash2, TrendingUp } from "lucide-react";
import type { BudgetProgress } from "../types";

interface BudgetDashboardProps {
  budgetProgress: BudgetProgress[];
  alerts: BudgetProgress[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onDeleteBudget: (month: string, category: string) => Promise<void>;
}

export function BudgetDashboard({
  budgetProgress,
  alerts,
  currentMonth,
  onMonthChange,
  onDeleteBudget,
}: BudgetDashboardProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getMonthOptions = () => {
    const current = new Date();
    const currentMonthStr = current.toISOString().slice(0, 7);

    const next = new Date(current.getFullYear(), current.getMonth() + 1);
    const nextMonthStr = next.toISOString().slice(0, 7);

    const prev = new Date(current.getFullYear(), current.getMonth() - 1);
    const prevMonthStr = prev.toISOString().slice(0, 7);

    return [
      {
        value: prevMonthStr,
        label: `${prev.getFullYear()}年${prev.getMonth() + 1}月`,
      },
      {
        value: currentMonthStr,
        label: `${current.getFullYear()}年${current.getMonth() + 1}月`,
      },
      {
        value: nextMonthStr,
        label: `${next.getFullYear()}年${next.getMonth() + 1}月`,
      },
    ];
  };

  const handleDeleteBudget = async (month: string, category: string) => {
    if (!confirm(`${category}の予算を削除しますか？`)) return;

    setIsDeleting(`${month}-${category}`);
    try {
      await onDeleteBudget(month, category);
    } catch (error) {
      console.log("予算削除エラー:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* アラート表示 */}
      {alerts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-yellow-800">予算アラート</p>
              {alerts.map((alert) => (
                <p key={alert.budget.id} className="text-sm text-yellow-700">
                  {alert.budget.category}:{" "}
                  {alert.isOverBudget ? "予算超過" : "予算の80%を超過"}（
                  {alert.percentage.toFixed(1)}%使用）
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 月選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            予算ダッシュボード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">表示月:</span>
              <Select value={currentMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {budgetProgress.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                この月の予算が設定されていません
              </p>
            ) : (
              <div className="space-y-4">
                {budgetProgress.map((progress) => (
                  <div
                    key={progress.budget.id}
                    className="space-y-2 p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {progress.budget.category}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(progress.spent)} /{" "}
                          {formatCurrency(progress.budget.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            progress.isOverBudget
                              ? "destructive"
                              : progress.percentage >= 80
                              ? "secondary"
                              : "default"
                          }
                        >
                          {progress.percentage.toFixed(1)}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteBudget(
                              progress.budget.month,
                              progress.budget.category
                            )
                          }
                          disabled={
                            isDeleting ===
                            `${progress.budget.month}-${progress.budget.category}`
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Progress
                      value={progress.percentage}
                      className="w-full h-2"
                    />

                    <div className="flex justify-between text-sm">
                      <span
                        className={
                          progress.remaining >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        残り: {formatCurrency(progress.remaining)}
                      </span>
                      <span className="text-muted-foreground">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        {progress.isOverBudget ? "予算超過" : "予算内"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
