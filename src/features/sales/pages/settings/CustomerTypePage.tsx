import { type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const CustomerTypePage: FC = () => {
  const { data: types = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['party-types'],
    queryFn: () => salesApi.listPartyTypes(),
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'partyTypeId', label: 'Mã loại', width: 200,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.partyTypeId ?? '')}</Typography> },
    { key: 'parentTypeId', label: 'Loại cha', width: 200,
      render: (r) => <Typography variant="body2">{String(r.parentTypeId ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 300,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Customer Type' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      <DataTable columns={columns} rows={types} rowKey={(r) => String(r.partyTypeId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có loại khách hàng" columnStorageKey="settings-customer-types" />
    </Box>
  );
};
