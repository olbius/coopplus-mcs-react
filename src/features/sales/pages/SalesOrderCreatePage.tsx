import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, Paper, TextField, Button, Stepper, Step, StepLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { apiClient } from '../../../api/client';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export const SalesOrderCreatePage: FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Customer info
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Order items
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newProductId, setNewProductId] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');

  const handleAddItem = () => {
    if (!newProductId || !newPrice) return;
    setItems([...items, { productId: newProductId, productName: newProductName || newProductId, quantity: Number(newQty) || 1, unitPrice: Number(newPrice) || 0 }]);
    setNewProductId(''); setNewProductName(''); setNewQty('1'); setNewPrice('');
  };

  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const grandTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const canNext = items.length > 0;

  const createMut = useMutation({
    mutationFn: async () => {
      const orderItems = items.map(i => ({ productId: i.productId, quantity: String(i.quantity), lastPrice: String(i.unitPrice) }));
      const res = await apiClient.post('/services/createPurchaseOrderSimple', {
        supplierId: customerId || '_NA_',
        originFacilityId: 'FA160',
        orderItems,
        currencyUomId: 'VND',
        orderName: customerName || 'Web Order',
      });
      return (res.data as { data?: { orderId?: string } })?.data?.orderId;
    },
    onSuccess: (orderId) => { if (orderId) navigate(`/sales/orders/${orderId}`); },
  });

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng bán', path: '/sales/orders' }, { label: 'Thêm mới' }]} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step><StepLabel>Thông tin đơn hàng</StepLabel></Step>
          <Step><StepLabel>Xác nhận</StepLabel></Step>
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Customer */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Khách hàng</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField size="small" label="Mã khách hàng" value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)} />
                <TextField size="small" label="Tên khách hàng" value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)} />
              </Box>
            </Paper>

            {/* Add product */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Thêm sản phẩm</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField size="small" label={reqLabel('Mã SP')} value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)} sx={{ width: 150 }} />
                <TextField size="small" label="Tên SP" value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="SL" type="number" value={newQty}
                  onChange={(e) => setNewQty(e.target.value)} sx={{ width: 80 }} />
                <TextField size="small" label={reqLabel('Đơn giá')} type="number" value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)} sx={{ width: 140 }} />
                <Tooltip title="Thêm SP"><IconButton color="primary" onClick={handleAddItem}
                  disabled={!newProductId || !newPrice}><AddIcon /></IconButton></Tooltip>
              </Box>
            </Paper>

            {/* Items list */}
            {items.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Danh sách sản phẩm ({items.length})</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tên SP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">SL</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Thành tiền</TableCell>
                        <TableCell width={40} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{item.productId}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.unitPrice.toLocaleString('vi-VN')}</TableCell>
                          <TableCell align="right">{(item.quantity * item.unitPrice).toLocaleString('vi-VN')}</TableCell>
                          <TableCell><IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5} align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>Tổng cộng:</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>{grandTotal.toLocaleString('vi-VN')} đ</Typography></TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Xác nhận đơn hàng</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 1, columnGap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Khách hàng:</Typography>
              <Typography variant="body2">{customerName || customerId || 'Khách lẻ'}</Typography>
              <Typography variant="body2" color="text.secondary">Số sản phẩm:</Typography>
              <Typography variant="body2">{items.length}</Typography>
              <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{grandTotal.toLocaleString('vi-VN')} đ</Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          {activeStep > 0 && <Button variant="outlined" onClick={() => setActiveStep(0)}>Quay lại</Button>}
          {activeStep === 0 && <Button variant="contained" disabled={!canNext} onClick={() => setActiveStep(1)}>Tiếp theo</Button>}
          {activeStep === 1 && (
            <Button variant="contained" color="success" disabled={createMut.isPending}
              onClick={() => createMut.mutate()}>
              {createMut.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
            </Button>
          )}
          {createMut.error && <Alert severity="error" sx={{ ml: 2 }}>Lỗi tạo đơn hàng</Alert>}
        </Box>
      </Box>
    </Box>
  );
};
