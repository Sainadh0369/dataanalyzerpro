import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, MessageSquare } from 'lucide-react';

interface NLQueryInputProps {
  onQuery: (query: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

export function NLQueryInput({ onQuery, isLoading, placeholder = "Ask a question about your data...", className = "" }: NLQueryInputProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    await onQuery(query.trim());
  };

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <MessageSquare className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 p-2 text-gray-400 hover:text-teal-600 disabled:text-gray-300 disabled:hover:text-gray-300"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}