import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
  counts?: { [key: string]: number };
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick, counts }) => {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-slate-600 bg-slate-800 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
          value={activeTab}
          onChange={(e) => onTabClick(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab}>{tab}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabClick(tab)}
                className={`${
                  tab === activeTab
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'
                } group inline-flex items-center whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors`}
                aria-current={tab === activeTab ? 'page' : undefined}
              >
                <span>{tab}</span>
                {counts && (
                    <span className={`${
                        tab === activeTab ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-300'
                    } ml-2 rounded-full py-0.5 px-2 text-xs font-medium`}>
                        {counts[tab]}
                    </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
