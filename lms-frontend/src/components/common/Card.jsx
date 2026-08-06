import React from 'react';

/**
 * Premium container card component utilizing custom shadow and border details.
 */
const Card = ({ children, title, subtitle, extra, className = '', headerClassName = '', bodyClassName = '' }) => {
  return (
    <div className={`bg-white border border-slate-200/80 shadow-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      {(title || subtitle || extra) && (
        <div className={`px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50 ${headerClassName}`}>
          <div>
            {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {extra && <div className="text-sm">{extra}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
