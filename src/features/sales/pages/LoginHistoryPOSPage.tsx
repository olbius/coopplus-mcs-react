import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };

export const LoginHistoryPOSPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filters
  const [filterPartyCode, setFilterPartyCode] = useState('');
  const [filterPartyName, setFilterPartyName] = useState('');
  const [filterUserLoginId, setFilterUserLoginId] = useState('');
  const [filterPosTerminalId, setFilterPosTerminalId] = useState('');
  const [filterTerminalName, setFilterTerminalName] = useState('');
  const [filterFromDateFrom, setFilterFromDateFrom] = useState('');
  const [filterFromDateThru, setFilterFromDateThru] = useState('');

  // Debounce text filters
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        partyCode: filterPartyCode, partyName: filterPartyName,
        userLoginId: filterUserLoginId, posTerminalId: filterPosTerminalId,
        terminalName: filterTerminalName,
        fromDateFrom: filterFromDateFrom, fromDateThru: filterFromDateThru,
      });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterPartyCode, filterPartyName, filterUserLoginId, filterPosTerminalId, filterTerminalName, filterFromDateFrom, filterFromDateThru]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['login-history-pos', page, pageSize, debouncedFilters],
    queryFn: () => salesApi.listHistoryLoginPOS(page, pageSize, debouncedFilters),
    placeholderData: (prev: { historyList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.historyList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterPartyCode || filterPartyName || filterUserLoginId || filterPosTerminalId || filterTerminalName || filterFromDateFrom || filterFromDateThru);
  const handleClearFilters = () => {
    setFilterPartyCode(''); setFilterPartyName(''); setFilterUserLoginId('');
    setFilterPosTerminalId(''); setFilterTerminalName('');
    setFilterFromDateFrom(''); setFilterFromDateThru('');
  };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const makeDateRangeFilter = (fromVal: string, fromSet: (v: string) => void, thruVal: string, thruSet: (v: string) => void) => () => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <TextField size="small" type="date" variant="standard" value={fromVal} onChange={(e) => fromSet(e.target.value)}
        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } }, inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
      <TextField size="small" type="date" variant="standard" value={thruVal} onChange={(e) => thruSet(e.target.value)}
        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } }, inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
    </Box>
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'partyCode', label: 'Mã NV', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.partyCode ?? '')}</Typography>,
      filterRender: makeTextFilter(filterPartyCode, setFilterPartyCode) },
    { key: 'partyName', label: 'Tên nhân viên', width: 200,
      render: (r) => <Typography variant="body2">{String(r.partyName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterPartyName, setFilterPartyName) },
    { key: 'userLoginId', label: 'Tài khoản', width: 120,
      render: (r) => <Typography variant="body2">{String(r.userLoginId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterUserLoginId, setFilterUserLoginId) },
    { key: 'posTerminalId', label: 'Terminal', width: 120,
      render: (r) => <Typography variant="body2">{String(r.posTerminalId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterPosTerminalId, setFilterPosTerminalId) },
    { key: 'terminalName', label: 'Tên Terminal', width: 200,
      render: (r) => <Typography variant="body2">{String(r.terminalName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterTerminalName, setFilterTerminalName) },
    { key: 'fromDate', label: 'Thời gian đăng nhập', width: 220,
      render: (r) => <Typography variant="body2">{fmtDate(r.fromDate as string)}</Typography>,
      filterRender: makeDateRangeFilter(filterFromDateFrom, setFilterFromDateFrom, filterFromDateThru, setFilterFromDateThru) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Nhân viên', path: '/sales/employees' }, { label: 'Lịch sử đăng nhập POS' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => `${r.userLoginId}-${r.fromDate ?? Math.random()}`}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có lịch sử đăng nhập" filtersVisible={filtersVisible} columnStorageKey="login-history-pos" />
    </Box>
  );
};
