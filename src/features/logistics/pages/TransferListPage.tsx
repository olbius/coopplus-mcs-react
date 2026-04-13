import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';
import { actionsApi } from '../../../api/actions.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

export const LogTransferListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterTransferId, setFilterTransferId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState({ transferId: '', statusId: '' });
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFilters({ transferId: filterTransferId, statusId: filterStatus }); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filterTransferId, filterStatus]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['log-transfers', page, pageSize, debouncedFilters],
    queryFn: () => accountingApi.listTransfers(page, pageSize, debouncedFilters),
    placeholderData: (prev: { transferList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.transferList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterTransferId || filterStatus);
  const handleClearFilters = () => { setFilterTransferId(''); setFilterStatus(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const handleAddOpen = () => { setNewOrigin(''); setNewDest(''); setAddOpen(true); };
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => actionsApi.createTransfer({ transferTypeId: 'TRANSFER', originFacilityId: newOrigin, destFacilityId: newDest }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['log-transfers'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'transferId', label: 'Mã điều chuyển', width: 130,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.transferId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterTransferId, setFilterTransferId) },
    { key: 'transferTypeId', label: 'Loại', width: 160,
      render: (r) => <Typography variant="body2">{String(r.transferTypeId ?? '—')}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 130,
      render: (r) => <Typography variant="body2">{String(r.statusDescription ?? r.statusId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterStatus, setFilterStatus) },
    { key: 'originFacilityId', label: 'Kho nguồn', width: 150,
      render: (r) => <Typography variant="body2">{String(r.originFacilityId ?? '—')}</Typography> },
    { key: 'destFacilityId', label: 'Kho đích', width: 150,
      render: (r) => <Typography variant="body2">{String(r.destFacilityId ?? '—')}</Typography> },
    { key: 'transferDate', label: 'Ngày điều chuyển', width: 130,
      render: (r) => <Typography variant="body2">{fmtDate(r.transferDate as string)}</Typography> },
    { key: 'description', label: 'Mô tả', width: 200,
      render: (r) => <Typography variant="body2" noWrap>{String(r.description ?? '—')}</Typography> },
    { key: 'createdByUserLogin', label: 'Người tạo', width: 120,
      render: (r) => <Typography variant="body2">{String(r.createdByUserLogin ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Điều chuyển' }, { label: 'Danh sách' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.transferId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có điều chuyển" filtersVisible={filtersVisible} columnStorageKey="log-transfers" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm điều chuyển mới</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Kho nguồn')} value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)} required />
          <TextField size="small" label={reqLabel('Kho đích')} value={newDest}
            onChange={(e) => setNewDest(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newOrigin.trim() || !newDest.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
