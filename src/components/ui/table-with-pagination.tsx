import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}: TableWithPaginationProps<T>) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('all');

  const filteredData = data.filter((item) => {
    if (filter !== 'all' && filterOptions) {
      const filterOption = filterOptions.find((opt) => opt.value === filter);
      if (filterOption) {
        return (item[filterOption.field] as any) === filter;
      }
    }
    return columns.some((col) =>
      String((item as any)[col.accessor]).toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(total / take);
  const currentPage = Math.floor(skip / take) + 1;

  const handlePrevious = () => {
    if (skip > 0) {
      onPageChange(skip - take, take);
    }
  };

  const handleNext = () => {
    if (skip + take < total) {
      onPageChange(skip + take, take);
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
        {filterOptions && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index} className="border-t">
              {columns.map((col) => (
                <td key={col.accessor} className="p-2">
                  {col.render ? col.render(item) : (item as any)[col.accessor]}
                </td>
              ))}
              {actions && <td className="p-2">{actions(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Éléments par page :</span>
          <Select value={take.toString()} onValueChange={handleTakeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            disabled={skip === 0}
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
            disabled={skip + take >= total}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}