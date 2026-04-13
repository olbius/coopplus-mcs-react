import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, IconButton, Tooltip, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Autocomplete,
} from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient } from '../../../api/client';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useSupplierProducts, type SupplierProductFilters } from '../hooks/useSuppliers';
import type { SupplierProduct } from '../../../api/supplier.api';

const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
};

interface LookupItem { [key: string]: string }

export const SupplierProductListPage: FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filters
  const [filterProductCode, setFilterProductCode] = useState('');
  const [filterProductName, setFilterProductName] = useState('');
  const [filterGroupName, setFilterGroupName] = useState('');
  const [filterSupplierProductId, setFilterSupplierProductId] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState<SupplierProductFilters>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        productCode: filterProductCode || undefined,
        productName: filterProductName || undefined,
        groupName: filterGroupName || undefined,
        supplierProductId: filterSupplierProductId || undefined,
      });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterProductCode, filterProductName, filterGroupName, filterSupplierProductId]);

  const { data, isLoading, isFetching, refetch } = useSupplierProducts(page, pageSize, debouncedFilters);
  const products = data?.supplierProductList ?? [];
  const total = Number(data?.totalRows ?? 0);

  // Add supplier product dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newSP, setNewSP] = useState({
    partyId: '', currencyUomId: 'VND', productId: '', lastPrice: '',
    minimumOrderQuantity: '1', supplierProductId: '',
    availableFromDate: '', availableThruDate: '', shippingPrice: '', canDropShip: 'N',
  });

  const { data: lookups } = useQuery({
    queryKey: ['supplier-product-form-lookups'],
    queryFn: async () => {
      const [suppRes, lookupRes] = await Promise.all([
        apiClient.post('/services/listSuppliers', { keyword: '' }),
        apiClient.post('/services/getProductFormLookups', { _dummy: '1' }),
      ]);
      return {
        suppliers: suppRes.data?.data?.supplierList ?? [],
        currencyUoms: lookupRes.data?.data?.currencyUoms ?? [],
      };
    },
    enabled: addOpen,
  });

  const supplierProductsForSupplier = useQuery({
    queryKey: ['supplier-products-for-add', newSP.partyId],
    queryFn: async () => {
      const res = await apiClient.post('/services/getProductsBySupplierREST', { supplierId: newSP.partyId, keyword: '' });
      return res.data?.data?.productList ?? [];
    },
    enabled: !!newSP.partyId && addOpen,
  });

  const createSPMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/services/addNewSupplierForProductId', {
        partyId: newSP.partyId,
        productId: newSP.productId,
        currencyUomId: newSP.currencyUomId,
        lastPrice: newSP.lastPrice ? Number(newSP.lastPrice) : 0,
        minimumOrderQuantity: newSP.minimumOrderQuantity ? Number(newSP.minimumOrderQuantity) : 1,
        supplierProductId: newSP.supplierProductId || undefined,
        availableFromDate: newSP.availableFromDate ? new Date(newSP.availableFromDate).getTime() : Date.now(),
        availableThruDate: newSP.availableThruDate ? new Date(newSP.availableThruDate).getTime() : undefined,
        shippingPrice: newSP.shippingPrice ? Number(newSP.shippingPrice) : undefined,
        canDropShip: newSP.canDropShip,
      });
    },
    onSuccess: () => {
      showSuccess('Thêm sản phẩm NCC thành công');
      setAddOpen(false);
      setNewSP({ partyId: '', currencyUomId: 'VND', productId: '', lastPrice: '', minimumOrderQuantity: '1', supplierProductId: '', availableFromDate: '', availableThruDate: '', shippingPrice: '', canDropShip: 'N' });
      queryClient.invalidateQueries({ queryKey: ['supplier-products-all'] });
    },
    onError: (err: Error) => showError(err.message || 'Lỗi thêm sản phẩm NCC'),
  });

  const suppliers: LookupItem[] = lookups?.suppliers ?? [];
  const currencyUoms: LookupItem[] = lookups?.currencyUoms ?? [];
  const availableProducts: LookupItem[] = supplierProductsForSupplier.data ?? [];

  const hasActiveFilters = !!(filterProductCode || filterProductName || filterGroupName || filterSupplierProductId);

  const handleClearFilters = () => {
    setFilterProductCode(''); setFilterProductName('');
    setFilterGroupName(''); setFilterSupplierProductId('');
    setPage(0);
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
      value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<SupplierProduct>[] = [
    {
      key: 'productCode', label: 'Mã SP', width: 120,
      render: (row) => (
        <Link component="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}
          onClick={() => navigate(`/po/products/${row.productId}`)}>
          {row.productCode ?? row.productId}
        </Link>
      ),
      filterRender: makeTextFilter(filterProductCode, setFilterProductCode),
    },
    {
      key: 'productName', label: 'Tên SP', width: 200,
      render: (row) => <Typography variant="body2" noWrap>{row.productName ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterProductName, setFilterProductName),
    },
    {
      key: 'groupName', label: 'Nhà cung cấp', width: 200,
      render: (row) => (
        <Link component="button" variant="body2" sx={{ textAlign: 'left' }}
          onClick={() => navigate(`/po/suppliers/${row.partyId}`)}>
          {row.groupName ?? row.partyId}
        </Link>
      ),
      filterRender: makeTextFilter(filterGroupName, setFilterGroupName),
    },
    {
      key: 'minimumOrderQuantity', label: 'MOQ', width: 80, align: 'right' as const,
      render: (row) => <Typography variant="body2">{row.minimumOrderQuantity ?? '—'}</Typography>,
    },
    {
      key: 'lastPrice', label: 'Giá mua', width: 120, align: 'right' as const,
      render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatCurrency(row.lastPrice, row.currencyUomId)}</Typography>,
    },
    {
      key: 'currencyUomId', label: 'Tiền tệ', width: 80,
      render: (row) => <Typography variant="body2">{row.currencyUomId ?? '—'}</Typography>,
    },
    {
      key: 'supplierProductId', label: 'Mã NCC-SP', width: 150,
      render: (row) => <Typography variant="body2">{row.supplierProductId ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterSupplierProductId, setFilterSupplierProductId),
    },
    {
      key: 'availableFromDate', label: 'Ngày BĐ', width: 100,
      render: (row) => <Typography variant="body2">{formatDate(row.availableFromDate)}</Typography>,
    },
    {
      key: 'availableThruDate', label: 'Ngày KT', width: 100,
      render: (row) => <Typography variant="body2">{formatDate(row.availableThruDate)}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Nhà cung cấp' }, { label: 'Sản phẩm của NCC' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm sản phẩm NCC">
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
        rows={products}
        rowKey={(row) => `${row.partyId}-${row.productId}`}
        loading={isLoading || isFetching}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        emptyMessage="Không tìm thấy sản phẩm NCC"
        filtersVisible={filtersVisible}
        columnStorageKey="supplier-products"
      />

      {/* Add Supplier Product Dialog — matches old productSupplierNewProductSupplierPopup.ftl */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm sản phẩm nhà cung cấp</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Row 1: Supplier | Currency */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Nhà cung cấp <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <Autocomplete size="small" options={suppliers}
                    getOptionLabel={(o) => o.groupName ?? o.partyId ?? ''}
                    onChange={(_, val) => setNewSP(s => ({ ...s, partyId: val?.partyId ?? '', productId: '' }))}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn NCC" />} />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Tiền tệ <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <Autocomplete size="small" options={currencyUoms}
                    getOptionLabel={(o) => `${o.uomId} - ${o.description ?? ''}`}
                    value={currencyUoms.find((u: LookupItem) => u.uomId === newSP.currencyUomId) || null}
                    onChange={(_, val) => setNewSP(s => ({ ...s, currencyUomId: val?.uomId ?? 'VND' }))}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn tiền tệ" />} />
                </Grid>
              </Grid>
            </Grid>
            {/* Row 2: Product | Last Price */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Sản phẩm <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <Autocomplete size="small" options={availableProducts}
                    getOptionLabel={(o) => `[${o.productId}] ${o.productName ?? ''}`}
                    onChange={(_, val) => setNewSP(s => ({ ...s, productId: val?.productId ?? '', lastPrice: val?.lastPrice ? String(val.lastPrice) : s.lastPrice }))}
                    loading={supplierProductsForSupplier.isLoading}
                    disabled={!newSP.partyId}
                    renderInput={(params) => <TextField {...params} placeholder={newSP.partyId ? 'Chọn SP' : 'Chọn NCC trước'} />} />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Giá mua <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth type="number" value={newSP.lastPrice}
                    onChange={(e) => setNewSP(s => ({ ...s, lastPrice: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
            {/* Row 3: MOQ | Supplier Product ID */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">MOQ <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth type="number" value={newSP.minimumOrderQuantity}
                    onChange={(e) => setNewSP(s => ({ ...s, minimumOrderQuantity: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Mã NCC-SP</Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth value={newSP.supplierProductId}
                    onChange={(e) => setNewSP(s => ({ ...s, supplierProductId: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
            {/* Row 4: Available From | Available Thru */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Ngày bắt đầu <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth type="date" value={newSP.availableFromDate}
                    onChange={(e) => setNewSP(s => ({ ...s, availableFromDate: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Ngày kết thúc</Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth type="date" value={newSP.availableThruDate}
                    onChange={(e) => setNewSP(s => ({ ...s, availableThruDate: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
              </Grid>
            </Grid>
            {/* Row 5: Shipping Price | Can Drop Ship */}
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Phí vận chuyển</Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <TextField size="small" fullWidth type="number" value={newSP.shippingPrice}
                    onChange={(e) => setNewSP(s => ({ ...s, shippingPrice: e.target.value }))} />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 5 }}><Typography variant="body2" textAlign="right">Drop Ship</Typography></Grid>
                <Grid size={{ xs: 7 }}>
                  <Autocomplete size="small"
                    options={[{ id: 'Y', label: 'Có' }, { id: 'N', label: 'Không' }]}
                    getOptionLabel={(o) => o.label}
                    value={newSP.canDropShip === 'Y' ? { id: 'Y', label: 'Có' } : { id: 'N', label: 'Không' }}
                    onChange={(_, val) => setNewSP(s => ({ ...s, canDropShip: val?.id ?? 'N' }))}
                    disableClearable
                    renderInput={(params) => <TextField {...params} />} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" color="success"
            onClick={() => { createSPMutation.mutate(); /* keep dialog open for continue */ }}
            disabled={!newSP.partyId || !newSP.productId || !newSP.lastPrice || !newSP.availableFromDate || createSPMutation.isPending}>
            Lưu & Tiếp tục
          </Button>
          <Button variant="contained"
            onClick={() => createSPMutation.mutate()}
            disabled={!newSP.partyId || !newSP.productId || !newSP.lastPrice || !newSP.availableFromDate || createSPMutation.isPending}>
            {createSPMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
