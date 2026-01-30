import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerColorClass?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  badge,
  children,
  defaultExpanded = true,
  className = '',
  headerColorClass = 'bg-blue-500',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section
      className={`bg-slate-900 rounded-2xl shadow-xl border border-slate-800/50 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-6 text-left hover:bg-slate-800/30 transition-colors focus:outline-none"
      >
        {icon ? icon : <span className={`w-2 h-8 ${headerColorClass} rounded-full`}></span>}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {badge && <div className="ml-auto flex items-center">{badge}</div>}
        <div className={`transition-transform duration-300 ml-3 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 pb-6 border-t border-slate-800/30 pt-6">{children}</div>
      </div>
    </section>
  );
};
