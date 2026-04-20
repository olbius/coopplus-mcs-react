import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const ProductFeaturePage: FC = () => {
  const { data: features = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['product-features'],
    queryFn: () => salesApi.listProductFeatures(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterId, setFilterId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDesc, setFilterDesc] = useState('');

  const [filtered, setFiltered] = useState(features);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(features.filter(r => {
      if (filterId && !lc(String(r.productFeatureId ?? '')).includes(lc(filterId))) return false;
      if (filterType && !lc(String(r.productFeatureTypeId ?? '')).includes(lc(filterType))) return false;
      if (filterDesc && !lc(String(r.description ?? '')).includes(lc(filterDesc))) return false;
      return true;
    }));
  }, [features, filterId, filterType, filterDesc]);

  const hasActiveFilters = !!(filterId || filterType || filterDesc);
  const handleClearFilters = () => { setFilterId(''); setFilterType(''); setFilterDesc(''); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'productFeatureId', label: 'Mã', width: 160,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.productFeatureId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterId, setFilterId) },
    { key: 'productFeatureTypeId', label: 'Loại', width: 140,
      render: (r) => <Typography variant="body2">{String(r.productFeatureTypeId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterType, setFilterType) },
    { key: 'productFeatureCategoryId', label: 'Danh mục', width: 160,
      render: (r) => <Typography variant="body2">{String(r.productFeatureCategoryId ?? '—')}</Typography> },
    { key: 'description', label: 'Mô tả', width: 300,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterDesc, setFilterDesc) },
    { key: 'uomId', label: 'Đơn vị', width: 80,
      render: (r) => <Typography variant="body2">{String(r.uomId ?? '—')}</Typography> },
    { key: 'defaultAmount', label: 'Giá trị mặc định', width: 120, align: 'right',
      render: (r) => <Typography variant="body2">{r.defaultAmount != null ? String(r.defaultAmount) : '—'}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Product Feature' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.productFeatureId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có đặc tính sản phẩm" filtersVisible={filtersVisible}
        columnStorageKey="settings-product-features" />
    </Box>
  );
};
