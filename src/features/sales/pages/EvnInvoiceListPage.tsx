import { type FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, TextField, Button } from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { salesApi } from '../../../api/sales.api';

const fmtDate = (s?: string) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN');
};

const fmtCurrency = (v?: number | string) => {
  const n = Number(v);
  if (isNaN(n)) return '—';
  return n.toLocaleString('vi-VN') + ' đ';
};

// Default: today 00:00:00 → 23:59:59 as epoch millis
const todayStart = () => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  return d.getTime().toString();
};
const todayEnd = () => {
  const d = new Date(); d.setHours(23, 59, 59, 999);
  return d.getTime().toString();
};

const toDateInput = (epoch: string) => {
  const d = new Date(Number(epoch));
  return d.toISOString().slice(0, 10);
};

export const EvnInvoiceListPage: FC = () => {
  const [fromDate, setFromDate] = useState(todayStart);
  const [thruDate, setThruDate] = useState(todayEnd);
  const [searchFrom, setSearchFrom] = useState(fromDate);
  const [searchThru, setSearchThru] = useState(thruDate);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['evn-invoices', searchFrom, searchThru],
    queryFn: () => salesApi.getEvnInvoiceList(searchFrom, searchThru),
  });

  const items = data?.root ?? [];

  const handleSearch = () => {
    setSearchFrom(fromDate);
    setSearchThru(thruDate);
  };

  const handleFromChange = (val: string) => {
    const d = new Date(val); d.setHours(0, 0, 0, 0);
    setFromDate(d.getTime().toString());
  };
  const handleThruChange = (val: string) => {
    const d = new Date(val); d.setHours(23, 59, 59, 999);
    setThruDate(d.getTime().toString());
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'maHD', label: 'Mã hóa đơn', width: 140,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.maHD ?? '')}</Typography> },
    { key: 'maGiaoDich', label: 'Mã giao dịch', width: 140,
      render: (r) => <Typography variant="body2">{String(r.maGiaoDich ?? '—')}</Typography> },
    { key: 'diemThu', label: 'Điểm thu', width: 120,
      render: (r) => <Typography variant="body2">{String(r.diemThu ?? '—')}</Typography> },
    { key: 'maKH', label: 'Mã KH', width: 120,
      render: (r) => <Typography variant="body2">{String(r.maKH ?? '—')}</Typography> },
    { key: 'tenKH', label: 'Tên KH', width: 200,
      render: (r) => <Typography variant="body2">{String(r.tenKH ?? '—')}</Typography> },
    { key: 'ngayNganHang', label: 'Ngày ngân hàng', width: 180,
      render: (r) => <Typography variant="body2">{fmtDate(r.ngayNganHang as string)}</Typography> },
    { key: 'soTien', label: 'Số tiền', width: 140, align: 'right',
      render: (r) => <Typography variant="body2">{fmtCurrency(r.soTien as number)}</Typography> },
    { key: 'daInHD', label: 'Đã in HĐ', width: 100,
      render: (r) => <Typography variant="body2" color={r.daInHD === 'Y' ? 'success.main' : 'text.secondary'}>
        {r.daInHD === 'Y' ? 'Đã in' : 'Chưa in'}
      </Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng bán', path: '/sales/orders' }, { label: 'Hóa đơn (từ EVN)' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      {/* Date range search bar */}
      <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, alignItems: 'center' }}>
        <TextField size="small" type="date" label="Từ ngày" value={toDateInput(fromDate)}
          onChange={(e) => handleFromChange(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
        <TextField size="small" type="date" label="Đến ngày" value={toDateInput(thruDate)}
          onChange={(e) => handleThruChange(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
        <Button variant="contained" size="small" startIcon={<SearchIcon />} onClick={handleSearch} disabled={isFetching}>
          Tìm kiếm
        </Button>
        {data?.responseCode && data.responseCode !== '0' && (
          <Typography variant="body2" color="error">{data.responseMessage}</Typography>
        )}
      </Box>
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.maHD ?? Math.random())}
        loading={isLoading || isFetching} emptyMessage="Không có hóa đơn EVN" columnStorageKey="evn-invoices" />
    </Box>
  );
};
