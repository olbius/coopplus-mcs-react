import { type FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

export const FailOrderListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['acc-fail-orders', page, pageSize],
    queryFn: () => accountingApi.listFailOrders(page, pageSize),
    placeholderData: (prev: { failList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.failList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'logDateTime', label: 'Ngày nhận', width: 170,
      render: (r) => <Typography variant="body2">{fmtDate(r.logDateTime as string)}</Typography> },
    { key: 'productId', label: 'Mã SP/DV', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.productId ?? '—')}</Typography> },
    { key: 'productName', label: 'Tên SP/DV', width: 200,
      render: (r) => <Typography variant="body2">{String(r.productName ?? '—')}</Typography> },
    { key: 'supplierCustomerId', label: 'Mã KH', width: 140,
      render: (r) => <Typography variant="body2">{String(r.supplierCustomerId ?? '—')}</Typography> },
    { key: 'phoneNumber', label: 'SĐT KH', width: 120,
      render: (r) => <Typography variant="body2">{String(r.phoneNumber ?? '—')}</Typography> },
    { key: 'amount', label: 'Số tiền', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.amount as number)}</Typography> },
    { key: 'logResult', label: 'Lỗi', width: 350,
      render: (r) => <Typography variant="body2" color="error.main" noWrap title={String(r.logResult ?? '').replace(/<br\/?>/g, ' ')}>
        {String(r.logResult ?? '—').replace(/<br\/?>/g, ' ')}
      </Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Kế toán' }, { label: 'Đơn lỗi' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.posTerminalStateProductId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có đơn lỗi" columnStorageKey="acc-fail-orders" />
    </Box>
  );
};
