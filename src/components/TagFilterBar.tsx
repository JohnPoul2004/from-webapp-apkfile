import React from 'react';
import { Tag, X, Filter } from 'lucide-react';
import { getTagStyle } from '../utils/tagHelper';

export interface TagWithCount {
  name: string;
  count: number;
}

interface TagFilterBarProps {
  tags: TagWithCount[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalItemsCount: number;
  className?: string;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  tags = [],
  selectedTag,
  onSelectTag,
  totalItemsCount,
  className = ''
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs select-none ${className}`}
    >
      <div className="flex items-center gap-1 text-zinc-400 font-bold shrink-0 text-[11px] uppercase tracking-wider pr-1">
        <Filter size={12} className="text-zinc-500" />
        <span>Tags:</span>
      </div>

      {/* "All" button */}
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
          selectedTag === null
            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedTag === null
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {totalItemsCount}
        </span>
      </button>

      {/* Individual Tag Chips */}
      {tags.map(({ name, count }) => {
        const isSelected = selectedTag?.toLowerCase() === name.toLowerCase();
        const style = getTagStyle(name);

        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelectTag(isSelected ? null : name)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              isSelected
                ? `${style.bg} ${style.text} ${style.border} ${style.darkBg} ${style.darkText} ${style.darkBorder} ring-2 ring-zinc-900 dark:ring-zinc-100 shadow-xs scale-105`
                : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <span>#{name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? 'bg-black/10 dark:bg-white/10'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-400'
              }`}
            >
              {count}
            </span>
            {isSelected && (
              <X size={12} className="opacity-60 hover:opacity-100 ml-0.5" />
            )}
          </button>
        );
      })}

      {selectedTag && (
        <button
          type="button"
          onClick={() => onSelectTag(null)}
          className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline font-semibold shrink-0 ml-1 cursor-pointer"
        >
          Clear tag filter
        </button>
      )}
    </div>
  );
};

export default TagFilterBar;
