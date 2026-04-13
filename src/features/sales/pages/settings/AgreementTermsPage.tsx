import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

export const AgreementTermsPage: FC = () => {
  const { data: terms = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['agreement-terms'],
    queryFn: () => salesApi.listAgreementTerms(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterId, setFilterId] = useState('');
  const [filterDesc, setFilterDesc] = useState('');

  const [filtered, setFiltered] = useState(terms);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(terms.filter(r => {
      if (filterId && !lc(String(r.termTypeId ?? '')).includes(lc(filterId))) return false;
      if (filterDesc && !lc(String(r.description ?? '')).includes(lc(filterDesc))) return false;
      return true;
    }));
  }, [terms, filterId, filterDesc]);

  const hasActiveFilters = !!(filterId || filterDesc);
  const handleClearFilters = () => { setFilterId(''); setFilterDesc(''); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'idx', label: 'STT', width: 60,
      render: (_r, idx) => <Typography variant="body2">{(idx ?? 0) + 1}</Typography> },
    { key: 'termTypeId', label: 'Mã điều khoản', width: 220,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.termTypeId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterId, setFilterId) },
    { key: 'description', label: 'Mô tả', width: 400,
      render: (r) => <Typography variant="body2">{String(r.description ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterDesc, setFilterDesc) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Điều khoản hợp đồng' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.termTypeId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có điều khoản" filtersVisible={filtersVisible}
        columnStorageKey="settings-agreement-terms" />
    </Box>
  );
};
