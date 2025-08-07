import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlusCircle } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../types";

interface BudgetFormProps {
  onSetBudget: (
    category: string,
    amount: number,
    month: string
  ) => Promise<void>;
  currentMonth: string;
}

export function BudgetForm({ onSetBudget, currentMonth }: BudgetFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !amount || !month) {
      alert("すべての項目を入力してください");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("正しい金額を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      await onSetBudget(category, amountNum, month);
      setCategory("");
      setAmount("");
    } catch (error) {
      console.log("予算設定エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 来月のオプションも含む月選択肢を生成
  const getMonthOptions = () => {
    const current = new Date();
    const currentMonthStr = current.toISOString().slice(0, 7);

    const next = new Date(current.getFullYear(), current.getMonth() + 1);
    const nextMonthStr = next.toISOString().slice(0, 7);

    return [
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          予算設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget-month">対象月</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="月を選択" />
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

          <div className="space-y-2">
            <Label htmlFor="budget-category">カテゴリ</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">予算金額</Label>
            <Input
              id="budget-amount"
              type="number"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "設定中..." : "予算を設定"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
