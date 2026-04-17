import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi, type OlapParams, type OlapResult, type OlapGridResult } from '../../../api/report.api';

/** A single column filter condition. */
export interface ColumnFilter {
  column: string;
  condition: string; // CONTAINS, EQUAL, GREATER_THAN, LESS_THAN, etc.
  value: string;
  type?: 'string' | 'numericfilter' | 'datefilter';
}

export interface UseOlapReportReturn {
  data: OlapResult | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  // Pagination
  page: number;
  pageSize: number;
  totalSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  // Column filters
  columnFilters: ColumnFilter[];
  onColumnFilterChange: (filters: ColumnFilter[]) => void;
}

/** Extract filter-only params (everything except pagination and column filter fields). */
function filterKey(params: OlapParams | null): string {
  if (!params) return '';
  const { limit, offset, init, filterJson, ...rest } = params;
  return JSON.stringify(rest);
}

/** Convert ColumnFilter[] to the flat array format the OLAP engine expects. */
function buildFilterJson(filters: ColumnFilter[]): string | undefined {
  const active = filters.filter((f) => f.value.trim() !== '');
  if (active.length === 0) return undefined;
  const arr: string[] = [];
  for (const f of active) {
    arr.push(f.column, f.condition, 'AND', f.type ?? 'string', f.value);
  }
  return JSON.stringify(arr);
}

export function useOlapReport(
  params: OlapParams | null,
  enabled = true,
  defaultPageSize = 20,
): UseOlapReportReturn {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const totalSizeRef = useRef(0);
  const [, forceUpdate] = useState(0);
  const prevFilterKeyRef = useRef('');

  const isGrid = params?.olapType === 'GRID';

  // Reset page and column filters when report-level params change
  const currentFilterKey = filterKey(params);
  useEffect(() => {
    if (currentFilterKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = currentFilterKey;
      setPage(0);
      setColumnFilters([]);
      totalSizeRef.current = 0;
    }
  }, [currentFilterKey]);

  const onColumnFilterChange = useCallback((filters: ColumnFilter[]) => {
    setColumnFilters(filters);
    setPage(0);
    totalSizeRef.current = 0; // re-count on next request
  }, []);

  // Build actual query params with pagination + column filters injected
  const queryParams = useMemo<OlapParams | null>(() => {
    if (!params) return null;
    if (!isGrid) {
      const { limit, offset, init, filterJson, ...rest } = params;
      return rest as OlapParams;
    }
    // Only send init=true when no column filters active (COUNT is expensive with filters on large tables)
    const needsInit = page === 0 && columnFilters.filter((f) => f.value.trim()).length === 0;
    return {
      ...params,
      limit: pageSize,
      offset: String(page * pageSize),
      init: needsInit ? 'true' : undefined,
      filterJson: buildFilterJson(columnFilters),
    };
  }, [params, isGrid, page, pageSize, columnFilters]);

  const { data, isLoading, isFetching, error } = useQuery<OlapResult>({
    queryKey: ['olap-report', queryParams],
    queryFn: () => reportApi.runOlapReport(queryParams!),
    enabled: enabled && queryParams != null && !!queryParams.serviceName,
    staleTime: 60 * 1000,
  });

  // Cache totalSize — only update when the server explicitly returned it (init=true)
  useEffect(() => {
    if (data && 'totalsize' in (data as OlapGridResult)) {
      const ts = (data as OlapGridResult).totalsize;
      if (ts > 0 && ts !== totalSizeRef.current) {
        totalSizeRef.current = ts;
        forceUpdate((n) => n + 1);
      }
    }
  }, [data]);

  const totalSize = totalSizeRef.current || (data as OlapGridResult)?.data?.length || 0;

  const onPageChange = useCallback((p: number) => setPage(p), []);
  const onPageSizeChange = useCallback((s: number) => {
    setPageSize(s);
    setPage(0);
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    error: error as Error | null,
    page,
    pageSize,
    totalSize,
    onPageChange,
    onPageSizeChange,
    columnFilters,
    onColumnFilterChange,
  };
}
