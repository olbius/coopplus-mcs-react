import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { accountingApi } from '../../../api/accounting.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

export const WorkShiftListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const [filterStateId, setFilterStateId] = useState('');
  const [filterTerminalId, setFilterTerminalId] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterOpenedFrom, setFilterOpenedFrom] = useState('');
  const [filterOpenedThru, setFilterOpenedThru] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['acc-workshift', page, pageSize],
    queryFn: () => accountingApi.listWorkShift(page, pageSize),
    placeholderData: (prev: { shiftList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const allItems = data?.shiftList ?? [];
  const [items, setItems] = useState(allItems);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setItems(allItems.filter(r => {
      if (filterStateId && !lc(String(r.posTerminalStateId ?? '')).includes(lc(filterStateId))) return false;
      if (filterTerminalId && !lc(String(r.posTerminalId ?? '')).includes(lc(filterTerminalId))) return false;
      if (filterEmployee && !lc(String(r.openedByUserLoginId ?? '')).includes(lc(filterEmployee))) return false;
      if (filterOpenedFrom) {
        const d = r.openedDate ? new Date(r.openedDate as string) : null;
        if (!d || d < new Date(filterOpenedFrom)) return false;
      }
      if (filterOpenedThru) {
        const d = r.openedDate ? new Date(r.openedDate as string) : null;
        const thru = new Date(filterOpenedThru); thru.setDate(thru.getDate() + 1);
        if (!d || d > thru) return false;
      }
      return true;
    }));
  }, [allItems, filterStateId, filterTerminalId, filterEmployee, filterOpenedFrom, filterOpenedThru]);
  const total = Number(data?.totalRows ?? 0);

  const hasActiveFilters = !!(filterStateId || filterTerminalId || filterEmployee || filterOpenedFrom || filterOpenedThru);
  const handleClearFilters = () => { setFilterStateId(''); setFilterTerminalId(''); setFilterEmployee(''); setFilterOpenedFrom(''); setFilterOpenedThru(''); };

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'posTerminalStateId', label: 'Mã ca', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.posTerminalStateId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterStateId, setFilterStateId) },
    { key: 'openedDate', label: 'Giờ mở', width: 180,
      render: (r) => <Typography variant="body2">{fmtDate(r.openedDate as string)}</Typography>,
      filterRender: () => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <TextField size="small" type="date" variant="standard" value={filterOpenedFrom}
            onChange={(e) => setFilterOpenedFrom(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } } }} sx={{ flex: 1 }} />
          <TextField size="small" type="date" variant="standard" value={filterOpenedThru}
            onChange={(e) => setFilterOpenedThru(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } } }} sx={{ flex: 1 }} />
        </Box>
      ) },
    { key: 'closedDate', label: 'Giờ đóng', width: 180,
      render: (r) => <Typography variant="body2">{fmtDate(r.closedDate as string)}</Typography> },
    { key: 'posTerminalId', label: 'Terminal', width: 100,
      render: (r) => <Typography variant="body2">{String(r.posTerminalId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterTerminalId, setFilterTerminalId) },
    { key: 'openedByUserLoginId', label: 'Nhân viên', width: 120,
      render: (r) => <Typography variant="body2">{String(r.openedByUserLoginId ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterEmployee, setFilterEmployee) },
    { key: 'startingTxId', label: 'GD bắt đầu', width: 130,
      render: (r) => <Typography variant="body2">{String(r.startingTxId ?? '—')}</Typography> },
    { key: 'endingTxId', label: 'GD kết thúc', width: 130,
      render: (r) => <Typography variant="body2">{String(r.endingTxId ?? '—')}</Typography> },
    { key: 'startingDrawerAmount', label: 'Tiền đầu ca', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.startingDrawerAmount as number)}</Typography> },
    { key: 'actualEndingCash', label: 'Tiền thực nhận', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.actualEndingCash as number)}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Kế toán' }, { label: 'Thu' }, { label: 'Thu tiền nhân viên' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.posTerminalStateId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có ca làm việc" filtersVisible={filtersVisible} columnStorageKey="acc-workshift" />
    </Box>
  );
};
