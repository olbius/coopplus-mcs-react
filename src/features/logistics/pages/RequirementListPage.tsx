import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';
import { actionsApi } from '../../../api/actions.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

const REQ_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'EXPORT_REQUIREMENT', label: 'Xuất kho' },
  { value: 'RECEIVE_REQUIREMENT', label: 'Nhập kho' },
  { value: 'TRANSFER_REQUIREMENT', label: 'Điều chuyển' },
];

export const LogRequirementListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterId, setFilterId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['log-requirements', page, pageSize],
    queryFn: () => accountingApi.listRequirements(page, pageSize),
    placeholderData: (prev: { requirementList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const allItems = data?.requirementList ?? [];
  const [items, setItems] = useState(allItems);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setItems(allItems.filter(r => {
      if (filterId && !lc(String(r.requirementId ?? '')).includes(lc(filterId))) return false;
      if (filterType && String(r.requirementTypeId) !== filterType) return false;
      if (filterStatus && !lc(String(r.statusId ?? '')).includes(lc(filterStatus))) return false;
      return true;
    }));
  }, [allItems, filterId, filterType, filterStatus]);
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterId || filterType || filterStatus);
  const handleClearFilters = () => { setFilterId(''); setFilterType(''); setFilterStatus(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState('EXPORT_REQUIREMENT');
  const [newFacility, setNewFacility] = useState('');
  const handleAddOpen = () => { setNewType('EXPORT_REQUIREMENT'); setNewFacility(''); setAddOpen(true); };
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => actionsApi.createRequirement({ requirementTypeId: newType, listProducts: [], requiredByDate: String(Date.now()), requirementStartDate: String(Date.now()), reasonEnumId: 'NONE', originFacilityId: newFacility }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['log-requirements'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'requirementId', label: 'Mã yêu cầu', width: 130,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.requirementId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterId, setFilterId) },
    { key: 'requirementTypeId', label: 'Loại', width: 150,
      render: (r) => <Typography variant="body2">{String(r.requirementTypeDescription ?? r.requirementTypeId ?? '—')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {REQ_TYPES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ) },
    { key: 'statusId', label: 'Trạng thái', width: 130,
      render: (r) => <Typography variant="body2">{String(r.statusDescription ?? r.statusId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterStatus, setFilterStatus) },
    { key: 'facilityId', label: 'Kho', width: 100,
      render: (r) => <Typography variant="body2">{String(r.facilityId ?? '—')}</Typography> },
    { key: 'requiredByDate', label: 'Ngày cần', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.requiredByDate as string)}</Typography> },
    { key: 'estimatedBudget', label: 'Ngân sách', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.estimatedBudget as number)}</Typography> },
    { key: 'createdDate', label: 'Ngày tạo', width: 120,
      render: (r) => <Typography variant="body2">{fmtDate(r.createdDate as string)}</Typography> },
    { key: 'createdByUserLogin', label: 'Người tạo', width: 120,
      render: (r) => <Typography variant="body2">{String(r.createdByUserLogin ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Yêu cầu' }, { label: 'Danh sách' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.requirementId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có yêu cầu" filtersVisible={filtersVisible} columnStorageKey="log-requirements" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm yêu cầu mới</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Loại yêu cầu')} select value={newType}
            onChange={(e) => setNewType(e.target.value)}>
            {REQ_TYPES.filter(o => o.value).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField size="small" label={reqLabel('Kho')} value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newFacility.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
