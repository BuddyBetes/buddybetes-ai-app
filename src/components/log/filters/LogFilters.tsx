
import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LogFilters as LogFiltersType } from '@/types/filters';
import DateRangeFilter from './DateRangeFilter';
import CategoryFilters from './CategoryFilters';
import ContentFilters from './ContentFilters';
import GlucoseRangeFilter from './GlucoseRangeFilter';

interface LogFiltersProps {
  filters: LogFiltersType;
  onFiltersChange: (filters: LogFiltersType) => void;
  activeFiltersCount: number;
  onClearAll: () => void;
  totalLogs: number;
  filteredCount: number;
  filterPresets: Array<{
    label: string;
    value: string;
    getDateRange: () => { from: Date; to: Date };
  }>;
}

const LogFilters: React.FC<LogFiltersProps> = ({
  filters,
  onFiltersChange,
  activeFiltersCount,
  onClearAll,
  totalLogs,
  filteredCount,
  filterPresets
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-3 sm:space-y-0">
          {/* Mobile: Stack elements vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 h-9">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                >
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
            
            {/* Results count - moves below buttons on mobile */}
            <div className="text-sm text-gray-600 text-center sm:text-right">
              Showing {filteredCount} of {totalLogs} logs
            </div>
          </div>
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
            {/* Mobile: Single column, Desktop: Multi-column grid */}
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-4 lg:gap-6">
              <DateRangeFilter
                filters={filters}
                onFiltersChange={onFiltersChange}
                filterPresets={filterPresets}
              />
              
              <CategoryFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
              
              <GlucoseRangeFilter
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
            
            {/* Content filters in separate section with reduced spacing on mobile */}
            <div className="border-t pt-3 sm:pt-4">
              <ContentFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LogFilters;
