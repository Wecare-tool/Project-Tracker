import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 shadow-sm flex-shrink-0">
      <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h1 className="text-2xl font-bold text-slate-100">Trình Theo Dõi Dự Án</h1>
      </div>
    </header>
  );
};

export default Header;