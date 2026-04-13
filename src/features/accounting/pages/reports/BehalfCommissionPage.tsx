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
  { key: 'partyIdFrom', label: 'Mã NCC', width: 120 },
  { key: 'supplierName', label: 'Tên NCC' },
  { key: 'productId', label: 'Mã DV', width: 120 },
  { key: 'productName', label: 'Tên dịch vụ' },
  { key: 'termValue', label: 'Giá trị HĐ', width: 120, align: 'right', render: (r) => fmtCur(r.termValue) },
  { key: 'termValueToStore', label: 'HĐ theo CH', width: 120, align: 'right', render: (r) => fmtCur(r.termValueToStore) },
  { key: 'fromDate', label: 'Từ ngày', width: 120, render: (r) => fmtDate(String(r.fromDate ?? '')) },
  { key: 'thruDate', label: 'Đến ngày', width: 120, render: (r) => fmtDate(String(r.thruDate ?? '')) },
  { key: 'isCancel', label: 'Hủy', width: 60 },
];

export const BehalfCommissionPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['behalf-commission', page, pageSize],
    queryFn: () => accReportApi.listAgreementTermSupplier(page, pageSize),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Kế toán' }, { label: 'Báo cáo', path: '/accounting/reports' }, { label: 'Hoa hồng thu hộ' }]} />
      <Box sx={{ px: 2, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle2">Hoa hồng thu hộ theo hợp đồng NCC</Typography>
        </Paper>
        <DataTable columns={columns} rows={data?.rows ?? []} rowKey={(r) => String(r.agreementTermId ?? Math.random())}
          loading={isLoading} total={data?.totalRows ?? 0} page={page} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize} emptyMessage="Không có dữ liệu" />
      </Box>
    </Box>
  );
};
