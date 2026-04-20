import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box, Paper, TextField, Button, Typography, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Grid,
} from '@mui/material';
import { ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { useToast } from '../../../contexts/ToastContext';
import { purchasingApi } from '../../../api/purchasing.api';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const POCreatePage: FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Form state
  const [supplierId, setSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState('');
  const [facilityId, setFacilityId] = useState<string>('');
  const [orderName, setOrderName] = useState('');
  const [shipAfterDate, setShipAfterDate] = useState('');
  const [shipBeforeDate, setShipBeforeDate] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  // Lookups
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => purchasingApi.listSuppliers(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => purchasingApi.listFacilities(),
  });

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn: () => purchasingApi.getProductsBySupplier(supplierId),
    enabled: !!supplierId,
  });

  // Reset items when supplier changes
  useEffect(() => { setItems([]); }, [supplierId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () => {
      const orderItemsJson = JSON.stringify(items.map((item, idx) => ({
        productId: item.productId,
        quantity: item.quantity,
        lastPrice: String(item.unitPrice),
        orderItemSeqId: String(idx + 1).padStart(5, '0'),
      })));
      return purchasingApi.createPurchaseOrder({
        partyIdFrom: supplierId,
        orderName: orderName || undefined,
        originFacilityId: facilityId || undefined,
        currencyUomId: 'VND',
        shipAfterDate: shipAfterDate || undefined,
        shipBeforeDate: shipBeforeDate || undefined,
        orderItems: orderItemsJson,
      });
    },
    onSuccess: (data) => {
      showSuccess(`Tạo đơn mua thành công: ${data.orderId}`);
      navigate(`/po/orders/${data.orderId}`);
    },
    onError: (err: Error) => {
      showError(err.message || 'Lỗi tạo đơn mua');
    },
  });

  const addItem = (product: { productId: string; productName: string; lastPrice: number; minimumOrderQuantity: number }) => {
    if (items.find(i => i.productId === product.productId)) return;
    setItems(prev => [...prev, {
      productId: product.productId,
      productName: product.productName,
      quantity: product.minimumOrderQuantity || 1,
      unitPrice: product.lastPrice || 0,
    }]);
  };

  const updateItem = (idx: number, field: 'quantity' | 'unitPrice', value: number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const canSubmit = !!supplierId && items.length > 0;

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          { label: 'Mua sắm', path: '/po/orders' },
          { label: 'Quản lý đơn mua', path: '/po/orders' },
          { label: 'Tạo mới' },
        ]}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/orders')} size="small">
            Quay lại
          </Button>
        }
      />

      {/* Order Header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Thông tin đơn mua</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={suppliers}
              getOptionLabel={(o) => `[${o.partyId}] ${o.groupName ?? ''}`}
              onChange={(_, val) => { setSupplierId(val?.partyId ?? ''); setSupplierName(val?.groupName ?? ''); }}
              renderInput={(params) => <TextField {...params} label="Nhà cung cấp *" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={facilities}
              getOptionLabel={(o) => `[${o.facilityId}] ${o.facilityName ?? ''}`}
              onChange={(_, val) => setFacilityId(val?.facilityId ?? '')}
              renderInput={(params) => <TextField {...params} label="Kho nhận" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Tên đơn hàng" size="small" fullWidth value={orderName}
              onChange={(e) => setOrderName(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField label="Giao từ ngày" type="date" size="small" fullWidth value={shipAfterDate}
              onChange={(e) => setShipAfterDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField label="Giao trước ngày" type="date" size="small" fullWidth value={shipBeforeDate}
              onChange={(e) => setShipBeforeDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Product Selection */}
      {supplierId && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Sản phẩm ({supplierName})
            </Typography>
            <Autocomplete
              key={items.length}
              options={supplierProducts.filter(p => !items.find(i => i.productId === p.productId))}
              getOptionLabel={(o) => typeof o === 'string' ? o : `[${o.productId}] ${o.productName ?? ''}`}
              isOptionEqualToValue={(option, value) => option.productId === value.productId}
              onChange={(_, val) => { if (val && typeof val !== 'string') addItem(val); }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Thêm sản phẩm..." size="small" sx={{ minWidth: 350 }} />
              )}
              clearOnBlur
              sx={{ flexShrink: 0 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Số lượng</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Thành tiền</TableCell>
                  <TableCell width={50} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.disabled" sx={{ py: 3 }}>
                        Chọn sản phẩm từ danh sách ở trên
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.map((item, idx) => (
                  <TableRow key={item.productId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">
                      <TextField type="number" size="small" value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        sx={{ width: 100 }}
                        slotProps={{ input: { inputProps: { min: 1, style: { textAlign: 'right' } } } }} />
                    </TableCell>
                    <TableCell align="right">
                      <TextField type="number" size="small" value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        sx={{ width: 130 }}
                        slotProps={{ input: { inputProps: { min: 0, style: { textAlign: 'right' } } } }} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <Typography variant="subtitle2">Tổng cộng:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(grandTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Submit */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/po/orders')}>Hủy</Button>
        <Button variant="contained" onClick={() => createMutation.mutate()}
          disabled={!canSubmit || createMutation.isPending}>
          {createMutation.isPending ? 'Đang tạo...' : 'Tạo đơn mua'}
        </Button>
      </Box>
    </Box>
  );
};
