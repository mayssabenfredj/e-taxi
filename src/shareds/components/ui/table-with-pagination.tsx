import React, { useState } from 'react';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';

interface TableWithPaginationProps<T> {
  data: T[];
  columns: Array<{
    header: string;
    accessor: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (item: T) => React.ReactNode;
  }>;
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  filterOptions?: Array<{ label: string; value: string; field: keyof T }>;
  total: number;
  skip: number;
  take: number;
  onPageChange: (skip: number, take: number) => void;
  onFilterChange?: (filters: Record<string, string>) => void; // Added to support multiple filters
  onRowClick?: (item: T) => void; // Added to support row click handling
  emptyMessage?: string; // Message à afficher si aucune donnée
}

export function TableWithPagination<T>({
  data,
  columns,
  searchPlaceholder,
  actions,
  filterOptions,
  total,
  skip,
  take,
  onPageChange,
  onFilterChange,
  onRowClick,
  emptyMessage,
}: TableWithPaginationProps<T>) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Group filter options by field to support multiple filter dropdowns
  const filterGroups = filterOptions
    ? Array.from(new Set(filterOptions.map((opt) => opt.field))).map((field) => ({
        field,
        options: filterOptions.filter((opt) => opt.field === field),
      }))
    : [];

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    if (value === 'all') {
      delete newFilters[field]; // Remove filter if 'all' is selected
    }
    setFilters(newFilters);
    onFilterChange?.(newFilters); // Notify parent component of filter changes
  };

  const filteredData = data.filter((item) => {
    // Apply all active filters
    const passesFilters = Object.entries(filters).every(([field, value]) => {
      if (value === 'all') return true;
      const filterOption = filterOptions?.find((opt) => opt.field === field && opt.value === value);
      return filterOption ? (item[field] as any) === value : true;
    });

    // Apply search
    const passesSearch = search
      ? columns.some((col) =>
          String((item as any)[col.accessor]).toLowerCase().includes(search.toLowerCase())
        )
      : true;

    return passesFilters && passesSearch;
  });

  // Pagination sécurisée
  const safeTotal = isNaN(total) || total <= 0 ? 0 : total;
  const safeTake = isNaN(take) || take <= 0 ? 1 : take;
  const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / safeTake);
  const currentPage = safeTotal === 0 ? 0 : Math.floor(skip / safeTake) + 1;

  const handlePrevious = () => {
    if (skip > 0) {
      onPageChange(skip - safeTake, safeTake);
    }
  };

  const handleNext = () => {
    if (skip + safeTake < safeTotal) {
      onPageChange(skip + safeTake, safeTake);
    }
  };

  const handleTakeChange = (value: string) => {
    const newTake = parseInt(value, 10);
    onPageChange(0, newTake); // Reset to first page when changing items per page
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
        {filterGroups.map((group) => (
          <Select
            key={String(group.field)}
            value={filters[String(group.field)] || 'all'}
            onValueChange={(value) => handleFilterChange(String(group.field), value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={`Filtrer par ${String(group.field)}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="p-2 text-left text-sm font-medium">
                {col.header}
              </th>
            ))}
            {actions && <th className="p-2 text-left text-sm font-medium">Actions</th>}
          </tr>
        </thead>
        {filteredData.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="p-4 text-center text-muted-foreground">
                {emptyMessage || 'Aucune donnée à afficher.'}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-100' : ''}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <td key={col.accessor} className="p-2 text-start">
                    {col.render ? col.render(item) : (item as any)[col.accessor]}
                  </td>
                ))}
                {actions && <td className="p-2">{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Éléments par page :</span>
          <Select value={take.toString()} onValueChange={handleTakeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={skip === 0 || safeTotal === 0}
          >
            Précédent
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={skip + take >= safeTotal || safeTotal === 0}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}