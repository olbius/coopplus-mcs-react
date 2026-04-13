import { type FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';
import { actionsApi } from '../../../../api/actions.api';

interface Props {
  enumTypeId: string;
  title: string;
  breadcrumbs: { label: string; path?: string }[];
}

export const EnumListPage: FC<Props> = ({ enumTypeId, title, breadcrumbs }) => {
  const { data: enums = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['enumerations', enumTypeId],
    queryFn: () => salesApi.listEnumerationsFull(enumTypeId),
  });

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newEnumId, setNewEnumId] = useState('');
  const [newEnumCode, setNewEnumCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSequenceId, setNewSequenceId] = useState('');

  const handleAddOpen = () => { setNewEnumId(''); setNewEnumCode(''); setNewDescription(''); setNewSequenceId(''); setAddOpen(true); };
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => actionsApi.createEnumeration({ enumId: newEnumId, enumTypeId, enumCode: newEnumCode || undefined, description: newDescription, sequenceId: newSequenceId || undefined }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['enumerations', enumTypeId] }); },
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'enumId', label: 'Mã', width: 200,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.enumId ?? '')}</Typography> },
    { key: 'enumCode', label: 'Code', width: 160,
      render: (r) => <Typography variant="body2">{String(r.enumCode ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 300,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography> },
    { key: 'sequenceId', label: 'Thứ tự', width: 80,
      render: (r) => <Typography variant="body2">{String(r.sequenceId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={enums} rowKey={(r) => String(r.enumId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage={`Không có ${title.toLowerCase()}`}
        columnStorageKey={`settings-enum-${enumTypeId}`} />

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm {title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label="Mã" value={newEnumId} onChange={(e) => setNewEnumId(e.target.value)} required />
          <TextField size="small" label="Code" value={newEnumCode} onChange={(e) => setNewEnumCode(e.target.value)} />
          <TextField size="small" label="Mô tả" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required />
          <TextField size="small" label="Thứ tự" value={newSequenceId} onChange={(e) => setNewSequenceId(e.target.value)} type="number" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newEnumId || !newDescription || createMut.isPending}
            onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
