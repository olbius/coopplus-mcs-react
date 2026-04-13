import { type FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Link, TextField, IconButton, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Grid, Autocomplete,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import {
  Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon,
  Add as AddIcon, OpenInNew as OpenNewTabIcon, Visibility as ViewIcon, Edit as EditIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useSuppliers } from '../hooks/useSuppliers';
import { useToast } from '../../../contexts/ToastContext';
import type { SupplierItem, SupplierFilters } from '../../../api/supplier.api';

export const SupplierListPage: FC = () => {
  const navigate = useNavigate();
  const { showInfo, showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filters
  const [filterPartyId, setFilterPartyId] = useState('');
  const [filterGroupName, setFilterGroupName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterAddress, setFilterAddress] = useState('');

  // Debounce
  const [debouncedFilters, setDebouncedFilters] = useState<SupplierFilters>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        partyId: filterPartyId || undefined,
        groupName: filterGroupName || undefined,
        email: filterEmail || undefined,
        phone: filterPhone || undefined,
        address: filterAddress || undefined,
      });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterPartyId, filterGroupName, filterEmail, filterPhone, filterAddress]);

  // Add supplier dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    supplierId: '', supplierName: '', taxCode: '', currencyUomId: 'VND',
    email: '', phone: '', address: '',
  });

  // Currency UOMs for dropdown
  const { data: lookups } = useQuery({
    queryKey: ['supplier-form-lookups'],
    queryFn: async () => {
      const res = await apiClient.post('/services/getProductFormLookups', { _dummy: '1' });
      return res.data?.data ?? {};
    },
    enabled: addOpen,
  });
  const currencyUoms: { uomId: string; description: string }[] = lookups?.currencyUoms ?? [];

  const createSupplierMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/services/createPartySupplierQuick', {
        partyCode: newSupplier.supplierId || undefined,
        groupName: newSupplier.supplierName,
        preferredCurrencyUomId: newSupplier.currencyUomId,
        emailAddress: newSupplier.email || undefined,
        contactNumber: newSupplier.phone || undefined,
        address1: newSupplier.address || undefined,
      });
    },
    onSuccess: () => {
      showSuccess('Tạo nhà cung cấp thành công');
      setAddOpen(false);
      setNewSupplier({ supplierId: '', supplierName: '', taxCode: '', currencyUomId: 'VND', email: '', phone: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['suppliers-list'] });
    },
    onError: (err: Error) => showError(err.message || 'Lỗi tạo nhà cung cấp'),
  });

  const { data, isLoading, isFetching, refetch } = useSuppliers(page, pageSize, debouncedFilters);
  const suppliers = data?.supplierList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; supplier: SupplierItem } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, supplier: SupplierItem) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, supplier });
  }, []);

  const hasActiveFilters = !!(filterPartyId || filterGroupName || filterEmail || filterPhone || filterAddress);

  const handleClearFilters = () => {
    setFilterPartyId(''); setFilterGroupName(''); setFilterEmail('');
    setFilterPhone(''); setFilterAddress('');
    setPage(0);
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
      value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<SupplierItem>[] = [
    {
      key: 'partyId', label: 'Mã NCC', width: 150,
      render: (row) => (
        <Link component="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}
          onClick={() => navigate(`/po/suppliers/${row.partyId}`)}
          onContextMenu={(e) => handleContextMenu(e, row)}>
          {row.partyId}
        </Link>
      ),
      filterRender: makeTextFilter(filterPartyId, setFilterPartyId),
    },
    {
      key: 'groupName', label: 'Tên nhà cung cấp', width: 250,
      render: (row) => (
        <Typography variant="body2" noWrap title={row.groupName} onContextMenu={(e) => handleContextMenu(e, row)}>
          {row.groupName ?? '—'}
        </Typography>
      ),
      filterRender: makeTextFilter(filterGroupName, setFilterGroupName),
    },
    {
      key: 'address', label: 'Địa chỉ', width: 250,
      render: (row) => <Typography variant="body2" noWrap title={row.address}>{row.address ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterAddress, setFilterAddress),
    },
    {
      key: 'email', label: 'Email', width: 200,
      render: (row) => <Typography variant="body2">{row.email ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterEmail, setFilterEmail),
    },
    {
      key: 'phone', label: 'Số điện thoại', width: 150,
      render: (row) => <Typography variant="body2">{row.phone ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterPhone, setFilterPhone),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Nhà cung cấp' }, { label: 'Danh sách NCC' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm NCC">
              <IconButton size="small" color="primary" onClick={() => setAddOpen(true)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Xóa tất cả bộ lọc">
                <IconButton size="small" onClick={handleClearFilters}>
                  <FilterOffIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}>
              <IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}>
                <FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới">
              <IconButton size="small" onClick={() => refetch()} disabled={isFetching}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <DataTable
        columns={columns}
        rows={suppliers}
        rowKey={(row) => row.partyId}
        loading={isLoading || isFetching}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        emptyMessage="Không tìm thấy nhà cung cấp"
        filtersVisible={filtersVisible}
        onRowClick={(row) => navigate(`/po/suppliers/${row.partyId}`)}
        columnStorageKey="po-suppliers"
      />

      <Menu open={contextMenu !== null} onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
        <MenuItem onClick={() => { window.open(`/po/suppliers/${contextMenu?.supplier.partyId}`, '_blank'); setContextMenu(null); }}>
          <ListItemIcon><OpenNewTabIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết (tab mới)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/po/suppliers/${contextMenu?.supplier.partyId}`); setContextMenu(null); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { showInfo('Chỉnh sửa NCC đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { refetch(); setContextMenu(null); }}>
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Làm mới</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Supplier Dialog — matches old addSupplier.ftl 2-column layout */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm nhà cung cấp</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Left column */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Mã NCC</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth value={newSupplier.supplierId}
                    onChange={(e) => setNewSupplier(s => ({ ...s, supplierId: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))} />
                </Grid>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Mã số thuế</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth value={newSupplier.taxCode}
                    onChange={(e) => setNewSupplier(s => ({ ...s, taxCode: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Tiền tệ <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <Autocomplete size="small" options={currencyUoms}
                    getOptionLabel={(o) => `${o.uomId} - ${o.description ?? ''}`}
                    value={currencyUoms.find(u => u.uomId === newSupplier.currencyUomId) || null}
                    onChange={(_, val) => setNewSupplier(s => ({ ...s, currencyUomId: val?.uomId ?? 'VND' }))}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn tiền tệ" />} />
                </Grid>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Email</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth type="email" value={newSupplier.email}
                    onChange={(e) => setNewSupplier(s => ({ ...s, email: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
            {/* Right column */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Tên NCC <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth value={newSupplier.supplierName}
                    onChange={(e) => setNewSupplier(s => ({ ...s, supplierName: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>&nbsp;</Typography></Grid>
                <Grid size={{ xs: 8 }} />
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Địa chỉ <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth value={newSupplier.address}
                    onChange={(e) => setNewSupplier(s => ({ ...s, address: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" sx={{ mt: 1 }}>Số điện thoại</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth value={newSupplier.phone}
                    onChange={(e) => setNewSupplier(s => ({ ...s, phone: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => createSupplierMutation.mutate()}
            disabled={!newSupplier.supplierName || !newSupplier.address || createSupplierMutation.isPending}>
            {createSupplierMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
