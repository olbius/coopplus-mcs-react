import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Link, TextField, Autocomplete, Checkbox,
  Chip, Popover, Stack, Divider, IconButton, Tooltip, Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon, Add as AddIcon,
  CheckBoxOutlineBlank, CheckBox as CheckBoxIcon,
  DateRange as DateRangeIcon, Close as CloseIcon,
  FilterList as FilterIcon, FilterListOff as FilterOffIcon,
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import type { PurchaseOrder, POFilters } from '../../../types/purchasing.types';
import { PO_STATUS_LABELS, PO_ORDER_TYPE_LABELS } from '../../../types/purchasing.types';

const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
};

const fmtDate = (d: Date) => format(d, 'yyyy-MM-dd');

const STATUS_OPTIONS = Object.entries(PO_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const ORDER_TYPE_OPTIONS = Object.entries(PO_ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const DEFAULT_PAGE_SIZE = 20;

// ─── DateRangeFilter ────────────────────────────────────────────────────────

const DATE_PRESETS = [
  { key: '3 tháng', range: () => [fmtDate(subMonths(new Date(), 3)), fmtDate(new Date())] },
  { key: 'Tháng này', range: () => [fmtDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), fmtDate(new Date())] },
  { key: '7 ngày', range: () => [fmtDate(new Date(Date.now() - 6 * 86400000)), fmtDate(new Date())] },
  { key: 'Hôm nay', range: () => { const d = fmtDate(new Date()); return [d, d]; } },
] as const;

const DateRangeFilter: FC<{
  fromDate?: string; thruDate?: string;
  onChange: (from?: string, thru?: string) => void;
}> = ({ fromDate, thruDate, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasValue = !!(fromDate || thruDate);

  return (
    <>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', minHeight: 28, px: 0.5,
          borderRadius: 0.5, '&:hover': { bgcolor: 'action.hover' } }}>
        <DateRangeIcon sx={{ fontSize: 16, color: hasValue ? 'primary.main' : 'text.disabled' }} />
        <Typography variant="caption" noWrap color={hasValue ? 'text.primary' : 'text.disabled'} sx={{ fontSize: '0.75rem' }}>
          {hasValue ? `${fromDate ?? '...'} — ${thruDate ?? '...'}` : 'Khoảng ngày'}
        </Typography>
        {hasValue && (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onChange(undefined, undefined); }} sx={{ p: 0, ml: 'auto' }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
      <Popover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, width: 280 } } }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Chọn nhanh</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {DATE_PRESETS.map((preset) => {
            const [pFrom, pThru] = preset.range();
            const isActive = fromDate === pFrom && thruDate === pThru;
            return (
              <Chip key={preset.key} label={preset.key} size="small"
                variant={isActive ? 'filled' : 'outlined'} color={isActive ? 'primary' : 'default'}
                onClick={() => { onChange(pFrom, pThru); setAnchorEl(null); }} sx={{ fontSize: '0.75rem' }} />
            );
          })}
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Tùy chọn</Typography>
        <Stack spacing={1.5}>
          <TextField size="small" label="Từ ngày" type="date" value={fromDate ?? ''}
            onChange={(e) => onChange(e.target.value || undefined, thruDate)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField size="small" label="Đến ngày" type="date" value={thruDate ?? ''}
            onChange={(e) => onChange(fromDate, e.target.value || undefined)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Stack>
        {hasValue && (
          <Button size="small" fullWidth sx={{ mt: 1.5 }} onClick={() => { onChange(undefined, undefined); setAnchorEl(null); }}>
            Xóa
          </Button>
        )}
      </Popover>
    </>
  );
};

// ─── ChecklistFilter ────────────────────────────────────────────────────────

const ChecklistFilter: FC<{
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ options, selected, onChange, placeholder }) => (
  <Autocomplete
    multiple size="small" disableCloseOnSelect options={options}
    getOptionLabel={(o) => o.label}
    value={options.filter((o) => selected.includes(o.value))}
    onChange={(_, sel) => onChange(sel.map((s) => s.value))}
    renderOption={(props, option, { selected: sel }) => (
      <li {...props} key={option.value}>
        <Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />}
          checkedIcon={<CheckBoxIcon fontSize="small" />} checked={sel} sx={{ mr: 0.5, p: 0 }} />
        <Typography variant="body2">{option.label}</Typography>
      </li>
    )}
    renderInput={(params) => (
      <TextField {...params} variant="standard" placeholder={placeholder}
        slotProps={{ input: { ...params.slotProps?.input, disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
    )}
    sx={{ minWidth: 0 }}
  />
);

// ─── Page ───────────────────────────────────────────────────────────────────

export const POListPage: FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<POFilters>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [localOrderId, setLocalOrderId] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localFacility, setLocalFacility] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string[]>([]);

  const [debouncedTexts, setDebouncedTexts] = useState({ orderId: '', description: '', facility: '' });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTexts({ orderId: localOrderId, description: localDescription, facility: localFacility });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [localOrderId, localDescription, localFacility]);

  const activeFilters: POFilters = {
    ...filters,
    orderId: debouncedTexts.orderId || undefined,
    originFacilityId: debouncedTexts.facility || undefined,
    orderName: debouncedTexts.description || undefined,
    statusFilters: statusFilter.length ? statusFilter : undefined,
    isAllocationFilters: orderTypeFilter.length ? orderTypeFilter : undefined,
  };

  const { data, isLoading, isFetching, refetch } = usePurchaseOrders(activeFilters, page, pageSize);
  const orders = data?.poList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const handleClearFilters = () => {
    setFilters({});
    setLocalOrderId(''); setLocalDescription(''); setLocalFacility('');
    setStatusFilter([]); setOrderTypeFilter([]);
    setPage(0);
  };

  const hasActiveFilters = !!(
    localOrderId || localDescription || localFacility ||
    statusFilter.length || orderTypeFilter.length ||
    filters.fromDate || filters.thruDate
  );

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'orderId', label: 'Mã đơn', sortable: true, width: 120,
      render: (row) => (
        <Link component="button" variant="body2"
          onClick={() => navigate(`/po/orders/${row.orderId}`)} sx={{ textAlign: 'left', fontWeight: 600 }}>
          {row.orderId}
        </Link>
      ),
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..."
          value={localOrderId} onChange={(e) => setLocalOrderId(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'facilityName', label: 'Kênh bán hàng', width: 250,
      render: (row) => (
        <Typography variant="body2" noWrap title={row.facilityName}>
          {row.originFacilityId ? `[${row.originFacilityId}] ${row.facilityName ?? ''}` : '—'}
        </Typography>
      ),
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..."
          value={localFacility} onChange={(e) => setLocalFacility(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'statusId', label: 'Trạng thái', sortable: true, width: 140,
      render: (row) => (
        <StatusBadge status={row.statusId}
          label={row.statusDescription ?? PO_STATUS_LABELS[row.statusId] ?? row.statusId} />
      ),
      filterRender: () => (
        <ChecklistFilter options={STATUS_OPTIONS} selected={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(0); }} placeholder="Tìm..." />
      ),
    },
    {
      key: 'orderDate', label: 'Ngày tạo', sortable: true, width: 130,
      render: (row) => <Typography variant="body2">{formatDate(row.orderDate)}</Typography>,
      filterRender: () => (
        <DateRangeFilter fromDate={filters.fromDate} thruDate={filters.thruDate}
          onChange={(from, thru) => { setFilters(f => ({ ...f, fromDate: from, thruDate: thru })); setPage(0); }} />
      ),
    },
    {
      key: 'isAllocation', label: 'Loại đơn', width: 130,
      render: (row) => (
        <Typography variant="body2" noWrap>
          {PO_ORDER_TYPE_LABELS[row.isAllocation ?? 'N'] ?? '—'}
        </Typography>
      ),
      filterRender: () => (
        <ChecklistFilter options={ORDER_TYPE_OPTIONS} selected={orderTypeFilter}
          onChange={(v) => setOrderTypeFilter(v)} placeholder="Tìm..." />
      ),
    },
    {
      key: 'shipAfterDate', label: 'Giao từ', width: 120,
      render: (row) => <Typography variant="body2">{formatDate(row.shipAfterDate)}</Typography>,
    },
    {
      key: 'shipBeforeDate', label: 'Giao trước', width: 120,
      render: (row) => <Typography variant="body2">{formatDate(row.shipBeforeDate)}</Typography>,
    },
    {
      key: 'orderName', label: 'Mô tả', width: 200,
      render: (row) => <Typography variant="body2" noWrap>{row.orderName ?? '—'}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..."
          value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'remainingSubTotal', label: 'Còn lại', width: 140,
      render: (row) => (
        <Typography variant="body2" noWrap sx={{ textAlign: 'right', fontWeight: 500, fontFamily: 'monospace' }}>
          {formatCurrency(row.remainingSubTotal, row.currencyUom)}
        </Typography>
      ),
    },
    {
      key: 'grandTotal', label: 'Tổng sau thuế', sortable: true, width: 140,
      render: (row) => (
        <Typography variant="body2" noWrap sx={{ textAlign: 'right', fontWeight: 500, fontFamily: 'monospace' }}>
          {formatCurrency(row.grandTotal, row.currencyUom)}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Quản lý đơn mua' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Tạo mới">
              <IconButton size="small" color="primary" onClick={() => navigate('/po/orders/new')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Xóa bộ lọc">
                <IconButton size="small" onClick={handleClearFilters}>
                  <FilterOffIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}>
              <IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}>
                <FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới">
              <IconButton size="small" onClick={() => refetch()} disabled={isFetching}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <DataTable
        columns={columns}
        rows={orders}
        rowKey={(row) => row.orderId}
        loading={isLoading || isFetching}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => { setSortBy(key); setSortOrder(order); }}
        emptyMessage="Không tìm thấy đơn hàng"
        filtersVisible={filtersVisible}
        columnStorageKey="purchase-orders"
      />
    </Box>
  );
};
