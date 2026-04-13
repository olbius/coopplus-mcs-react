import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const TerminalPOSPage: FC = () => {
  const { data: terminals = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['terminal-pos'],
    queryFn: () => salesApi.listTerminalPOS(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterTerminalId, setFilterTerminalId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterFacility, setFilterFacility] = useState('');

  const [filtered, setFiltered] = useState(terminals);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(terminals.filter(r => {
      if (filterTerminalId && !lc(String(r.posTerminalId ?? '')).includes(lc(filterTerminalId))) return false;
      if (filterName && !lc(String(r.terminalName ?? '')).includes(lc(filterName))) return false;
      if (filterFacility && !lc(String(r.facilityId ?? '')).includes(lc(filterFacility))) return false;
      return true;
    }));
  }, [terminals, filterTerminalId, filterName, filterFacility]);

  const hasActiveFilters = !!(filterTerminalId || filterName || filterFacility);
  const handleClearFilters = () => { setFilterTerminalId(''); setFilterName(''); setFilterFacility(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const handleAddOpen = () => { setNewId(''); setNewName(''); setNewFacility(''); setAddOpen(true); };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createTerminalPOS({ posTerminalId: newId, terminalName: newName, facilityId: newFacility || undefined }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['terminal-pos'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'posTerminalId', label: 'Terminal ID', width: 150,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.posTerminalId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterTerminalId, setFilterTerminalId) },
    { key: 'terminalName', label: 'Tên Terminal', width: 250,
      render: (r) => <Typography variant="body2">{String(r.terminalName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterName, setFilterName) },
    { key: 'facilityId', label: 'Mã kho', width: 150,
      render: (r) => <Typography variant="body2">{String(r.facilityId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFacility, setFilterFacility) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Terminal POS' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.posTerminalId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có Terminal POS" filtersVisible={filtersVisible}
        columnStorageKey="settings-terminal-pos" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm Terminal POS</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Terminal ID')} value={newId}
            onChange={(e) => setNewId(e.target.value)} required slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField size="small" label={reqLabel('Tên Terminal')} value={newName}
            onChange={(e) => setNewName(e.target.value)} required slotProps={{ htmlInput: { maxLength: 100 } }} />
          <TextField size="small" label="Mã kho" value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)} slotProps={{ htmlInput: { maxLength: 60 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newId.trim() || !newName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
