import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Chip, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Button } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

const TYPE_OPTIONS = [{ value: '', label: 'Tất cả' }, { value: 'GRID', label: 'GRID' }, { value: 'LIST', label: 'LIST' }];
const STATUS_OPTIONS = [{ value: '', label: 'Tất cả' }, { value: 'ENABLED', label: 'Hiển thị' }, { value: 'HIDDEN', label: 'Ẩn' }];

export const QuickPickMenuPage: FC = () => {
  const { data: menus = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['quick-pick-menus'],
    queryFn: () => salesApi.listQuickPickMenus(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [filtered, setFiltered] = useState(menus);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(menus.filter(r => {
      if (filterName && !lc(String(r.menuName ?? '')).includes(lc(filterName))) return false;
      if (filterType && String(r.menuTypeId) !== filterType) return false;
      if (filterStatus && String(r.statusId) !== filterStatus) return false;
      return true;
    }));
  }, [menus, filterName, filterType, filterStatus]);

  const hasActiveFilters = !!(filterName || filterType || filterStatus);
  const handleClearFilters = () => { setFilterName(''); setFilterType(''); setFilterStatus(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newMenuId, setNewMenuId] = useState('');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuType, setNewMenuType] = useState('GRID');
  const handleAddOpen = () => { setNewMenuId(''); setNewMenuName(''); setNewMenuType('GRID'); setAddOpen(true); };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createQuickPickMenu({ menuId: newMenuId, menuName: newMenuName, menuTypeId: newMenuType }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['quick-pick-menus'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const makeSelectFilter = (value: string, setter: (v: string) => void, options: { value: string; label: string }[]) => () => (
    <TextField size="small" variant="standard" select fullWidth value={value}
      onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
      {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'sequenceNum', label: 'STT', width: 60,
      render: (r) => <Typography variant="body2">{String(r.sequenceNum ?? '')}</Typography> },
    { key: 'menuId', label: 'Mã menu', width: 150,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.menuId ?? '')}</Typography> },
    { key: 'menuTypeId', label: 'Loại', width: 100,
      render: (r) => <Chip size="small" label={String(r.menuTypeId ?? '—')}
        color={r.menuTypeId === 'GRID' ? 'primary' : 'default'} variant="outlined" />,
      filterRender: makeSelectFilter(filterType, setFilterType, TYPE_OPTIONS) },
    { key: 'menuName', label: 'Tên menu', width: 250,
      render: (r) => <Typography variant="body2">{String(r.menuName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterName, setFilterName) },
    { key: 'statusId', label: 'Trạng thái', width: 120,
      render: (r) => <Chip size="small"
        label={r.statusId === 'ENABLED' ? 'Hiển thị' : r.statusId === 'HIDDEN' ? 'Ẩn' : String(r.statusId ?? '—')}
        color={r.statusId === 'ENABLED' ? 'success' : 'default'} />,
      filterRender: makeSelectFilter(filterStatus, setFilterStatus, STATUS_OPTIONS) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'DS sản phẩm nhanh' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.menuId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có menu sản phẩm nhanh" filtersVisible={filtersVisible}
        columnStorageKey="settings-quick-menus" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm menu sản phẩm nhanh</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Mã menu')} value={newMenuId}
            onChange={(e) => setNewMenuId(e.target.value)} required />
          <TextField size="small" label={reqLabel('Tên menu')} value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)} required />
          <TextField size="small" label={reqLabel('Loại')} select value={newMenuType}
            onChange={(e) => setNewMenuType(e.target.value)}>
            <MenuItem value="GRID">GRID</MenuItem>
            <MenuItem value="LIST">LIST</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newMenuId.trim() || !newMenuName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
