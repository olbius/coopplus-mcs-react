import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';

export const EmployeeListPage: FC = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterPartyId, setFilterPartyId] = useState('');
  const [filterFullName, setFilterFullName] = useState('');
  const [filterLastName, setFilterLastName] = useState('');
  const [filterFirstName, setFilterFirstName] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Combine all text filters into keyword for server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword([filterPartyId, filterFullName, filterLastName, filterFirstName].filter(Boolean).join(' '));
    }, 500);
    return () => clearTimeout(timer);
  }, [filterPartyId, filterFullName, filterLastName, filterFirstName]);

  const { data: employees = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['employees', debouncedKeyword],
    queryFn: () => salesApi.listEmployees(debouncedKeyword),
  });

  const hasActiveFilters = !!(filterPartyId || filterFullName || filterLastName || filterFirstName);
  const handleClearFilters = () => { setFilterPartyId(''); setFilterFullName(''); setFilterLastName(''); setFilterFirstName(''); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'partyId', label: 'Mã NV', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.partyId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterPartyId, setFilterPartyId) },
    { key: 'fullName', label: 'Tên nhân viên', width: 300,
      render: (r) => <Typography variant="body2">{String(r.fullName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFullName, setFilterFullName) },
    { key: 'lastName', label: 'Họ', width: 150,
      render: (r) => <Typography variant="body2">{String(r.lastName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterLastName, setFilterLastName) },
    { key: 'middleName', label: 'Tên đệm', width: 150,
      render: (r) => <Typography variant="body2">{String(r.middleName ?? '—')}</Typography> },
    { key: 'firstName', label: 'Tên', width: 150,
      render: (r) => <Typography variant="body2">{String(r.firstName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterFirstName, setFilterFirstName) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Nhân viên', path: '/sales/employees' }, { label: 'Danh sách' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={employees} rowKey={(r) => String(r.partyId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không tìm thấy nhân viên" filtersVisible={filtersVisible}
        columnStorageKey="sales-employees" />
    </Box>
  );
};
