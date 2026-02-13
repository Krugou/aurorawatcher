import React, { useState } from 'react';

import { Analytics } from '../utils/analytics';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerColorClass?: string;
  storageKey?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  badge,
  children,
  defaultExpanded = true,
  className = '',
  headerColorClass = 'bg-blue-500',
  storageKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`section_${storageKey}`);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return defaultExpanded;
  });

  const toggleExpanded = () => {
    const nextValue = !isExpanded;
    setIsExpanded(nextValue);
    if (storageKey) {
      localStorage.setItem(`section_${storageKey}`, String(nextValue));
      Analytics.trackSectionToggle(storageKey || title, nextValue);
    } else {
      Analytics.trackSectionToggle(title, nextValue);
    }
  };

  return (
    <section
      className={`bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark overflow-hidden ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleExpanded();
          }
        }}
        className="w-full flex items-center gap-4 p-6 text-left hover:brightness-110 transition-all focus:outline-none cursor-pointer"
      >
        {icon ? (
          icon
        ) : (
          <div
            className={`w-6 h-6 ${headerColorClass} border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-dark`}
          ></div>
        )}
        <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-black dark:text-white">
          {title}
        </h2>
        <div className="ml-auto flex items-center gap-4">
          {badge && <div className="flex items-center cursor-default">{badge}</div>}
          <div
            className={`transition-transform duration-300 border-2 border-black dark:border-white p-1 bg-white dark:bg-black ${
              isExpanded
                ? 'rotate-180 shadow-none translate-x-[2px] translate-y-[2px]'
                : 'shadow-neo-sm dark:shadow-neo-sm-dark'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="text-black dark:text-white"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 pb-6 border-t-2 border-black dark:border-white pt-6">{children}</div>
      </div>
    </section>
  );
};
