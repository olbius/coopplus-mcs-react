import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';
import { actionsApi } from '../../../../api/actions.api';

export const PartyClassificationPage: FC = () => {
  const { data: groups = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['party-classification-groups'],
    queryFn: () => salesApi.listPartyClassificationGroups(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterId, setFilterId] = useState('');
  const [filterDesc, setFilterDesc] = useState('');

  const [filtered, setFiltered] = useState(groups);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(groups.filter(r => {
      if (filterId && !lc(String(r.partyClassificationGroupId ?? '')).includes(lc(filterId))) return false;
      if (filterDesc && !lc(String(r.description ?? '')).includes(lc(filterDesc))) return false;
      return true;
    }));
  }, [groups, filterId, filterDesc]);

  const hasActiveFilters = !!(filterId || filterDesc);
  const handleClearFilters = () => { setFilterId(''); setFilterDesc(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const handleAddOpen = () => { setNewId(''); setNewDesc(''); setAddOpen(true); };
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => actionsApi.createPartyClassGroup({ partyClassificationGroupId: newId, description: newDesc }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['party-classification-groups'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'partyClassificationGroupId', label: 'Mã phân loại', width: 180,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.partyClassificationGroupId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterId, setFilterId) },
    { key: 'description', label: 'Mô tả', width: 300,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterDesc, setFilterDesc) },
    { key: 'partyClassificationTypeId', label: 'Loại phân loại', width: 200,
      render: (r) => <Typography variant="body2">{String(r.partyClassificationTypeId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Loại phân loại khách hàng' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.partyClassificationGroupId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có loại phân loại" filtersVisible={filtersVisible}
        columnStorageKey="settings-party-classification" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm loại phân loại khách hàng</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Mã loại')} value={newId}
            onChange={(e) => setNewId(e.target.value)} required />
          <TextField size="small" label={reqLabel('Mô tả')} value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newId.trim() || !newDesc.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
