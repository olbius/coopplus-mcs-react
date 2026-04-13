import { type FC, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Link, TextField, IconButton, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Autocomplete, Checkbox, Chip,
  Popover, Stack, Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon,
  Add as AddIcon, OpenInNew as OpenNewTabIcon, Visibility as ViewIcon,
  CheckBoxOutlineBlank, CheckBox as CheckBoxIcon,
  DateRange as DateRangeIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useSalesOrders } from '../hooks/useSalesOrders';
import type { SalesOrder, SalesOrderFilters } from '../../../types/sales.types';
import { SALES_ORDER_STATUS_LABELS } from '../../../types/sales.types';

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

const STATUS_OPTIONS = Object.entries(SALES_ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const DATE_PRESETS = [
  { key: '3 tháng', range: () => [fmtDate(subMonths(new Date(), 3)), fmtDate(new Date())] },
  { key: 'Tháng này', range: () => [fmtDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), fmtDate(new Date())] },
  { key: '7 ngày', range: () => [fmtDate(new Date(Date.now() - 6 * 86400000)), fmtDate(new Date())] },
  { key: 'Hôm nay', range: () => { const d = fmtDate(new Date()); return [d, d]; } },
] as const;

// Date range filter component
const DateRangeFilter: FC<{ fromDate?: string; thruDate?: string; onChange: (from?: string, thru?: string) => void }> = ({ fromDate, thruDate, onChange }) => {
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
            return (
              <Chip key={preset.key} label={preset.key} size="small"
                variant={fromDate === pFrom && thruDate === pThru ? 'filled' : 'outlined'}
                color={fromDate === pFrom && thruDate === pThru ? 'primary' : 'default'}
                onClick={() => { onChange(pFrom, pThru); setAnchorEl(null); }} sx={{ fontSize: '0.75rem' }} />
            );
          })}
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1.5}>
          <TextField size="small" label="Từ ngày" type="date" value={fromDate ?? ''}
            onChange={(e) => onChange(e.target.value || undefined, thruDate)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField size="small" label="Đến ngày" type="date" value={thruDate ?? ''}
            onChange={(e) => onChange(fromDate, e.target.value || undefined)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Stack>
        {hasValue && (
          <Button size="small" fullWidth sx={{ mt: 1.5 }} onClick={() => { onChange(undefined, undefined); setAnchorEl(null); }}>Xóa</Button>
        )}
      </Popover>
    </>
  );
};

// Checklist filter
const ChecklistFilter: FC<{
  options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void;
}> = ({ options, selected, onChange }) => (
  <Autocomplete multiple size="small" disableCloseOnSelect options={options}
    getOptionLabel={(o) => o.label}
    value={options.filter((o) => selected.includes(o.value))}
    onChange={(_, sel) => onChange(sel.map((s) => s.value))}
    renderOption={(props, option, { selected: sel }) => {
      const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
      return (
        <li key={key} {...rest}>
          <Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={sel} sx={{ mr: 0.5, p: 0 }} />
          <Typography variant="body2">{option.label}</Typography>
        </li>
      );
    }}
    renderInput={(params) => <TextField {...params} variant="standard" placeholder="Lọc..." />}
    sx={{ minWidth: 0 }} />
);

export const SalesOrderListPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get('channel'); // ts, ps, ec

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filters matching old orderList.ftl
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [filterProductStore, setFilterProductStore] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterFromDate, setFilterFromDate] = useState<string | undefined>();
  const [filterThruDate, setFilterThruDate] = useState<string | undefined>();

  const [debouncedTexts, setDebouncedTexts] = useState({ orderId: '', createdBy: '', productStore: '', customer: '' });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTexts({ orderId: filterOrderId, createdBy: filterCreatedBy, productStore: filterProductStore, customer: filterCustomer });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterOrderId, filterCreatedBy, filterProductStore, filterCustomer]);

  const activeFilters: SalesOrderFilters = {
    orderId: debouncedTexts.orderId || undefined,
    createdBy: debouncedTexts.createdBy || undefined,
    productStoreId: debouncedTexts.productStore || undefined,
    statusFilters: filterStatus.length ? filterStatus : undefined,
    fromDate: filterFromDate,
    thruDate: filterThruDate,
  };

  const { data, isLoading, isFetching, refetch } = useSalesOrders(page, pageSize, activeFilters);
  const orders = data?.orderList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; order: SalesOrder } | null>(null);
  const handleContextMenu = useCallback((e: React.MouseEvent, order: SalesOrder) => {
    e.preventDefault(); setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, order });
  }, []);

  const hasActiveFilters = !!(filterOrderId || filterCreatedBy || filterProductStore || filterCustomer || filterStatus.length || filterFromDate || filterThruDate);
  const handleClearFilters = () => {
    setFilterOrderId(''); setFilterCreatedBy(''); setFilterProductStore(''); setFilterCustomer('');
    setFilterStatus([]); setFilterFromDate(undefined); setFilterThruDate(undefined); setPage(0);
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
      value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const breadcrumbLabel = channel === 'ts' ? 'Kênh Telesales' : channel === 'ps' ? 'Kênh POS' : channel === 'ec' ? 'Kênh Ecommerce' : 'Danh sách';

  const columns: Column<SalesOrder>[] = [
    {
      key: 'orderId', label: 'Mã đơn', width: 120,
      render: (row) => (
        <Link component="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}
          onClick={() => navigate(`/sales/orders/${row.orderId}`)}
          onContextMenu={(e) => handleContextMenu(e, row)}>
          {row.orderId}
        </Link>
      ),
      filterRender: makeTextFilter(filterOrderId, setFilterOrderId),
    },
    {
      key: 'createdBy', label: 'Người tạo', width: 120,
      render: (row) => <Typography variant="body2">{row.createdBy ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterCreatedBy, setFilterCreatedBy),
    },
    {
      key: 'productStoreName', label: 'Kênh bán hàng', width: 240,
      render: (row) => <Typography variant="body2" noWrap>{row.productStoreName ?? row.productStoreId ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterProductStore, setFilterProductStore),
    },
    {
      key: 'statusId', label: 'Trạng thái', width: 140,
      render: (row) => <StatusBadge status={row.statusId} label={row.statusDescription ?? SALES_ORDER_STATUS_LABELS[row.statusId] ?? row.statusId} />,
      filterRender: () => <ChecklistFilter options={STATUS_OPTIONS} selected={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(0); }} />,
    },
    {
      key: 'orderDate', label: 'Ngày tạo', width: 130,
      render: (row) => <Typography variant="body2">{formatDate(row.orderDate)}</Typography>,
      filterRender: () => <DateRangeFilter fromDate={filterFromDate} thruDate={filterThruDate}
        onChange={(from, thru) => { setFilterFromDate(from); setFilterThruDate(thru); setPage(0); }} />,
    },
    {
      key: 'grandTotal', label: 'Tổng tiền', width: 140, align: 'right' as const,
      render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatCurrency(row.grandTotal, row.currencyUom)}</Typography>,
    },
    {
      key: 'customerName', label: 'Khách hàng', width: 180,
      render: (row) => <Typography variant="body2" noWrap>{row.customerName ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterCustomer, setFilterCustomer),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng bán' }, { label: breadcrumbLabel }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm mới đơn hàng">
              <IconButton size="small" color="primary" onClick={() => navigate('/sales/orders/new')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Xóa tất cả bộ lọc">
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
        emptyMessage="Không tìm thấy đơn hàng"
        filtersVisible={filtersVisible}
        onRowClick={(row) => navigate(`/sales/orders/${row.orderId}`)}
        columnStorageKey="sales-orders"
      />

      <Menu open={contextMenu !== null} onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
        <MenuItem onClick={() => { window.open(`/sales/orders/${contextMenu?.order.orderId}`, '_blank'); setContextMenu(null); }}>
          <ListItemIcon><OpenNewTabIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết (tab mới)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/sales/orders/${contextMenu?.order.orderId}`); setContextMenu(null); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { refetch(); setContextMenu(null); }}>
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Làm mới</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};
