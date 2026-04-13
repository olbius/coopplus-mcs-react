import { type FC, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { salesApi } from '../../../api/sales.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };

export const PartnerCardInfoPage: FC = () => {
  const [orderId, setOrderId] = useState('');
  const [requestId, setRequestId] = useState('');

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: () => salesApi.getCardInfoDetail(orderId || undefined, requestId || undefined),
  });

  const handleSearch = () => {
    if (!orderId && !requestId) return;
    mutate();
  };

  const cards = data?.listCards ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đối tác', path: '/sales/partner/services' }, { label: 'Lấy thông tin thẻ' }]}
      />

      {/* Search form */}
      <Paper sx={{ mx: 2, mb: 2, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Tìm kiếm thông tin thẻ</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField size="small" label="Mã đơn hàng" value={orderId}
            onChange={(e) => setOrderId(e.target.value)} sx={{ width: 200 }} />
          <TextField size="small" label="Request ID" value={requestId}
            onChange={(e) => setRequestId(e.target.value)} sx={{ width: 200 }} />
          <Button variant="contained" size="small" startIcon={isPending ? <CircularProgress size={16} /> : <SearchIcon />}
            onClick={handleSearch} disabled={isPending || (!orderId && !requestId)}>
            Tìm kiếm
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 1 }}>Lỗi kết nối dịch vụ</Alert>}

      {/* Result */}
      {data && (
        <Box sx={{ mx: 2, flexGrow: 1, overflow: 'auto' }}>
          {/* Order info */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Mã đơn hàng</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.orderId || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Request ID</Typography>
                <Typography variant="body2">{data.requestId || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Ngày đơn hàng</Typography>
                <Typography variant="body2">{fmtDate(data.orderDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                <Typography variant="body2">{data.orderStatusDesc || '—'}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Card list */}
          {cards.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã thẻ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Serial</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mệnh giá</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày hết hạn</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cards.map((card, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{String(card.cardCode ?? card.cardId ?? '—')}</TableCell>
                      <TableCell>{String(card.serial ?? '—')}</TableCell>
                      <TableCell>{card.amount != null ? Number(card.amount).toLocaleString('vi-VN') : '—'}</TableCell>
                      <TableCell>{String(card.statusId ?? card.status ?? '—')}</TableCell>
                      <TableCell>{card.expireDate ? fmtDate(card.expireDate as string) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Không tìm thấy thông tin thẻ
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
