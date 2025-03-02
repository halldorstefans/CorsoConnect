import React from "react";
import { RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details = "Something went wrong. Please try again or contact support if the problem persists.",
  onRetry,
}) => {
  return (
    <div className="text-center p-6 bg-background-card rounded-lg shadow-md border border-neutral-300">
      <p className="text-error font-bold text-lg mb-2">{message}</p>
      <p className="text-neutral-600 mb-4">{details}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center mx-auto bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
