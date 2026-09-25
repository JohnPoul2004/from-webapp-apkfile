import React, { useState, KeyboardEvent } from 'react';
import { Tag, Plus, X, Sparkles } from 'lucide-react';
import { getTagStyle, cleanTagName, SUGGESTED_TAG_PRESETS } from '../utils/tagHelper';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableSuggestions?: string[];
  maxTags?: number;
  label?: string;
  helperText?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  availableSuggestions = [],
  maxTags = 10,
  label = 'Tags & Custom Labels',
  helperText = 'Add tags to categorize, filter, and organize your content (press Enter or comma to add)'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const addTag = (rawTag: string) => {
    const cleaned = cleanTagName(rawTag);
    if (!cleaned) return;

    if (cleaned.length > 30) {
      setInputError('Tag must be 30 characters or less');
      return;
    }

    if (tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setInputError('Tag already added');
      return;
    }

    if (tags.length >= maxTags) {
      setInputError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    setInputError(null);
    onChange([...tags, cleaned]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Merge available suggestions with presets, filtering out already added tags
  const combinedSuggestions = Array.from(
    new Set([...availableSuggestions, ...SUGGESTED_TAG_PRESETS])
  ).filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())).slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Tag size={13} className="text-zinc-500" />
          <span>{label}</span>
          <span className="text-[10px] text-zinc-400 font-normal">
            ({tags.length}/{maxTags})
          </span>
        </label>
      </div>

      {/* Main Tag Input Container */}
      <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 focus-within:border-zinc-900 transition-all flex flex-wrap items-center gap-1.5 min-h-[44px]">
        {/* Render current tags */}
        {tags.map((tag) => {
          const style = getTagStyle(tag);
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs transition-all ${style.bg} ${style.text} ${style.border} ${style.darkBg} ${style.darkText} ${style.darkBorder}`}
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
                title={`Remove #${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          );
        })}

        {/* Input box */}
        {tags.length < maxTags && (
          <div className="flex items-center gap-1 flex-1 min-w-[120px]">
            <span className="text-zinc-400 text-xs font-bold pl-1 select-none">#</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? 'Type tag and press Enter...' : 'Add another tag...'}
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none py-1 font-medium"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-[10px] font-bold shrink-0 hover:bg-zinc-800 cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <Plus size={11} />
                <span>Add</span>
              </button>
            )}
          </div>
        )}
      </div>

      {inputError && (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          {inputError}
        </p>
      )}

      {/* Suggested Tag Pills */}
      {combinedSuggestions.length > 0 && tags.length < maxTags && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} className="text-amber-500" />
            Suggestions:
          </span>
          {combinedSuggestions.map((suggestion) => {
            const style = getTagStyle(suggestion);
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${style.bg} ${style.text} ${style.border} ${style.darkBg} ${style.darkText} ${style.darkBorder} opacity-85 hover:opacity-100`}
              >
                + #{suggestion}
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TagInput;
