'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input, Button } from '@heroui/react';
import { SearchIcon, X } from 'lucide-react';

// Custom debounce hook
const useDebounce = (callback: (value: string) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay],
  );
};

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  initialQuery?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onClear,
  isLoading = false,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Update internal state when initialQuery changes
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce((query: string) => {
    if (query.trim().length >= 2) {
      onSearch(query.trim());
    } else if (query.trim().length === 0) {
      onClear();
    }
  }, 300);

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onClear();
  }, [onClear]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim().length >= 2) {
        onSearch(searchQuery.trim());
      }
    },
    [searchQuery, onSearch],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex gap-1 sm:gap-2">
        <Input
          value={searchQuery}
          onValueChange={handleInputChange}
          placeholder="Search products..."
          startContent={<SearchIcon size={18} className="text-gray-400" />}
          classNames={{
            base: 'flex-1',
            mainWrapper: 'h-full',
            input: 'text-base',
            inputWrapper:
              'h-12 font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
          }}
          size="lg"
          disabled={isLoading}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="flat"
            size="lg"
            className="px-2 sm:px-4 min-w-0 sm:min-w-16"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          size="lg"
          className="px-3 sm:px-6 min-w-0 sm:min-w-20"
          disabled={isLoading || searchQuery.trim().length < 2}
        >
          <SearchIcon size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
      {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
        <p className="text-sm text-gray-500 mt-2">Please enter at least 2 characters to search.</p>
      )}
    </form>
  );
};
