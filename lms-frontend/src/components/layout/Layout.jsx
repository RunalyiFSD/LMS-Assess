import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {/* Header element sticky on top */}
      <Header />
      <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
        {/* Navigation Sidebar */}
        <Sidebar />
        {/* Core content outlet viewport */}
        <main className="flex-1 overflow-y-auto print:overflow-visible print:p-0">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
