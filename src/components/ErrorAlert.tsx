import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 underline hover:no-underline"
          >
            再試行
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
