import { type FC, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import { salesApi } from '../../../../api/sales.api';

const FONT_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Open Sans', label: 'Open Sans' },
];

export const PrintOrderPOSPage: FC = () => {
  const { data: configs = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['config-print-order'],
    queryFn: () => salesApi.listConfigPrintOrder(),
  });

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [filterStoreId, setFilterStoreId] = useState('');
  const [filterStoreName, setFilterStoreName] = useState('');
  const [filterFont, setFilterFont] = useState('');

  const [filtered, setFiltered] = useState(configs);
  useEffect(() => {
    const lc = (s: string) => s.toLowerCase();
    setFiltered(configs.filter(r => {
      if (filterStoreId && !lc(String(r.productStoreId ?? '')).includes(lc(filterStoreId))) return false;
      if (filterStoreName && !lc(String(r.storeName ?? '')).includes(lc(filterStoreName))) return false;
      if (filterFont && String(r.fontFamily) !== filterFont) return false;
      return true;
    }));
  }, [configs, filterStoreId, filterStoreName, filterFont]);

  const hasActiveFilters = !!(filterStoreId || filterStoreName || filterFont);
  const handleClearFilters = () => { setFilterStoreId(''); setFilterStoreName(''); setFilterFont(''); };

  const [addOpen, setAddOpen] = useState(false);
  const [newStoreId, setNewStoreId] = useState('');
  const [newFont, setNewFont] = useState('Tahoma');
  const [newHeaderSize, setNewHeaderSize] = useState('18');
  const [newInfoSize, setNewInfoSize] = useState('12');
  const [newContentSize, setNewContentSize] = useState('12');
  const handleAddOpen = () => {
    setNewStoreId(''); setNewFont('Tahoma');
    setNewHeaderSize('18'); setNewInfoSize('12'); setNewContentSize('12');
    setAddOpen(true);
  };

  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: () => salesApi.createConfigPrintOrder({ productStoreId: newStoreId, fontFamily: newFont, headerFontSize: newHeaderSize, infoFontSize: newInfoSize, contentFontSize: newContentSize }),
    onSuccess: () => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['config-print-order'] }); },
  });

  const makeTextFilter = (value: string, setter: (v: string) => void) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth value={value} onChange={(e) => setter(e.target.value)}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'productStoreId', label: 'Mã CH', width: 100,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.productStoreId ?? '')}</Typography>,
      filterRender: makeTextFilter(filterStoreId, setFilterStoreId) },
    { key: 'storeName', label: 'Cửa hàng', width: 220,
      render: (r) => <Typography variant="body2">{String(r.storeName ?? '—')}</Typography>,
      filterRender: makeTextFilter(filterStoreName, setFilterStoreName) },
    { key: 'fontFamily', label: 'Font chữ', width: 150,
      render: (r) => <Typography variant="body2" sx={{ fontFamily: String(r.fontFamily ?? '') }}>{String(r.fontFamily ?? '—')}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" select fullWidth value={filterFont}
          onChange={(e) => setFilterFont(e.target.value)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }}>
          {FONT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      ) },
    { key: 'headerFontSize', label: 'Cỡ chữ tiêu đề', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{String(r.headerFontSize ?? '—')}</Typography> },
    { key: 'infoFontSize', label: 'Cỡ chữ thông tin', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{String(r.infoFontSize ?? '—')}</Typography> },
    { key: 'contentFontSize', label: 'Cỡ chữ nội dung', width: 130, align: 'right',
      render: (r) => <Typography variant="body2">{String(r.contentFontSize ?? '—')}</Typography> },
    { key: 'isPrintBeforePayment', label: 'In trước TT', width: 100,
      render: (r) => <Typography variant="body2">{r.isPrintBeforePayment === 'Y' ? 'Có' : 'Không'}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình in đơn POS' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {hasActiveFilters && <Tooltip title="Xóa tất cả bộ lọc"><IconButton size="small" onClick={handleClearFilters}><FilterOffIcon fontSize="small" color="warning" /></IconButton></Tooltip>}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}><IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}><FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} /></IconButton></Tooltip>
            <Tooltip title="Thêm mới"><IconButton size="small" onClick={handleAddOpen}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(r) => String(r.productStoreId ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có cấu hình in đơn POS" filtersVisible={filtersVisible}
        columnStorageKey="settings-print-pos" />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm cấu hình in đơn POS</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField size="small" label={reqLabel('Cửa hàng')} value={newStoreId}
            onChange={(e) => setNewStoreId(e.target.value)} required />
          <TextField size="small" label={reqLabel('Font chữ')} select value={newFont}
            onChange={(e) => setNewFont(e.target.value)}>
            {FONT_OPTIONS.filter(o => o.value).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField size="small" label={reqLabel('Cỡ chữ tiêu đề')} type="number" value={newHeaderSize}
            onChange={(e) => setNewHeaderSize(e.target.value)} />
          <TextField size="small" label={reqLabel('Cỡ chữ thông tin')} type="number" value={newInfoSize}
            onChange={(e) => setNewInfoSize(e.target.value)} />
          <TextField size="small" label={reqLabel('Cỡ chữ nội dung')} type="number" value={newContentSize}
            onChange={(e) => setNewContentSize(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" disabled={!newStoreId || createMut.isPending} onClick={() => createMut.mutate()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
