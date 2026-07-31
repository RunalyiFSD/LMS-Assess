import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
      <AlertTriangle size={48} className="text-red-200 mb-3" />
      <h3 className="text-sm font-bold text-slate-600 mb-1">Generation Failed</h3>
      <p className="text-xs text-slate-400 text-center max-w-sm mb-4">
        {message || 'An unexpected error occurred while communicating with the AI service. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          Retry Generation
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
