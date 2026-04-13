import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';

interface CustomerListPageProps {
  type: 'family' | 'business' | 'school' | 'loyalty';
}

const TITLES: Record<string, string> = {
  family: 'DSKH hộ gia đình',
  business: 'DSKH doanh nghiệp',
  school: 'DSKH trường học',
  loyalty: 'DS khách hàng loyalty',
};

const API_MAP = {
  family: salesApi.listCustomersFamily,
  business: salesApi.listCustomersBusinesses,
  school: salesApi.listCustomersSchool,
  loyalty: salesApi.listLoyaltyCustomers,
};

export const CustomerListPage: FC<CustomerListPageProps> = ({ type }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedKeyword(keyword); setPage(0); }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const apiFn = API_MAP[type];
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customers', type, page, pageSize, debouncedKeyword],
    queryFn: () => apiFn(page, pageSize, debouncedKeyword),
    placeholderData: (prev: { customerList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const customers = data?.customerList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'partyId', label: 'Mã KH', width: 120,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(row.partyId ?? row.partyCode ?? '')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
          value={keyword} onChange={(e) => setKeyword(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    { key: 'customerName', label: 'Tên khách hàng', width: 250,
      render: (row) => <Typography variant="body2" noWrap>{String(row.customerName ?? row.groupName ?? row.firstName ?? '—')}</Typography>,
    },
    { key: 'phone', label: 'Số điện thoại', width: 150,
      render: (row) => <Typography variant="body2">{String(row.phone ?? row.contactNumber ?? '—')}</Typography>,
    },
    { key: 'email', label: 'Email', width: 200,
      render: (row) => <Typography variant="body2">{String(row.email ?? row.infoString ?? '—')}</Typography>,
    },
    { key: 'address', label: 'Địa chỉ', width: 250,
      render: (row) => <Typography variant="body2" noWrap>{String(row.address ?? row.address1 ?? '—')}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Khách hàng' }, { label: TITLES[type] }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {keyword && (<Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={() => { setKeyword(''); setPage(0); }}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>)}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={keyword || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={customers} rowKey={(r) => String(r.partyId ?? r.partyCode ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không tìm thấy khách hàng" filtersVisible={filtersVisible}
        columnStorageKey={`customers-${type}`} />
    </Box>
  );
};
