import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { apiClient } from '../../../api/client';

interface ConfigPackingItem {
  productId: string;
  productCode?: string;
  productName?: string;
  uomFromId?: string;
  uomFromDescription?: string;
  uomToId?: string;
  uomToDescription?: string;
  quantityConvert?: number;
}

interface ConfigFilters {
  productCode?: string;
  productName?: string;
}

export const POConfigPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterProductCode, setFilterProductCode] = useState('');
  const [filterProductName, setFilterProductName] = useState('');

  const [debouncedFilters, setDebouncedFilters] = useState<ConfigFilters>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        productCode: filterProductCode || undefined,
        productName: filterProductName || undefined,
      });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterProductCode, filterProductName]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['config-packing', page, pageSize, debouncedFilters],
    queryFn: async () => {
      const res = await apiClient.post('/services/listConfigPackingREST', {
        pageIndex: String(page), pageSize: String(pageSize),
        productCode: debouncedFilters.productCode || '',
        productName: debouncedFilters.productName || '',
      });
      const d = res.data?.data ?? {};
      return { configList: (d.configList ?? []) as ConfigPackingItem[], totalRows: Number(d.totalRows ?? 0) };
    },
    placeholderData: (prev: { configList: ConfigPackingItem[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.configList ?? [];
  const total = data?.totalRows ?? 0;
  const hasActiveFilters = !!(filterProductCode || filterProductName);

  const handleClearFilters = () => { setFilterProductCode(''); setFilterProductName(''); setPage(0); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
      value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<ConfigPackingItem>[] = [
    {
      key: 'productCode', label: 'Mã SP', width: 120,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.productCode ?? row.productId}</Typography>,
      filterRender: makeTextFilter(filterProductCode, setFilterProductCode),
    },
    {
      key: 'productName', label: 'Tên SP', width: 250,
      render: (row) => <Typography variant="body2" noWrap>{row.productName ?? '—'}</Typography>,
      filterRender: makeTextFilter(filterProductName, setFilterProductName),
    },
    {
      key: 'uomFromId', label: 'ĐVT từ', width: 120,
      render: (row) => <Typography variant="body2">{row.uomFromDescription ?? row.uomFromId ?? '—'}</Typography>,
    },
    {
      key: 'uomToId', label: 'ĐVT đến', width: 120,
      render: (row) => <Typography variant="body2">{row.uomToDescription ?? row.uomToId ?? '—'}</Typography>,
    },
    {
      key: 'quantityConvert', label: 'Số lượng quy đổi', width: 150, align: 'right' as const,
      render: (row) => <Typography variant="body2">{row.quantityConvert ?? '—'}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Cấu hình' }, { label: 'Quy đổi đơn vị đóng gói' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        rows={items}
        rowKey={(row) => `${row.productId}-${row.uomFromId}-${row.uomToId}`}
        loading={isLoading || isFetching}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        emptyMessage="Không có cấu hình đóng gói"
        filtersVisible={filtersVisible}
        columnStorageKey="config-packing"
      />
    </Box>
  );
};
