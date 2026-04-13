import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

const STATUS_MAP: Record<string, { label: string; color: 'success' | 'error' | 'default' }> = {
  PRODSTORE_ENABLED: { label: 'Hoạt động', color: 'success' },
  PRODSTORE_DISABLED: { label: 'Ngưng hoạt động', color: 'error' },
};

export const ProductStoreListPage: FC = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterStoreId, setFilterStoreId] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [filterStoreName, setFilterStoreName] = useState('');
  const [filterKaCode, setFilterKaCode] = useState('');
  const [filterPayTo, setFilterPayTo] = useState('');
  const [filterFullName, setFilterFullName] = useState('');

  const { data: stores = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['product-stores'],
    queryFn: () => salesApi.listProductStores(),
  });

  // Client-side filter (small dataset ~10 rows)
  const [filtered, setFiltered] = useState(stores);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(stores.filter(r => {
      if (filterStoreId && !lc(String(r.productStoreId ?? '')).includes(lc(filterStoreId))) return false;
      if (filterGroupId && !lc(String(r.primaryStoreGroupId ?? '')).includes(lc(filterGroupId))) return false;
      if (filterStoreName && !lc(String(r.storeName ?? '')).includes(lc(filterStoreName))) return false;
      if (filterKaCode && !lc(String(r.kaCode ?? '')).includes(lc(filterKaCode))) return false;
      if (filterPayTo && !lc(String(r.payToPartyId ?? '')).includes(lc(filterPayTo))) return false;
      if (filterFullName && !lc(String(r.fullName ?? '')).includes(lc(filterFullName))) return false;
      return true;
    }));
  }, [stores, filterStoreId, filterGroupId, filterStoreName, filterKaCode, filterPayTo, filterFullName]);

  const hasActiveFilters = !!(filterStoreId || filterGroupId || filterStoreName || filterKaCode || filterPayTo || filterFullName);
  const handleClearFilters = () => {
    setFilterStoreId(''); setFilterGroupId(''); setFilterStoreName('');
    setFilterKaCode(''); setFilterPayTo(''); setFilterFullName('');
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'productStoreId', label: 'Mã CH', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600, color: r.statusId === 'PRODSTORE_DISABLED' ? 'text.disabled' : undefined }}>{String(r.productStoreId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterStoreId, setFilterStoreId) },
    { key: 'primaryStoreGroupId', label: 'Nhóm CH', width: 120,
      render: (r) => <Typography variant="body2">{String(r.primaryStoreGroupId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterGroupId, setFilterGroupId) },
    { key: 'storeName', label: 'Tên cửa hàng', width: 250,
      render: (r) => <Typography variant="body2">{String(r.storeName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterStoreName, setFilterStoreName) },
    { key: 'kaCode', label: 'Mã KA', width: 80,
      render: (r) => <Typography variant="body2">{String(r.kaCode ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterKaCode, setFilterKaCode) },
    { key: 'cfCode', label: 'Mã CF', width: 80,
      render: (r) => <Typography variant="body2">{String(r.cfCode ?? '—')}</Typography> },
    { key: 'payToPartyId', label: 'Pay To Party', width: 100,
      render: (r) => <Typography variant="body2">{String(r.payToPartyId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterPayTo, setFilterPayTo) },
    { key: 'fullName', label: 'Tên đầy đủ', width: 160,
      render: (r) => <Typography variant="body2">{String(r.fullName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFullName, setFilterFullName) },
    { key: 'defaultCurrencyUomId', label: 'Tiền tệ', width: 80,
      render: (r) => <Typography variant="body2">{String(r.defaultCurrencyUomId ?? '—')}</Typography> },
    { key: 'hasWallet', label: 'Ví', width: 60,
      render: (r) => <Typography variant="body2">{r.hasWallet === 'Y' ? 'Có' : '—'}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 130,
      render: (r) => {
        const s = STATUS_MAP[String(r.statusId)] ?? { label: String(r.statusId ?? '—'), color: 'default' as const };
        return <Chip size="small" label={s.label} color={s.color} />;
      } },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cửa hàng' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.productStoreId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có cửa hàng" filtersVisible={filtersVisible}
        columnStorageKey="settings-stores" />
    </Box>
  );
};
