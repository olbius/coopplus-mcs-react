import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Chip,
  Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon,
  KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

// Expandable row detail component
const TransEntryDetail: FC<{ acctgTransId: string }> = ({ acctgTransId }) => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['acctg-trans-entries', acctgTransId],
    queryFn: () => accountingApi.listAcctgTransEntries(acctgTransId),
  });

  if (isLoading) return <Typography variant="caption" sx={{ p: 1 }}>Đang tải...</Typography>;
  if (entries.length === 0) return <Typography variant="caption" sx={{ p: 1, color: 'text.secondary' }}>Không có bút toán</Typography>;

  return (
    <Table size="small" sx={{ bgcolor: 'action.hover' }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>STT</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Mã SP</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tài khoản</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tên TK</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Nợ/Có</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Số tiền</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Mô tả</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map((e, idx) => (
          <TableRow key={idx}>
            <TableCell sx={{ fontSize: '0.75rem' }}>{String(e.acctgTransEntrySeqId ?? '')}</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>{String(e.productId ?? '—')}</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>{String(e.glAccountId ?? '—')}</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>{String(e.glAccountName ?? '—')}</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>
              <Chip size="small" label={e.debitCreditFlag === 'D' ? 'NỢ' : 'CÓ'}
                color={e.debitCreditFlag === 'D' ? 'error' : 'success'} variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }} />
            </TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }} align="right">{fmtCurrency(e.amount as number)}</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>{String(e.description ?? '—')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const TransactionListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterTransId, setFilterTransId] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [debouncedFilter, setDebouncedFilter] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilter(filterTransId); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterTransId]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['acc-transactions', page, pageSize, debouncedFilter],
    queryFn: () => accountingApi.listAcctgTrans(page, pageSize, { acctgTransId: debouncedFilter }),
    placeholderData: (prev: { transList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.transList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!filterTransId;

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: '_expand', label: '', width: 40,
      render: (r) => {
        const id = String(r.acctgTransId ?? '');
        const isExpanded = expandedRows.has(id);
        return (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(id); }}>
            {isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
          </IconButton>
        );
      } },
    { key: 'acctgTransId', label: 'Mã GD', width: 120,
      render: (r) => <Typography variant="body2" sx={{
        fontWeight: 600,
        color: r.isPosted === 'Y' ? '#00b384' : '#ff9999',
      }}>{String(r.acctgTransId ?? '')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={filterTransId}
          onChange={(e) => setFilterTransId(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ) },
    { key: 'acctgTransTypeId', label: 'Loại', width: 180,
      render: (r) => <Typography variant="body2">{String(r.acctgTransTypeId ?? '—')}</Typography> },
    { key: 'transactionDate', label: 'Ngày GD', width: 170,
      render: (r) => <Typography variant="body2">{fmtDate(r.transactionDate as string)}</Typography> },
    { key: 'isPosted', label: 'Đã ghi sổ', width: 90,
      render: (r) => <Chip size="small" label={r.isPosted === 'Y' ? 'Có' : 'Chưa'}
        color={r.isPosted === 'Y' ? 'success' : 'default'} /> },
    { key: 'glFiscalTypeId', label: 'Loại tài chính', width: 130,
      render: (r) => <Typography variant="body2">{String(r.glFiscalTypeId ?? '—')}</Typography> },
    { key: 'invoiceId', label: 'Mã HĐ', width: 100,
      render: (r) => <Typography variant="body2">{String(r.invoiceId ?? '—')}</Typography> },
    { key: 'paymentId', label: 'Mã TT', width: 100,
      render: (r) => <Typography variant="body2">{String(r.paymentId ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 250,
      render: (r) => <Typography variant="body2" noWrap title={String(r.description ?? '')}>{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Kế toán' }, { label: 'Giao dịch' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={() => setFilterTransId('')}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.acctgTransId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có giao dịch" filtersVisible={filtersVisible} columnStorageKey="acc-transactions"
        renderRowDetail={(r) => {
          const id = String(r.acctgTransId ?? '');
          if (!expandedRows.has(id)) return null;
          return (
            <Box sx={{ pl: 5, pr: 2, py: 0.5 }}>
              <TransEntryDetail acctgTransId={id} />
            </Box>
          );
        }}
      />
    </Box>
  );
};
