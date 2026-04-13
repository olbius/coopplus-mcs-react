import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Link, TextField, IconButton, Tooltip,
  Autocomplete, Checkbox, Popover, Stack, Divider, Button, Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon,
  Add as AddIcon, CheckBoxOutlineBlank, CheckBox as CheckBoxIcon,
  DateRange as DateRangeIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useSalesReturns } from '../hooks/useSalesOrders';
import type { SalesReturn } from '../../../types/sales.types';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };
const fmtCurrency = (n?: number) => { if (n == null) return '—'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); };
const fmtD = (d: Date) => format(d, 'yyyy-MM-dd');

const RETURN_STATUS_OPTIONS = [
  { value: 'RETURN_REQUESTED', label: 'Yêu cầu' },
  { value: 'RETURN_ACCEPTED', label: 'Chấp nhận' },
  { value: 'RETURN_RECEIVED', label: 'Đã nhận' },
  { value: 'RETURN_COMPLETED', label: 'Hoàn thành' },
  { value: 'RETURN_CANCELLED', label: 'Đã hủy' },
];

const DATE_PRESETS = [
  { key: '3 tháng', range: () => [fmtD(subMonths(new Date(), 3)), fmtD(new Date())] },
  { key: 'Tháng này', range: () => [fmtD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), fmtD(new Date())] },
  { key: '7 ngày', range: () => [fmtD(new Date(Date.now() - 6 * 86400000)), fmtD(new Date())] },
  { key: 'Hôm nay', range: () => { const d = fmtD(new Date()); return [d, d]; } },
] as const;

const DateRangeFilter: FC<{ fromDate?: string; thruDate?: string; onChange: (f?: string, t?: string) => void }> = ({ fromDate, thruDate, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasValue = !!(fromDate || thruDate);
  return (
    <>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', minHeight: 28, px: 0.5, borderRadius: 0.5, '&:hover': { bgcolor: 'action.hover' } }}>
        <DateRangeIcon sx={{ fontSize: 16, color: hasValue ? 'primary.main' : 'text.disabled' }} />
        <Typography variant="caption" noWrap color={hasValue ? 'text.primary' : 'text.disabled'} sx={{ fontSize: '0.75rem' }}>
          {hasValue ? `${fromDate ?? '...'} — ${thruDate ?? '...'}` : 'Khoảng ngày'}
        </Typography>
        {hasValue && <IconButton size="small" onClick={(e) => { e.stopPropagation(); onChange(undefined, undefined); }} sx={{ p: 0, ml: 'auto' }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>}
      </Box>
      <Popover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={{ paper: { sx: { p: 2, width: 280 } } }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Chọn nhanh</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {DATE_PRESETS.map((p) => { const [pF, pT] = p.range(); return (
            <Chip key={p.key} label={p.key} size="small" variant={fromDate === pF && thruDate === pT ? 'filled' : 'outlined'}
              color={fromDate === pF && thruDate === pT ? 'primary' : 'default'}
              onClick={() => { onChange(pF, pT); setAnchorEl(null); }} sx={{ fontSize: '0.75rem' }} />
          ); })}
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1.5}>
          <TextField size="small" label="Từ ngày" type="date" value={fromDate ?? ''} onChange={(e) => onChange(e.target.value || undefined, thruDate)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField size="small" label="Đến ngày" type="date" value={thruDate ?? ''} onChange={(e) => onChange(fromDate, e.target.value || undefined)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Stack>
        {hasValue && <Button size="small" fullWidth sx={{ mt: 1.5 }} onClick={() => { onChange(undefined, undefined); setAnchorEl(null); }}>Xóa</Button>}
      </Popover>
    </>
  );
};

const ChecklistFilter: FC<{ options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void }> = ({ options, selected, onChange }) => (
  <Autocomplete multiple size="small" disableCloseOnSelect options={options}
    getOptionLabel={(o) => o.label} value={options.filter((o) => selected.includes(o.value))}
    onChange={(_, sel) => onChange(sel.map((s) => s.value))}
    renderOption={(props, option, { selected: sel }) => {
      const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
      return (<li key={key} {...rest}><Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={sel} sx={{ mr: 0.5, p: 0 }} /><Typography variant="body2">{option.label}</Typography></li>);
    }}
    renderInput={(params) => <TextField {...params} variant="standard" placeholder="Lọc..." />} sx={{ minWidth: 0 }} />
);

export const SalesReturnListPage: FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filters matching old returnOrderList.ftl
  const [filterReturnId, setFilterReturnId] = useState('');
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterFromDate, setFilterFromDate] = useState<string | undefined>();
  const [filterThruDate, setFilterThruDate] = useState<string | undefined>();

  const [debounced, setDebounced] = useState({ returnId: '', orderId: '', customerId: '', createdBy: '' });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ returnId: filterReturnId, orderId: filterOrderId, customerId: filterCustomerId, createdBy: filterCreatedBy });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterReturnId, filterOrderId, filterCustomerId, filterCreatedBy]);

  const { data, isLoading, isFetching, refetch } = useSalesReturns(page, pageSize, {
    returnId: debounced.returnId || undefined,
    orderId: debounced.orderId || undefined,
    statusFilters: filterStatus.length ? filterStatus : undefined,
  });
  const returns = data?.returnList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterReturnId || filterOrderId || filterCustomerId || filterCreatedBy || filterStatus.length || filterFromDate || filterThruDate);
  const handleClearFilters = () => {
    setFilterReturnId(''); setFilterOrderId(''); setFilterCustomerId(''); setFilterCreatedBy('');
    setFilterStatus([]); setFilterFromDate(undefined); setFilterThruDate(undefined); setPage(0);
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<SalesReturn>[] = [
    {
      key: 'returnId', label: 'Mã trả hàng', width: 140,
      render: (row) => <Link component="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}
        onClick={() => navigate(`/sales/returns/${row.returnId}`)}>{row.returnId}</Link>,
      filterRender: makeTextFilter(filterReturnId, setFilterReturnId),
    },
    {
      key: 'orderId', label: 'Mã đơn hàng', width: 140,
      render: (row) => <Typography variant="body2">{String((row as Record<string, unknown>).orderId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterOrderId, setFilterOrderId),
    },
    {
      key: 'fromPartyId', label: 'Mã KH', width: 150,
      render: (row) => <Typography variant="body2">{row.customerName ?? row.fromPartyId ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterCustomerId, setFilterCustomerId),
    },
    {
      key: 'createdBy', label: 'Người tạo', width: 150,
      render: (row) => <Typography variant="body2">{String((row as Record<string, unknown>).createdBy ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterCreatedBy, setFilterCreatedBy),
    },
    {
      key: 'returnDate', label: 'Ngày tạo', width: 150,
      render: (row) => <Typography variant="body2">{fmtDate(row.returnDate)}</Typography>,
      filterRender: () => <DateRangeFilter fromDate={filterFromDate} thruDate={filterThruDate}
        onChange={(f, t) => { setFilterFromDate(f); setFilterThruDate(t); setPage(0); }} />,
    },
    {
      key: 'statusId', label: 'Trạng thái', width: 140,
      render: (row) => <StatusBadge status={row.statusId} label={row.statusDescription ?? row.statusId} />,
      filterRender: () => <ChecklistFilter options={RETURN_STATUS_OPTIONS} selected={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(0); }} />,
    },
    {
      key: 'grandTotal', label: 'Tổng tiền', width: 140, align: 'right' as const,
      render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fmtCurrency(row.grandTotal)}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng trả', path: '/sales/returns' }, { label: 'Danh sách' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm mới"><IconButton size="small" color="primary" onClick={() => navigate('/sales/returns/new')}><AddIcon fontSize="small" /></IconButton></Tooltip>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={returns} rowKey={(r) => r.returnId}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không tìm thấy đơn trả hàng" filtersVisible={filtersVisible}
        onRowClick={(r) => navigate(`/sales/returns/${r.returnId}`)} columnStorageKey="sales-returns" />
    </Box>
  );
};
