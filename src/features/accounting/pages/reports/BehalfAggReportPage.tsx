import { type FC, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { accReportApi } from '../../../../api/accounting-report.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

type Row = Record<string, unknown>;

const columns: Column<Row>[] = [
  { key: 'partyId', label: 'Mã NCC', width: 120 },
  { key: 'fullName', label: 'Tên NCC' },
  { key: 'fromDate', label: 'Ngày bắt đầu', width: 140, render: (r) => fmtDate(String(r.fromDate ?? '')) },
  { key: 'thruDate', label: 'Ngày kết thúc', width: 140, render: (r) => fmtDate(String(r.thruDate ?? '')) },
  { key: 'statusDescription', label: 'Trạng thái', width: 160 },
];

export const BehalfAggReportPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['behalf-agg', page, pageSize],
    queryFn: () => accReportApi.listPayCollBehaflAgg(page, pageSize),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Kế toán' }, { label: 'Báo cáo', path: '/accounting/reports' }, { label: 'Tổng hợp thu hộ' }]} />
      <Box sx={{ px: 2, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle2">Tổng hợp thu hộ</Typography>
        </Paper>
        <DataTable columns={columns} rows={data?.rows ?? []} rowKey={(r) => String(r.behalfAggId ?? Math.random())}
          loading={isLoading} total={data?.totalRows ?? 0} page={page} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize} emptyMessage="Không có dữ liệu" />
      </Box>
    </Box>
  );
};
