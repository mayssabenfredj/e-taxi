
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface TableWithPaginationProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  filterOptions?: { label: string; value: string; field: keyof T }[];
}

export function TableWithPagination<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchPlaceholder = "Rechercher...",
  onRowClick,
  actions,
  filterOptions = []
}: TableWithPaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  // Filter and search logic
  const filteredData = data.filter(item => {
    const matchesSearch = columns.some(column => {
      const value = String(getValue(item, column.accessor)).toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
    
    const matchesFilter = !selectedFilter || 
      filterOptions.some(filter => 
        filter.value === selectedFilter && 
        String(item[filter.field]).toLowerCase().includes(selectedFilter.toLowerCase())
      );
    
    return matchesSearch && matchesFilter;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = getValue(a, sortColumn);
    const bValue = getValue(b, sortColumn);
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getValue = (obj: any, path: string | keyof T): any => {
    if (typeof path === 'string' && path.includes('.')) {
      return path.split('.').reduce((o, p) => o?.[p], obj);
    }
    return obj[path];
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filterOptions.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {filterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 par page</SelectItem>
              <SelectItem value="10">10 par page</SelectItem>
              <SelectItem value="20">20 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => column.sortable && handleSort(String(column.accessor))}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.header}</span>
                      {column.sortable && sortColumn === column.accessor && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow 
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render ? column.render(item) : String(getValue(item, column.accessor))}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} sur {sortedData.length} résultats
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
