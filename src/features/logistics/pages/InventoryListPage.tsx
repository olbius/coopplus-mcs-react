import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { logisticsApi } from '../../../api/logistics.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };
const fmtNum = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN'); };

export const InventoryListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterFacilityId, setFilterFacilityId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ facilityId: '', productId: '' });
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilters({ facilityId: filterFacilityId, productId: filterProductId }); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterFacilityId, filterProductId]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['logistics-inventory', page, pageSize, debouncedFilters],
    queryFn: () => logisticsApi.listInventoryItems(page, pageSize, debouncedFilters),
    placeholderData: (prev: { itemList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.itemList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterFacilityId || filterProductId);
  const handleClearFilters = () => { setFilterFacilityId(''); setFilterProductId(''); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'inventoryItemId', label: 'Mã tồn', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.inventoryItemId ?? '')}</Typography> },
    { key: 'productId', label: 'Mã SP', width: 120,
      render: (r) => <Typography variant="body2">{String(r.productId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterProductId, setFilterProductId) },
    { key: 'facilityId', label: 'Kho', width: 100,
      render: (r) => <Typography variant="body2">{String(r.facilityId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFacilityId, setFilterFacilityId) },
    { key: 'quantityOnHandTotal', label: 'Tồn kho', width: 100, align: 'right',
      render: (r) => <Typography variant="body2">{fmtNum(r.quantityOnHandTotal as number)}</Typography> },
    { key: 'availableToPromiseTotal', label: 'Khả dụng', width: 100, align: 'right',
      render: (r) => <Typography variant="body2">{fmtNum(r.availableToPromiseTotal as number)}</Typography> },
    { key: 'unitCost', label: 'Đơn giá', width: 110, align: 'right',
      render: (r) => <Typography variant="body2">{r.unitCost != null ? fmtNum(r.unitCost as number) : '—'}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 110,
      render: (r) => <Typography variant="body2">{String(r.statusId ?? '—')}</Typography> },
    { key: 'datetimeReceived', label: 'Ngày nhận', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.datetimeReceived as string)}</Typography> },
    { key: 'lotId', label: 'Lô', width: 100,
      render: (r) => <Typography variant="body2">{String(r.lotId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Tồn kho' }, { label: 'DS Tồn kho' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.inventoryItemId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có tồn kho" filtersVisible={filtersVisible} columnStorageKey="log-inventory" />
    </Box>
  );
};
