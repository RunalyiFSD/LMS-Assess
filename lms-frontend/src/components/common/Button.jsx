import React from 'react';

/**
 * Premium custom Button component using Tailwind CSS
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  // Base classes including smooth hover micro-animations
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant mappings
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-sm border border-transparent',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-transparent',
    danger: 'bg-accent-danger hover:bg-red-600 text-white focus:ring-red-500 shadow-sm border border-transparent',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-brand-500 bg-white',
  };

  // Size mappings
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
