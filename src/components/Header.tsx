import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="mb-6">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">家計簿</h1>
          <p className="text-sm text-muted-foreground">
            収入と支出を記録して、家計を管理しましょう
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>こんにちは、{user.name}さん</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
