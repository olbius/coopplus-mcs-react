import { type ReactNode, useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Paper, Box, Typography,
  Skeleton,
} from '@mui/material';
import { InboxOutlined as EmptyIcon } from '@mui/icons-material';

export type SortOrder = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index?: number) => ReactNode;
  filterRender?: () => ReactNode;
  hiddenByDefault?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (key: string, order: SortOrder) => void;
  emptyMessage?: string;
  filtersVisible?: boolean;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string | number | null;
  columnStorageKey?: string;
  renderRowDetail?: (row: T) => ReactNode;
}

const SKELETON_ROWS = 5;

export function DataTable<T>({
  columns, rows, rowKey, loading = false,
  total, page = 0, pageSize = 20, pageSizeOptions = [10, 20, 50, 100],
  onPageChange, onPageSizeChange,
  sortBy, sortOrder = 'asc', onSortChange,
  emptyMessage = 'No data available',
  filtersVisible = false,
  onRowClick, selectedRowKey, columnStorageKey, renderRowDetail,
}: DataTableProps<T>): ReactNode {
  const [hiddenColumns] = useState<Set<string>>(() => {
    if (columnStorageKey) {
      try {
        const stored = localStorage.getItem(`dt-cols-${columnStorageKey}`);
        if (stored) return new Set(JSON.parse(stored) as string[]);
      } catch { /* ignore */ }
    }
    return new Set(columns.filter((c) => c.hiddenByDefault).map((c) => c.key));
  });

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns],
  );

  const handleSortClick = (key: string) => {
    if (!onSortChange) return;
    const newOrder: SortOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(key, newOrder);
  };

  const showPagination = onPageChange && onPageSizeChange;
  const rowCount = total ?? rows.length;
  const hasFilters = visibleColumns.some((col) => col.filterRender);

  return (
    <Paper variant="outlined" sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'} width={col.width}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', bgcolor: 'grey.50', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {col.sortable && onSortChange ? (
                    <TableSortLabel active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : 'asc'}
                      onClick={() => handleSortClick(col.key)}>
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>

            {hasFilters && filtersVisible && (
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableCell key={`filter-${col.key}`} align={col.align ?? 'left'}
                    sx={{ py: 0.5, px: 1, bgcolor: 'grey.50', borderBottom: 2, borderColor: 'primary.light' }}>
                    {col.filterRender ? col.filterRender() : null}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length}>
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.disabled' }}>
                    <EmptyIcon sx={{ fontSize: 48 }} />
                    <Typography variant="body2">{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.flatMap((row, rowIdx) => {
                const key = rowKey(row);
                const detail = renderRowDetail ? renderRowDetail(row) : null;
                const result = [
                  <TableRow key={key} hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    selected={selectedRowKey != null && key === selectedRowKey}
                    sx={onRowClick ? { cursor: 'pointer' } : undefined}>
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} align={col.align ?? 'left'} sx={{ overflow: 'hidden' }}>
                        {col.render ? col.render(row, rowIdx) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>,
                ];
                if (detail) {
                  result.push(
                    <TableRow key={`${key}-detail`}>
                      <TableCell colSpan={visibleColumns.length} sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
                        {detail}
                      </TableCell>
                    </TableRow>,
                  );
                }
                return result;
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <TablePagination component="div" count={rowCount} page={page}
          rowsPerPage={pageSize} rowsPerPageOptions={pageSizeOptions}
          onPageChange={(_, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }} />
      )}
    </Paper>
  );
}
