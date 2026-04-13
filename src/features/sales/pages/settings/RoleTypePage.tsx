import { type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const RoleTypePage: FC = () => {
  const { data: roles = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['role-types'],
    queryFn: () => salesApi.listRoleTypes(),
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'roleTypeId', label: 'Mã vai trò', width: 200,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.roleTypeId ?? '')}</Typography> },
    { key: 'parentTypeId', label: 'Vai trò cha', width: 200,
      render: (r) => <Typography variant="body2">{String(r.parentTypeId ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 300,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Role Type' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      <DataTable columns={columns} rows={roles} rowKey={(r) => String(r.roleTypeId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có loại vai trò" columnStorageKey="settings-role-types" />
    </Box>
  );
};
