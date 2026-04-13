import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Chip, TextField, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';
import type { SalesReturnListResponse } from '../../../types/sales.types';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

const RETURN_STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'RETURN_REQUESTED', label: 'Yêu cầu trả' },
  { value: 'RETURN_ACCEPTED', label: 'Đã chấp nhận' },
  { value: 'RETURN_RECEIVED', label: 'Đã nhận hàng' },
  { value: 'RETURN_COMPLETED', label: 'Hoàn thành' },
  { value: 'RETURN_CANCELLED', label: 'Đã hủy' },
];

interface Props { returnType: 'customer' | 'supplier'; }

export const ReturnListPage: FC<Props> = ({ returnType }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterReturnId, setFilterReturnId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ returnId: '', statusFilters: [] as string[] });
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters({ returnId: filterReturnId, statusFilters: filterStatus ? [filterStatus] : [] });
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [filterReturnId, filterStatus]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['log-returns', returnType, page, pageSize, debouncedFilters],
    queryFn: () => salesApi.listSalesReturns(page, pageSize, { returnId: debouncedFilters.returnId, statusFilters: debouncedFilters.statusFilters }),
    placeholderData: (prev: SalesReturnListResponse | undefined) => prev,
  });

  const items = data?.returnList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterReturnId || filterStatus);
  const handleClearFilters = () => { setFilterReturnId(''); setFilterStatus(''); };

  const title = returnType === 'customer' ? 'Khách hàng trả lại' : 'Trả lại nhà cung cấp';

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'returnId', label: 'Mã trả hàng', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.returnId ?? '')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={filterReturnId}
          onChange={(e) => setFilterReturnId(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ) },
    { key: 'statusId', label: 'Trạng thái', width: 140,
      render: (r) => <Chip size="small" label={String(r.statusDescription ?? r.statusId ?? '—')}
        color={r.statusId === 'RETURN_COMPLETED' || r.statusId === 'RETURN_RECEIVED' ? 'success' : r.statusId === 'RETURN_CANCELLED' ? 'error' : 'default'} />,
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {RETURN_STATUS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ) },
    { key: 'fromPartyName', label: returnType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp', width: 200,
      render: (r) => <Typography variant="body2">{String(r.fromPartyName ?? r.customerName ?? r.fromPartyId ?? '—')}</Typography> },
    { key: 'toPartyName', label: 'Trả cho', width: 200,
      render: (r) => <Typography variant="body2">{String(r.toPartyName ?? r.toPartyId ?? '—')}</Typography> },
    ...(returnType === 'customer' ? [{
      key: 'destinationFacilityId', label: 'Kho nhận', width: 100,
      render: (r: Record<string, unknown>) => <Typography variant="body2">{String(r.destinationFacilityId ?? '—')}</Typography>,
    }] : []),
    { key: 'entryDate', label: 'Ngày trả', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate((r.entryDate ?? r.returnDate) as string)}</Typography> },
    { key: 'orderId', label: 'Đơn hàng', width: 120,
      render: (r) => <Typography variant="body2">{String(r.orderId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Trả lại' }, { label: title }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.returnId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage={`Không có ${title.toLowerCase()}`} filtersVisible={filtersVisible}
        columnStorageKey={`log-returns-${returnType}`} />
    </Box>
  );
};
