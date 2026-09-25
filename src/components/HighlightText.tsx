import React from 'react';

interface HighlightTextProps {
  text?: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Highlights matched search queries inside a given text string.
 * Uses <mark> tags with styling for high visual findability.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text = '',
  query = '',
  className = '',
  highlightClassName = 'bg-amber-200 dark:bg-amber-400/30 text-amber-950 dark:text-amber-200 font-extrabold px-1 py-0.5 rounded-sm shadow-2xs'
}) => {
  if (!text) {
    return null;
  }

  const trimmedQuery = query?.trim() || '';
  if (!trimmedQuery) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === trimmedQuery.toLowerCase();
        if (isMatch) {
          return (
            <mark
              key={index}
              className={highlightClassName}
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export default HighlightText;
