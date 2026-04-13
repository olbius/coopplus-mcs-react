import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Chip, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

const INVOICE_STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'INVOICE_IN_PROCESS', label: 'Đang xử lý' },
  { value: 'INVOICE_APPROVED', label: 'Đã duyệt' },
  { value: 'INVOICE_PAID', label: 'Đã thanh toán' },
  { value: 'INVOICE_CANCELLED', label: 'Đã hủy' },
];

export const InvoiceListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterInvoiceId, setFilterInvoiceId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ invoiceId: '', statusId: '' });
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilters({ invoiceId: filterInvoiceId, statusId: filterStatus }); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterInvoiceId, filterStatus]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['acc-invoices', page, pageSize, debouncedFilters],
    queryFn: () => accountingApi.listInvoices(page, pageSize, { invoiceTypeId: 'PURCHASE_INVOICE', ...debouncedFilters }),
    placeholderData: (prev: { invoiceList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.invoiceList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterInvoiceId || filterStatus);
  const handleClearFilters = () => { setFilterInvoiceId(''); setFilterStatus(''); };

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'invoiceId', label: 'Mã HĐ', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.invoiceId ?? '')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={filterInvoiceId}
          onChange={(e) => setFilterInvoiceId(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ) },
    { key: 'invoiceTypeId', label: 'Loại', width: 140,
      render: (r) => <Typography variant="body2">{String(r.invoiceTypeId ?? '—')}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 140,
      render: (r) => <Chip size="small" label={String(r.statusDescription ?? r.statusId ?? '—')}
        color={r.statusId === 'INVOICE_PAID' ? 'success' : r.statusId === 'INVOICE_CANCELLED' ? 'error' : 'default'} />,
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {INVOICE_STATUS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ) },
    { key: 'partyIdFrom', label: 'Từ', width: 100,
      render: (r) => <Typography variant="body2">{String(r.partyIdFrom ?? '—')}</Typography> },
    { key: 'partyId', label: 'Đến', width: 100,
      render: (r) => <Typography variant="body2">{String(r.partyId ?? '—')}</Typography> },
    { key: 'invoiceDate', label: 'Ngày HĐ', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.invoiceDate as string)}</Typography> },
    { key: 'dueDate', label: 'Ngày đến hạn', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.dueDate as string)}</Typography> },
    { key: 'description', label: 'Mô tả', width: 200,
      render: (r) => <Typography variant="body2" noWrap>{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Kế toán' }, { label: 'Chi' }, { label: 'Hóa đơn' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.invoiceId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có hóa đơn" filtersVisible={filtersVisible} columnStorageKey="acc-invoices" />
    </Box>
  );
};
