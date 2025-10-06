'use client';
import React from 'react';
import { Select, SelectItem } from '@heroui/react';
import { ArrowUpDown, TrendingUp, TrendingDown, Calendar, Star } from 'lucide-react';

export type SortOption = {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
  icon?: React.ReactNode;
};

const SORT_OPTIONS: readonly SortOption[] = [
  {
    value: 'newest',
    label: 'Newest First',
    field: 'createdAt',
    order: 'desc',
    icon: <Calendar size={16} />,
  },
  {
    value: 'price-asc',
    label: 'Price (Low to High)',
    field: 'price',
    order: 'asc',
    icon: <TrendingUp size={16} />,
  },
  {
    value: 'price-desc',
    label: 'Price (High to Low)',
    field: 'price',
    order: 'desc',
    icon: <TrendingDown size={16} />,
  },
  {
    value: 'name-asc',
    label: 'Name (A-Z)',
    field: 'name',
    order: 'asc',
    icon: <ArrowUpDown size={16} />,
  },
  {
    value: 'featured',
    label: 'Featured First',
    field: 'featured',
    order: 'desc',
    icon: <Star size={16} />,
  },
] as const;

interface ProductSortProps {
  value: string;
  onChange: (sortOption: SortOption) => void;
  isDisabled?: boolean;
  resultCount?: number;
}

export const ProductSort: React.FC<ProductSortProps> = ({
  value,
  onChange,
  isDisabled = false,
  resultCount,
}) => {
  const handleSelectionChange = (keys: Set<React.Key> | 'all') => {
    if (keys === 'all') return;
    const selectedValue = Array.from(keys)[0] as string;
    const sortOption = SORT_OPTIONS.find((option) => option.value === selectedValue);
    if (sortOption) {
      onChange(sortOption);
    }
  };

  const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div className="flex items-center gap-3">
      {/* Results count */}
      {resultCount !== undefined && (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {resultCount} product{resultCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:inline">Sort:</span>
        <Select
          selectedKeys={new Set([value])}
          onSelectionChange={handleSelectionChange}
          placeholder="Sort by..."
          size="sm"
          variant="bordered"
          classNames={{
            base: 'w-40 sm:w-48',
            trigger: 'h-9 min-h-9',
            value: 'text-sm',
          }}
          isDisabled={isDisabled}
          startContent={selectedOption?.icon}
        >
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} startContent={option.icon} textValue={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export { SORT_OPTIONS };
