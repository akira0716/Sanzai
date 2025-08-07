import { useState, useEffect } from "react";
import type { Budget, BudgetProgress, Transaction } from "../types";
import { apiService } from "../services/api";
import { useAuth } from "./useAuth";

export function useBudgets(transactions: Transaction[]) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { budgets: fetchedBudgets } = await apiService.getBudgets();
      setBudgets(fetchedBudgets);
    } catch (error) {
      console.log("Failed to load budgets:", error);
      setError(
        error instanceof Error
          ? error.message
          : "予算データの読み込みに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [user]);

  const setBudget = async (category: string, amount: number, month: string) => {
    try {
      setError("");
      const { budget } = await apiService.setBudget(category, amount, month);
      setBudgets((prev) => {
        const filtered = prev.filter(
          (b) => !(b.category === category && b.month === month)
        );
        return [...filtered, budget];
      });
      return { success: true };
    } catch (error) {
      console.log("Failed to set budget:", error);
      const errorMessage =
        error instanceof Error ? error.message : "予算の設定に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteBudget = async (month: string, category: string) => {
    try {
      setError("");
      await apiService.deleteBudget(month, category);
      setBudgets((prev) =>
        prev.filter((b) => !(b.category === category && b.month === month))
      );
      return { success: true };
    } catch (error) {
      console.log("Failed to delete budget:", error);
      const errorMessage =
        error instanceof Error ? error.message : "予算の削除に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 現在の月の予算進捗を計算
  const getBudgetProgress = (month: string): BudgetProgress[] => {
    const monthBudgets = budgets.filter((b) => b.month === month);

    return monthBudgets.map((budget) => {
      // その月のその カテゴリの支出を計算
      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === budget.category &&
            t.date.startsWith(month)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      const isOverBudget = spent > budget.amount;

      return {
        budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget,
      };
    });
  };

  // アラートが必要な予算を取得（80%以上使用または予算超過）
  const getAlerts = (month: string) => {
    const progress = getBudgetProgress(month);
    return progress.filter((p) => p.percentage >= 80 || p.isOverBudget);
  };

  return {
    budgets,
    loading,
    error,
    setBudget,
    deleteBudget,
    getBudgetProgress,
    getAlerts,
    refetch: loadBudgets,
  };
}
