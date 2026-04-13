import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtNum = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN'); };

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'SUCCESS', label: 'SUCCESS' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'WAIT_CONFIRM', label: 'WAIT_CONFIRM' },
];

const STATUS_CODE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ORDER_SUCCESS', label: 'ORDER_SUCCESS' },
  { value: 'REFUND_SUCCESS', label: 'REFUND_SUCCESS' },
  { value: 'PAYMENT_ERROR', label: 'PAYMENT_ERROR' },
];

const PARTNER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'EVN', label: 'EVN' },
  { value: 'MOMO', label: 'MOMO' },
  { value: 'VTC', label: 'VTC' },
  { value: 'VNPT', label: 'VNPT' },
  { value: 'VNPTPAY', label: 'VNPTPAY' },
  { value: 'VIETTELPAY', label: 'VIETTELPAY' },
  { value: 'VNG', label: 'VNG' },
  { value: 'SIGLAZ', label: 'SIGLAZ' },
  { value: 'TICKETGO', label: 'TICKETGO' },
  { value: 'VIETJET', label: 'VIETJET' },
  { value: 'PAYOO', label: 'PAYOO' },
];

export const PartnerHistoryPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const [filterPartner, setFilterPartner] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');
  const [filterStatusCode, setFilterStatusCode] = useState('');
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterEntryDateFrom, setFilterEntryDateFrom] = useState('');
  const [filterEntryDateThru, setFilterEntryDateThru] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        thirdPartyCode: filterPartner, statusId: filterStatusId, statusCode: filterStatusCode,
        orderId: filterOrderId, productId: filterProductId, requestId: filterRequestId,
        entryDateFrom: filterEntryDateFrom, entryDateThru: filterEntryDateThru,
      });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterPartner, filterStatusId, filterStatusCode, filterOrderId, filterProductId, filterRequestId, filterEntryDateFrom, filterEntryDateThru]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['partner-history', page, pageSize, debouncedFilters],
    queryFn: () => salesApi.listPos3PtyTransLog(page, pageSize, debouncedFilters),
    placeholderData: (prev: { logList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.logList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterPartner || filterStatusId || filterStatusCode || filterOrderId || filterProductId || filterRequestId || filterEntryDateFrom || filterEntryDateThru);
  const handleClearFilters = () => {
    setFilterPartner(''); setFilterStatusId(''); setFilterStatusCode('');
    setFilterOrderId(''); setFilterProductId(''); setFilterRequestId('');
    setFilterEntryDateFrom(''); setFilterEntryDateThru('');
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const makeSelectFilter = (value: string, setter: (v: string) => void, options: { value: string; label: string }[]) => () => (
    <TextField size="small" variant="standard" select fullWidth value={value}
      onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
      {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'logId', label: 'Log ID', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.logId ?? '')}</Typography> },
    { key: 'thirdPartyCode', label: 'Đối tác', width: 100,
      render: (r) => <Typography variant="body2">{String(r.thirdPartyCode ?? '—')}</Typography>,
      filterRender: makeSelectFilter(filterPartner, setFilterPartner, PARTNER_OPTIONS) },
    { key: 'entryDate', label: 'Ngày giao dịch', width: 180,
      render: (r) => <Typography variant="body2">{fmtDate(r.entryDate as string)}</Typography>,
      filterRender: () => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <TextField size="small" type="date" variant="standard" value={filterEntryDateFrom}
            onChange={(e) => setFilterEntryDateFrom(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } } }} sx={{ flex: 1 }} />
          <TextField size="small" type="date" variant="standard" value={filterEntryDateThru}
            onChange={(e) => setFilterEntryDateThru(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } } }} sx={{ flex: 1 }} />
        </Box>
      ),
    },
    { key: 'statusId', label: 'Trạng thái', width: 110,
      render: (r) => <Typography variant="body2" color={
        r.statusId === 'SUCCESS' ? 'success.main' : r.statusId === 'ERROR' ? 'error.main' : 'text.primary'
      }>{String(r.statusId ?? '—')}</Typography>,
      filterRender: makeSelectFilter(filterStatusId, setFilterStatusId, STATUS_OPTIONS) },
    { key: 'statusCode', label: 'Mã trạng thái', width: 140,
      render: (r) => <Typography variant="body2">{String(r.statusCode ?? '—')}</Typography>,
      filterRender: makeSelectFilter(filterStatusCode, setFilterStatusCode, STATUS_CODE_OPTIONS) },
    { key: 'orderId', label: 'Mã đơn hàng', width: 120,
      render: (r) => <Typography variant="body2">{String(r.orderId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterOrderId, setFilterOrderId) },
    { key: 'productId', label: 'Mã SP', width: 100,
      render: (r) => <Typography variant="body2">{String(r.productId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterProductId, setFilterProductId) },
    { key: 'amount', label: 'Số tiền', width: 110, align: 'right',
      render: (r) => <Typography variant="body2">{r.amount != null ? fmtNum(r.amount as number) : '—'}</Typography> },
    { key: 'payType', label: 'Loại TT', width: 90,
      render: (r) => <Typography variant="body2">{String(r.payType ?? '—')}</Typography> },
    { key: 'quantityTrans', label: 'SL', width: 60, align: 'right',
      render: (r) => <Typography variant="body2">{r.quantityTrans != null ? fmtNum(r.quantityTrans as number) : '—'}</Typography> },
    { key: 'requestDate', label: 'Ngày yêu cầu', width: 170,
      render: (r) => <Typography variant="body2">{fmtDate(r.requestDate as string)}</Typography> },
    { key: 'requestId', label: 'Request ID', width: 100,
      render: (r) => <Typography variant="body2">{String(r.requestId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterRequestId, setFilterRequestId) },
    { key: 'supplierTransId', label: 'NCC Trans ID', width: 110,
      render: (r) => <Typography variant="body2">{String(r.supplierTransId ?? '—')}</Typography> },
    { key: 'supplierCustomerId', label: 'NCC KH ID', width: 110,
      render: (r) => <Typography variant="body2">{String(r.supplierCustomerId ?? '—')}</Typography> },
    { key: 'supplierInvoiceNo', label: 'NCC Hóa đơn', width: 110,
      render: (r) => <Typography variant="body2">{String(r.supplierInvoiceNo ?? '—')}</Typography> },
    { key: 'responseCode', label: 'Response', width: 80,
      render: (r) => <Typography variant="body2">{String(r.responseCode ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 250,
      render: (r) => <Typography variant="body2" noWrap title={String(r.description ?? '')}>{String(r.description ?? '—')}</Typography> },
    { key: 'partnerBalance', label: 'Số dư ĐT', width: 110, align: 'right',
      render: (r) => <Typography variant="body2">{r.partnerBalance != null ? fmtNum(r.partnerBalance as number) : '—'}</Typography> },
    { key: 'customerPhone', label: 'SĐT KH', width: 120,
      render: (r) => <Typography variant="body2">{String(r.customerPhone ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đối tác', path: '/sales/partner/services' }, { label: 'DS lịch sử giao dịch' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.logId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có lịch sử giao dịch" filtersVisible={filtersVisible} columnStorageKey="partner-history" />
    </Box>
  );
};
