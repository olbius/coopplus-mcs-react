import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Chip, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Button } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN'); };

const WALLET_STATUS: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  POSWALLET_ACCEPTED: { label: 'Hoạt động', color: 'success' },
  POSWALLET_CREATED: { label: 'Tạo mới', color: 'default' },
  POSWALLET_CANCELLED: { label: 'Đã hủy', color: 'error' },
  POSWALLET_HOLD: { label: 'Tạm giữ', color: 'warning' },
};

const STATUS_OPTIONS = [{ value: '', label: 'Tất cả' }, ...Object.entries(WALLET_STATUS).map(([k, v]) => ({ value: k, label: v.label }))];

export const PosWalletListPage: FC = () => {
  const { data: wallets = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['pos-wallets'],
    queryFn: () => salesApi.listPosWallets(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterWalletId, setFilterWalletId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [filtered, setFiltered] = useState(wallets);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(wallets.filter(r => {
      if (filterWalletId && !lc(String(r.walletId ?? '')).includes(lc(filterWalletId))) return false;
      if (filterName && !lc(String(r.walletName ?? '')).includes(lc(filterName))) return false;
      if (filterStatus && String(r.statusId) !== filterStatus) return false;
      return true;
    }));
  }, [wallets, filterWalletId, filterName, filterStatus]);

  const hasActiveFilters = !!(filterWalletId || filterName || filterStatus);
  const handleClearFilters = () => { setFilterWalletId(''); setFilterName(''); setFilterStatus(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newWalletId, setNewWalletId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('VND');
  const [newStoreId, setNewStoreId] = useState('');
  const handleAddOpen = () => { setNewWalletId(''); setNewName(''); setNewCurrency('VND'); setNewStoreId(''); setAddOpen(true); };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createPosWallet({ walletId: newWalletId || undefined, walletName: newName || undefined, currencyUomId: newCurrency || undefined }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['pos-wallets'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'walletId', label: 'Mã ví', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.walletId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterWalletId, setFilterWalletId) },
    { key: 'walletName', label: 'Tên ví', width: 200,
      render: (r) => <Typography variant="body2">{String(r.walletName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterName, setFilterName) },
    { key: 'statusId', label: 'Trạng thái', width: 120,
      render: (r) => {
        const s = WALLET_STATUS[String(r.statusId)] ?? { label: String(r.statusId ?? '—'), color: 'default' as const };
        return <Chip size="small" label={s.label} color={s.color} />;
      },
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {STATUS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ),
    },
    { key: 'frozenBalance', label: 'Số dư đóng băng', width: 150, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.frozenBalance as number)}</Typography> },
    { key: 'availableBalance', label: 'Số dư khả dụng', width: 150, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.availableBalance as number)}</Typography> },
    { key: 'totalBalance', label: 'Tổng số dư', width: 150, align: 'right',
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{
        fmtCurrency((Number(r.frozenBalance) || 0) + (Number(r.availableBalance) || 0))
      }</Typography> },
    { key: 'currencyUomId', label: 'Tiền tệ', width: 80,
      render: (r) => <Typography variant="body2">{String(r.currencyUomId ?? '—')}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Danh sách ví POS' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.walletId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có ví POS" filtersVisible={filtersVisible}
        columnStorageKey="settings-wallets" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm ví POS</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={<>Cửa hàng <span style={{ color: 'red' }}>*</span></>}
            value={newStoreId} onChange={(e) => setNewStoreId(e.target.value)} required
            placeholder="Mã cửa hàng" />
          <TextField size="small" label="Tiền tệ" value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)} />
          <TextField size="small" label="Tên ví" value={newName}
            onChange={(e) => setNewName(e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
          <TextField size="small" label="Mã ví" value={newWalletId}
            onChange={(e) => setNewWalletId(e.target.value)} slotProps={{ htmlInput: { maxLength: 20 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newStoreId.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
