import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="text-brand-500 mx-auto" size={48} />
        <h1 className="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          The requested page could not be located. Double-check the URL or navigate back to the dashboard.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
