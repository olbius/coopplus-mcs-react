import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const CustomerGroupPage: FC = () => {
  const { data: groups = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customer-groups'],
    queryFn: () => salesApi.listCustomerGroups(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterPartyId, setFilterPartyId] = useState('');
  const [filterGroupName, setFilterGroupName] = useState('');

  const [filtered, setFiltered] = useState(groups);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(groups.filter(r => {
      if (filterPartyId && !lc(String(r.partyCode ?? r.partyId ?? '')).includes(lc(filterPartyId))) return false;
      if (filterGroupName && !lc(String(r.groupName ?? '')).includes(lc(filterGroupName))) return false;
      return true;
    }));
  }, [groups, filterPartyId, filterGroupName]);

  const hasActiveFilters = !!(filterPartyId || filterGroupName);
  const handleClearFilters = () => { setFilterPartyId(''); setFilterGroupName(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newPartyCode, setNewPartyCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const handleAddOpen = () => { setNewPartyCode(''); setNewGroupName(''); setAddOpen(true); };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createProductStoreGroup({ productStoreGroupId: newPartyCode, productStoreGroupName: newGroupName }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['customer-groups'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'partyCode', label: 'Mã nhóm', width: 150,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.partyCode ?? r.partyId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterPartyId, setFilterPartyId) },
    { key: 'groupName', label: 'Tên nhóm', width: 350,
      render: (r) => <Typography variant="body2">{String(r.groupName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterGroupName, setFilterGroupName) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Nhóm khách hàng' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.partyId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có nhóm khách hàng" filtersVisible={filtersVisible}
        columnStorageKey="settings-customer-groups" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm nhóm khách hàng</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Mã nhóm')} value={newPartyCode}
            onChange={(e) => setNewPartyCode(e.target.value)} required slotProps={{ htmlInput: { maxLength: 20 } }} />
          <TextField size="small" label={reqLabel('Tên nhóm')} value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)} required slotProps={{ htmlInput: { maxLength: 100 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newPartyCode.trim() || !newGroupName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
