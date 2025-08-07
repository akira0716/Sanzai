import { useState, useEffect } from "react";
import type { Transaction } from "../types";
import { apiService } from "../services/api";
import { useAuth } from "./useAuth";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { transactions: fetchedTransactions } =
        await apiService.getTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.log("Failed to load transactions:", error);
      setError(
        error instanceof Error
          ? error.message
          : "データの読み込みに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setError("");
      const { transaction: newTransaction } = await apiService.addTransaction(
        transaction
      );
      setTransactions((prev) => [...prev, newTransaction]);
      return { success: true };
    } catch (error) {
      console.log("Failed to add transaction:", error);
      const errorMessage =
        error instanceof Error ? error.message : "取引の追加に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError("");
      await apiService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (error) {
      console.log("Failed to delete transaction:", error);
      const errorMessage =
        error instanceof Error ? error.message : "取引の削除に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: loadTransactions,
  };
}
