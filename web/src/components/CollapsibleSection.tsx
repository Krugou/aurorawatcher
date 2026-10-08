import React, { useId, useState } from 'react';

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
  sectionId?: string;
  expandRequest?: number;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  badge,
  children,
  defaultExpanded = true,
  className = '',
  headerColorClass = 'bg-aurora-teal',
  storageKey,
  sectionId,
  expandRequest = 0,
}) => {
  const panelId = useId();
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

  React.useEffect(() => {
    if (expandRequest === 0) return;
    setIsExpanded((expanded) => {
      if (expanded) return expanded;
      if (storageKey) localStorage.setItem(`section_${storageKey}`, 'true');
      return true;
    });
  }, [expandRequest, storageKey]);

  return (
    <section
      id={sectionId}
      className={`neo-panel overflow-hidden transition-all duration-500 ${className}`}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={toggleExpanded}
        className="neo-section-trigger w-full flex items-center gap-4 p-6 text-left hover:bg-white/[0.02] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] cursor-pointer"
      >
        {icon ?? (
          <div
            className={`w-2.5 h-2.5 rounded-full ${headerColorClass} shadow-[0_0_10px_currentColor] opacity-80`}
          ></div>
        )}
        <h2 className="text-xl font-sans font-bold uppercase tracking-wider text-white/90">
          {title}
        </h2>
        <div className="ml-auto flex items-center gap-4">
          {badge && <div className="flex items-center cursor-default">{badge}</div>}
          <div
            className={`transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-1.5 rounded-lg bg-white/5 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/50"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </button>

      <div
        id={panelId}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 pb-6 border-t border-white/[0.06] pt-6">{children}</div>
      </div>
    </section>
  );
};
