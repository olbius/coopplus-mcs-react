import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { logisticsApi } from '../../../api/logistics.api';
import { actionsApi } from '../../../api/actions.api';
import { salesApi } from '../../../api/sales.api';
import { apiClient } from '../../../api/client';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

export const FacilityRolePage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterFacility, setFilterFacility] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['log-facility-roles', page, pageSize],
    queryFn: () => logisticsApi.listFacilityPartyRoles(page, pageSize),
    placeholderData: (prev: { roleList: Record<string, any>[]; totalRows: number } | undefined) => prev,
  });

  // Client-side filter on top of server-side pagination
  const allItems = data?.roleList ?? [];
  const [items, setItems] = useState(allItems);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setItems(allItems.filter(r => {
      if (filterFacility && !lc(String(r.facilityId ?? '')).includes(lc(filterFacility))) return false;
      if (filterParty && !lc(String(r.partyName ?? r.partyId ?? '')).includes(lc(filterParty))) return false;
      if (filterRole && !lc(String(r.roleTypeDescription ?? r.roleTypeId ?? '')).includes(lc(filterRole))) return false;
      return true;
    }));
  }, [allItems, filterFacility, filterParty, filterRole]);
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterFacility || filterParty || filterRole);
  const handleClearFilters = () => { setFilterFacility(''); setFilterParty(''); setFilterRole(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Record<string, any> | null>(null);
  const [selectedParty, setSelectedParty] = useState<Record<string, any> | null>(null);
  const [selectedRole, setSelectedRole] = useState<Record<string, any> | null>(null);
  const handleAddOpen = () => { setSelectedFacility(null); setSelectedParty(null); setSelectedRole(null); setAddOpen(true); };
  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;
  const qc = useQueryClient();
  const createRoleMut = useMutation({
    mutationFn: () => actionsApi.createFacilityPartyRole({
      facilityId: String(selectedFacility?.facilityId ?? ''),
      partyId: String(selectedParty?.partyId ?? ''),
      roleTypeId: String(selectedRole?.roleTypeId ?? ''),
    }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['log-facility-roles'] }); },
  });

  // Dropdown data
  const { data: facilityOpts } = useQuery({ queryKey: ['facilities-opts'], queryFn: () => logisticsApi.listFacilities(0, 100, {}), enabled: addOpen });
  const { data: roleOpts } = useQuery({ queryKey: ['role-types-opts'], queryFn: () => salesApi.listRoleTypes(), enabled: addOpen });
  const [partySearch, setPartySearch] = useState('');
  const [partyOpts, setPartyOpts] = useState<Record<string, any>[]>([]);
  useEffect(() => {
    if (!addOpen || partySearch.length < 2) { setPartyOpts([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await apiClient.post('/services/listParties', { pageIndex: '0', pageSize: '20', keyword: partySearch });
        setPartyOpts((res.data as { data?: { partyList?: Record<string, any>[] } })?.data?.partyList ?? []);
      } catch { setPartyOpts([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [partySearch, addOpen]);

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, any>>[] = [
    { key: 'facilityId', label: 'Kho', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.facilityId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterFacility, setFilterFacility) },
    { key: 'partyName', label: 'Tổ chức/Cá nhân', width: 250,
      render: (r) => <Typography variant="body2">{String(r.partyName ?? r.partyId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterParty, setFilterParty) },
    { key: 'roleTypeId', label: 'Vai trò', width: 180,
      render: (r) => <Typography variant="body2">{String(r.roleTypeDescription ?? r.roleTypeId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterRole, setFilterRole) },
    { key: 'fromDate', label: 'Ngày hiệu lực', width: 130,
      render: (r) => <Typography variant="body2">{fmtDate(r.fromDate as string)}</Typography> },
    { key: 'thruDate', label: 'Ngày hết hạn', width: 130,
      render: (r) => <Typography variant="body2">{fmtDate(r.thruDate as string)}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Kho hàng', path: '/logistics/facilities' }, { label: 'Vai trò' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => `${r.facilityId}-${r.partyId}-${r.roleTypeId}-${r.fromDate}`}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có vai trò" filtersVisible={filtersVisible} columnStorageKey="log-facility-roles" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm vai trò kho hàng</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Autocomplete size="small"
            options={facilityOpts?.facilityList ?? []}
            getOptionLabel={(o) => `${o.facilityId} - ${o.facilityName ?? ''}`}
            value={selectedFacility}
            onChange={(_, v) => setSelectedFacility(v)}
            renderInput={(params) => <TextField {...params} label={reqLabel('Kho hàng')} />}
            isOptionEqualToValue={(o, v) => o.facilityId === v.facilityId}
          />
          <Autocomplete size="small"
            options={partyOpts}
            getOptionLabel={(o) => `${o.partyId} - ${o.fullName ?? o.groupName ?? ''}`}
            value={selectedParty}
            onChange={(_, v) => setSelectedParty(v)}
            onInputChange={(_, v) => setPartySearch(v)}
            renderInput={(params) => <TextField {...params} label={reqLabel('Tổ chức/Cá nhân')} placeholder="Nhập ít nhất 2 ký tự..." />}
            isOptionEqualToValue={(o, v) => o.partyId === v.partyId}
            filterOptions={(x) => x}
            noOptionsText={partySearch.length < 2 ? 'Nhập ít nhất 2 ký tự' : 'Không tìm thấy'}
          />
          <Autocomplete size="small"
            options={roleOpts ?? []}
            getOptionLabel={(o) => `${o.roleTypeId} - ${o.description ?? ''}`}
            value={selectedRole}
            onChange={(_, v) => setSelectedRole(v)}
            renderInput={(params) => <TextField {...params} label={reqLabel('Vai trò')} />}
            isOptionEqualToValue={(o, v) => o.roleTypeId === v.roleTypeId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!selectedFacility || !selectedParty || !selectedRole || createRoleMut.isPending}
            onClick={() => createRoleMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
