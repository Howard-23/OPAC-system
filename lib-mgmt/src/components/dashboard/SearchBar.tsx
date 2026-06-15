import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, scope: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');
  const [scope, setScope] = React.useState('Keyword');

  const handleSearch = () => {
    onSearch?.(query, scope);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-classic-grey dark:bg-dark-surface border-b border-white dark:border-dark-highlight shadow-[0_1px_0_#808080] dark:shadow-[0_1px_0_#1A1A1A]">
      <div className="flex items-center gap-1 flex-1 max-w-2xl">
        <label htmlFor="search-input" className="text-sm font-medium pr-1 dark:text-dark-text">
          Search:
        </label>
        <div className="flex flex-1 items-center bg-white dark:bg-dark-input shadow-bevel-sunken px-1">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent border-none outline-none text-sm py-1 px-1 h-6 dark:text-dark-text dark:placeholder-dark-text-muted"
            placeholder="Enter search term..."
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <label htmlFor="search-scope" className="text-sm font-medium dark:text-dark-text">
          In:
        </label>
        <div className="bg-white dark:bg-dark-input shadow-bevel-sunken px-0.5 py-0.5">
          <select
            id="search-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="bg-transparent border-none outline-none text-sm h-5 px-1 cursor-pointer dark:text-dark-text"
          >
            <option>Keyword</option>
            <option>Title</option>
            <option>Author</option>
            <option>Call Number</option>
            <option>Subject</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="btn-classic flex items-center gap-1 h-7 px-3"
      >
        <Search size={14} />
        <span>Search</span>
      </button>
    </div>
  );
};
