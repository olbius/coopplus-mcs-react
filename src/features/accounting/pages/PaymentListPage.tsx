import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Chip, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

const STATUS_COLORS: Record<string, string> = {
  PMNT_CANCELLED: '#ff6f4c', PMNT_NOT_PAID: '#ffd595', PMNT_VOID: '#00a9ff',
  PMNT_CONFIRMED: '#00CC99', PMNT_RECEIVED: '#8bd8b3', PMNT_SENT: '#0EAFAF',
};

const PAYMENT_STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'PMNT_NOT_PAID', label: 'Chưa thanh toán' },
  { value: 'PMNT_RECEIVED', label: 'Đã nhận' },
  { value: 'PMNT_SENT', label: 'Đã gửi' },
  { value: 'PMNT_CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PMNT_CANCELLED', label: 'Đã hủy' },
];

interface Props { paymentType: 'AR' | 'AP'; title: string; breadcrumbs: { label: string; path?: string }[] }

export const PaymentListPage: FC<Props> = ({ paymentType, title, breadcrumbs }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterPaymentId, setFilterPaymentId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ paymentId: '', statusId: '' });
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilters({ paymentId: filterPaymentId, statusId: filterStatus }); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterPaymentId, filterStatus]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['acc-payments', paymentType, page, pageSize, debouncedFilters],
    queryFn: () => accountingApi.listPayments(page, pageSize, paymentType, debouncedFilters),
    placeholderData: (prev: { paymentList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.paymentList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterPaymentId || filterStatus);
  const handleClearFilters = () => { setFilterPaymentId(''); setFilterStatus(''); };

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'paymentId', label: 'Mã TT', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.paymentId ?? '')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={filterPaymentId}
          onChange={(e) => setFilterPaymentId(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ) },
    { key: 'partyIdFrom', label: 'Từ', width: 100,
      render: (r) => <Typography variant="body2">{String(r.partyIdFrom ?? '—')}</Typography> },
    { key: 'partyIdTo', label: 'Đến', width: 100,
      render: (r) => <Typography variant="body2">{String(r.partyIdTo ?? '—')}</Typography> },
    { key: 'paymentTypeId', label: 'Loại', width: 160,
      render: (r) => <Typography variant="body2">{String(r.paymentTypeDescription ?? r.paymentTypeId ?? '—')}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 140,
      render: (r) => {
        const color = STATUS_COLORS[String(r.statusId)] ?? undefined;
        return <Chip size="small" label={String(r.statusDescription ?? r.statusId ?? '—')}
          sx={color ? { bgcolor: color, color: '#fff' } : undefined} />;
      },
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {PAYMENT_STATUS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ) },
    { key: 'effectiveDate', label: 'Ngày hiệu lực', width: 160,
      render: (r) => <Typography variant="body2">{fmtDate(r.effectiveDate as string)}</Typography> },
    { key: 'amount', label: 'Số tiền', width: 140, align: 'right',
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtCurrency(r.amount as number)}</Typography> },
    { key: 'comments', label: 'Ghi chú', width: 200,
      render: (r) => <Typography variant="body2" noWrap title={String(r.comments ?? '')}>{String(r.comments ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.paymentId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage={`Không có thanh toán ${title.toLowerCase()}`} filtersVisible={filtersVisible}
        columnStorageKey={`acc-payments-${paymentType}`} />
    </Box>
  );
};
