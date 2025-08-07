import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BudgetForm } from "./BudgetForm";
import { BudgetDashboard } from "./BudgetDashboard";
import { useBudgets } from "../hooks/useBudgets";
import type { Transaction } from "../types";
import { ErrorAlert } from "./ErrorAlert";

interface BudgetManagerProps {
  transactions: Transaction[];
}

export function BudgetManager({ transactions }: BudgetManagerProps) {
  const currentDate = new Date();
  const currentMonthStr = currentDate.toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const {
    loading,
    error,
    setBudget,
    deleteBudget,
    getBudgetProgress,
    getAlerts,
    refetch,
  } = useBudgets(transactions);

  const budgetProgress = getBudgetProgress(selectedMonth);
  const alerts = getAlerts(selectedMonth);

  const handleSetBudget = async (
    category: string,
    amount: number,
    month: string
  ) => {
    const result = await setBudget(category, amount, month);
    if (!result.success) {
      alert(result.error || "予算の設定に失敗しました");
    }
  };

  const handleDeleteBudget = async (month: string, category: string) => {
    const result = await deleteBudget(month, category);
    if (!result.success) {
      alert(result.error || "予算の削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>予算データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorAlert error={error} onRetry={refetch} />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">予算ダッシュボード</TabsTrigger>
          <TabsTrigger value="settings">予算設定</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-6">
          <BudgetDashboard
            budgetProgress={budgetProgress}
            alerts={alerts}
            currentMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDeleteBudget={handleDeleteBudget}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <BudgetForm
            onSetBudget={handleSetBudget}
            currentMonth={currentMonthStr}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
