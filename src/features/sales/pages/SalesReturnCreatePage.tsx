import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, Alert, CircularProgress } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { apiClient } from '../../../api/client';

interface OFBizResponse<T> { statusCode: string; data: T; }

const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

export const SalesReturnCreatePage: FC = () => {
  const nav = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchError, setSearchError] = useState('');

  const searchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<OFBizResponse<{ returnableItems: Record<string, unknown>[]; orderStatus: string }>>(
        '/services/getReturnableItemsPOS', { orderId });
      return res.data?.data;
    },
    onSuccess: (data) => {
      setOrderStatus(data?.orderStatus ?? '');
      const returnableItems = data?.returnableItems ?? [];
      setItems(returnableItems);
      setSelectedItems(new Set(returnableItems.map((_, i) => i)));
      setSearchError(returnableItems.length === 0 ? 'Không có sản phẩm có thể trả' : '');
    },
    onError: () => setSearchError('Lỗi khi tìm đơn hàng'),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const returnItems = items.filter((_, i) => selectedItems.has(i)).map(item => ({
        orderItemSeqId: item.orderItemSeqId,
        returnQuantity: item.returnQuantity ?? item.quantity,
        returnPrice: item.returnPrice ?? item.unitPrice,
        returnReasonId: 'RTN_NOT_WANT',
        returnTypeId: 'RTN_REFUND_IMMEDIATE',
      }));
      const res = await apiClient.post<OFBizResponse<{ returnId: string }>>(
        '/services/createReturnOrderPOS', { orderId, returnItems });
      return res.data?.data?.returnId;
    },
    onSuccess: (returnId) => {
      if (returnId) nav(`/sales/returns/${returnId}`);
    },
  });

  const toggleItem = (idx: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === items.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(items.map((_, i) => i)));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng trả', path: '/sales/returns' }, { label: 'Tạo đơn trả hàng' }]} />

      <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search order */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Tìm đơn hàng cần trả</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField size="small" label={<>Mã đơn hàng <span style={{ color: 'red' }}>*</span></>}
              value={orderId} onChange={(e) => setOrderId(e.target.value)} sx={{ width: 250 }} />
            <Button variant="contained" size="small"
              startIcon={searchMutation.isPending ? <CircularProgress size={16} /> : <SearchIcon />}
              onClick={() => searchMutation.mutate()} disabled={!orderId.trim() || searchMutation.isPending}>
              Tìm kiếm
            </Button>
          </Box>
          {orderStatus && <Typography variant="body2" sx={{ mt: 1 }}>Trạng thái đơn hàng: <strong>{orderStatus}</strong></Typography>}
          {searchError && <Alert severity="warning" sx={{ mt: 1 }}>{searchError}</Alert>}
          {createMutation.error && <Alert severity="error" sx={{ mt: 1 }}>Lỗi tạo đơn trả hàng</Alert>}
        </Paper>

        {/* Returnable items */}
        {items.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Sản phẩm có thể trả ({selectedItems.size}/{items.length} đã chọn)</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox checked={selectedItems.size === items.length} indeterminate={selectedItems.size > 0 && selectedItems.size < items.length} onChange={toggleAll} size="small" /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên SP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">SL</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx} selected={selectedItems.has(idx)}>
                      <TableCell padding="checkbox"><Checkbox checked={selectedItems.has(idx)} onChange={() => toggleItem(idx)} size="small" /></TableCell>
                      <TableCell>{String(item.productId ?? '—')}</TableCell>
                      <TableCell>{String(item.productName ?? item.itemDescription ?? '—')}</TableCell>
                      <TableCell align="right">{String(item.quantity ?? item.returnQuantity ?? '—')}</TableCell>
                      <TableCell align="right">{fmtCurrency(item.unitPrice as number ?? item.returnPrice as number)}</TableCell>
                      <TableCell align="right">{fmtCurrency((Number(item.quantity ?? item.returnQuantity ?? 0)) * (Number(item.unitPrice ?? item.returnPrice ?? 0)))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" color="success" disabled={selectedItems.size === 0 || createMutation.isPending}
                onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                Tạo đơn trả hàng
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};
