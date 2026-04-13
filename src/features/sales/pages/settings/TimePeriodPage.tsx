import { type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

export const TimePeriodPage: FC = () => {
  const { data: periods = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['custom-time-periods'],
    queryFn: () => salesApi.listCustomTimePeriods(),
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'customTimePeriodId', label: 'Mã kỳ', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.customTimePeriodId ?? '')}</Typography> },
    { key: 'periodTypeId', label: 'Loại kỳ', width: 150,
      render: (r) => <Typography variant="body2">{String(r.periodTypeId ?? '—')}</Typography> },
    { key: 'periodNum', label: 'Số kỳ', width: 80,
      render: (r) => <Typography variant="body2">{String(r.periodNum ?? '—')}</Typography> },
    { key: 'periodName', label: 'Tên kỳ', width: 200,
      render: (r) => <Typography variant="body2">{String(r.periodName ?? '—')}</Typography> },
    { key: 'fromDate', label: 'Từ ngày', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.fromDate as string)}</Typography> },
    { key: 'thruDate', label: 'Đến ngày', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.thruDate as string)}</Typography> },
    { key: 'organizationPartyId', label: 'Tổ chức', width: 120,
      render: (r) => <Typography variant="body2">{String(r.organizationPartyId ?? '—')}</Typography> },
    { key: 'parentPeriodId', label: 'Kỳ cha', width: 120,
      render: (r) => <Typography variant="body2">{String(r.parentPeriodId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Custom Time Period' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      <DataTable columns={columns} rows={periods} rowKey={(r) => String(r.customTimePeriodId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có kỳ thời gian" columnStorageKey="settings-time-periods" />
    </Box>
  );
};
