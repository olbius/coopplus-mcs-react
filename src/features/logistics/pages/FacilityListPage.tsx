import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { logisticsApi } from '../../../api/logistics.api';
import { actionsApi } from '../../../api/actions.api';

export const FacilityListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterFacilityId, setFilterFacilityId] = useState('');
  const [filterFacilityName, setFilterFacilityName] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ facilityId: '', facilityName: '' });
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilters({ facilityId: filterFacilityId, facilityName: filterFacilityName }); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterFacilityId, filterFacilityName]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['logistics-facilities', page, pageSize, debouncedFilters],
    queryFn: () => logisticsApi.listFacilities(page, pageSize, debouncedFilters),
    placeholderData: (prev: { facilityList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.facilityList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterFacilityId || filterFacilityName);
  const handleClearFilters = () => { setFilterFacilityId(''); setFilterFacilityName(''); };

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const handleAddOpen = () => { setNewId(''); setNewName(''); setNewAddress(''); setNewPhone(''); setAddOpen(true); };
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => actionsApi.createFacility({ facilityId: newId, facilityName: newName }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['logistics-facilities'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'facilityId', label: 'Mã kho', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.facilityId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterFacilityId, setFilterFacilityId) },
    { key: 'facilityName', label: 'Tên kho', width: 220,
      render: (r) => <Typography variant="body2">{String(r.facilityName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFacilityName, setFilterFacilityName) },
    { key: 'ownerName', label: 'Chủ sở hữu', width: 200,
      render: (r) => <Typography variant="body2">{String(r.ownerName ?? r.ownerPartyId ?? '—')}</Typography> },
    { key: 'squareFootage', label: 'Diện tích', width: 120, align: 'right',
      render: (r) => <Typography variant="body2">{r.squareFootage != null
        ? `${Number(r.squareFootage).toLocaleString('vi-VN')} ${r.facilitySizeUomId === 'AREA_m2' ? 'm²' : String(r.facilitySizeUomId ?? '')}`
        : '—'}</Typography> },
    { key: 'parentFacilityName', label: 'Trực thuộc', width: 180,
      render: (r) => <Typography variant="body2">{String(r.parentFacilityName ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 200,
      render: (r) => <Typography variant="body2" noWrap>{String(r.description ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Kho hàng' }, { label: 'Danh sách' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.facilityId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có kho hàng" filtersVisible={filtersVisible} columnStorageKey="log-facilities" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm kho hàng mới</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField size="small" label={reqLabel('Mã kho')} value={newId}
              onChange={(e) => setNewId(e.target.value)} required slotProps={{ htmlInput: { maxLength: 20 } }} />
            <TextField size="small" label={reqLabel('Tên kho')} value={newName}
              onChange={(e) => setNewName(e.target.value)} required slotProps={{ htmlInput: { maxLength: 100 } }} />
            <TextField size="small" label={reqLabel('Số điện thoại')} value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)} required />
            <TextField size="small" label={reqLabel('Địa chỉ')} value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)} required multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newId.trim() || !newName.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
