import { type FC, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { accReportApi } from '../../../../api/accounting-report.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };
const fmtCur = (v?: unknown) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN'); };

type Row = Record<string, unknown>;

const columns: Column<Row>[] = [
  { key: 'invoiceDate', label: 'Ngày thanh toán', width: 130, render: (r) => fmtDate(String(r.invoiceDate ?? '')) },
  { key: 'supplierId', label: 'Mã NCC', width: 100 },
  { key: 'supplierName', label: 'Tên NCC', width: 160 },
  { key: 'productId', label: 'Mã DV', width: 100 },
  { key: 'productName', label: 'Tên DV', width: 160 },
  { key: 'supplierCustomerId', label: 'Khách hàng', width: 150 },
  { key: 'supplierInvoiceId', label: 'Mã hóa đơn', width: 120 },
  { key: 'productStoreId', label: 'Mã CH', width: 90 },
  { key: 'productStoreName', label: 'Tên CH', width: 160 },
  { key: 'amount', label: 'Thu hộ', width: 120, align: 'right', render: (r) => fmtCur(r.amount) },
  { key: 'totalAgreement', label: 'Hoa hồng', width: 120, align: 'right', render: (r) => fmtCur(r.totalAgreement) },
];

export const BehalfDetailMCSPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['behalf-detail-mcs', page, pageSize],
    queryFn: () => accReportApi.listPayColBehalfDetail(page, pageSize),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Kế toán' }, { label: 'Báo cáo', path: '/accounting/reports' }, { label: 'Chi tiết thu hộ (MCS)' }]} />
      <Box sx={{ px: 2, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle2">Chi tiết thu hộ theo giao dịch (MCS)</Typography>
        </Paper>
        <DataTable columns={columns} rows={data?.rows ?? []} rowKey={(r: Row) => String(r.supplierInvoiceId ?? r.transId ?? Math.random())}
          loading={isLoading} total={data?.totalRows ?? 0} page={page} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize} emptyMessage="Không có dữ liệu" />
      </Box>
    </Box>
  );
};
