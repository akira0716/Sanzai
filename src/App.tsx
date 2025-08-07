import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { SummaryCards } from './components/SummaryCards'
import { CategoryChart } from './components/CategoryChart'
import { ErrorAlert } from './components/ErrorAlert'
import { Card, CardContent } from './components/ui/card'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { 
    transactions, 
    loading: transactionsLoading, 
    error, 
    addTransaction, 
    deleteTransaction,
    refetch
  } = useTransactions()

  // 認証の読み込み中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 未認証の場合
  if (!user) {
    return <AuthForm />
  }

  const handleAddTransaction = async (transaction: Parameters<typeof addTransaction>[0]) => {
    const result = await addTransaction(transaction)
    if (result.success) {
      // 成功した場合、必要に応じて追加の処理
    } else {
      alert(result.error || '取引の追加に失敗しました')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      const result = await deleteTransaction(id)
      if (!result.success) {
        alert(result.error || '取引の削除に失敗しました')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <Header />

        <ErrorAlert error={error} onRetry={refetch} />

        {transactionsLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>データを読み込み中...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <SummaryCards transactions={transactions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TransactionForm onAddTransaction={handleAddTransaction} />
              <CategoryChart transactions={transactions} />
            </div>

            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction} 
            />
          </>
        )}
      </div>
    </div>
  )
}