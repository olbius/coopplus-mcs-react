import { type FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const StoreGroupPage: FC = () => {
  const { data: groups = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['product-store-groups'],
    queryFn: () => salesApi.listProductStoreGroups(),
  });

  const [addOpen, setAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddOpen = () => { setNewId(''); setNewName(''); setNewDesc(''); setAddOpen(true); };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createProductStoreGroup({ productStoreGroupId: newId || undefined, productStoreGroupName: newName, description: newDesc || undefined }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['product-store-groups'] }); },
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'productStoreGroupId', label: 'Mã nhóm', width: 180,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.productStoreGroupId ?? '')}</Typography> },
    { key: 'productStoreGroupName', label: 'Tên nhóm', width: 300,
      render: (r) => <Typography variant="body2">{String(r.productStoreGroupName ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 350,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Nhóm cửa hàng' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={groups} rowKey={(r) => String(r.productStoreGroupId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có nhóm cửa hàng" columnStorageKey="settings-store-groups" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm nhóm cửa hàng</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label="Mã nhóm" value={newId} onChange={(e) => setNewId(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 20 } }} />
          <TextField size="small" label={<>Tên nhóm <span style={{ color: 'red' }}>*</span></>}
            value={newName} onChange={(e) => setNewName(e.target.value)} required
            slotProps={{ htmlInput: { maxLength: 100 } }} />
          <TextField size="small" label="Mô tả" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
            multiline rows={2} slotProps={{ htmlInput: { maxLength: 50 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
