import { type FC, type ElementType, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Pause, Done, LocalShipping, PictureAsPdf } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useSalesOrderDetail } from '../hooks/useSalesOrders';
import { useAuthStore } from '../../../store/authStore';
import { actionsApi } from '../../../api/actions.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const fmt = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};
const fmtDate = (s?: string) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN');
};

const ACTION_MAP: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info'; icon: ElementType; targetStatus: string }> = {
  approve: { label: 'Duyệt đơn', color: 'success', icon: CheckCircle, targetStatus: 'ORDER_APPROVED' },
  cancel: { label: 'Hủy đơn', color: 'error', icon: Cancel, targetStatus: 'ORDER_CANCELLED' },
  hold: { label: 'Tạm giữ', color: 'warning', icon: Pause, targetStatus: 'ORDER_HOLD' },
  complete: { label: 'Hoàn thành', color: 'success', icon: Done, targetStatus: 'ORDER_COMPLETED' },
};

export const SalesOrderDetailPage: FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useSalesOrderDetail(orderId);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const qc = useQueryClient();
  const quickShipMut = useMutation({
    mutationFn: () => actionsApi.quickCreateDelivery(orderId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales-order-detail', orderId] }); },
  });
  const statusMut = useMutation({
    mutationFn: ({ statusId }: { statusId: string }) => actionsApi.changeOrderStatus(orderId!, statusId),
    onSuccess: () => { setConfirmAction(null); qc.invalidateQueries({ queryKey: ['sales-order-detail', orderId] }); },
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error || !order) return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography color="error">Không tìm thấy đơn hàng {orderId}</Typography>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/sales/orders')} sx={{ mt: 2 }}>Quay lại</Button>
    </Box>
  );

  const items = (order.items as Record<string, unknown>[]) ?? [];
  const statusHistory = (order.statusHistory as Record<string, unknown>[]) ?? [];
  const notes = (order.notes as Record<string, unknown>[]) ?? [];
  const payments = (order.payments as Record<string, unknown>[]) ?? [];
  const deliveries = (order.deliveries as Record<string, unknown>[]) ?? [];
  const statusId = String(order.statusId ?? '');

  // Determine which actions are available based on status AND permissions
  const availableActions: string[] = [];
  if (statusId === 'ORDER_CREATED') {
    if (hasPermission('SALESORDER_ACTION_APPROVE')) availableActions.push('approve');
    if (hasPermission('SALESORDER_ACTION_CANCEL')) availableActions.push('cancel');
  }
  if (statusId === 'ORDER_APPROVED') {
    if (hasPermission('SALESORDER_ACTION_HOLD')) availableActions.push('hold');
    if (hasPermission('SALESORDER_ACTION_CANCEL')) availableActions.push('cancel');
    if (hasPermission('SALESORDER_ACTION_COMPLETE')) availableActions.push('complete');
  }
  if (statusId === 'ORDER_HOLD') {
    if (hasPermission('SALESORDER_ACTION_APPROVE')) availableActions.push('approve');
    if (hasPermission('SALESORDER_ACTION_CANCEL')) availableActions.push('cancel');
  }
  // Quick ship available for approved orders with facility
  const canQuickShip = statusId === 'ORDER_APPROVED' && hasPermission('SALESORDER_ACTION_QUICKSHIP');
  // Edit available when not completed/cancelled
  const canEdit = !['ORDER_COMPLETED', 'ORDER_CANCELLED', 'ORDER_IN_TRANSIT'].includes(statusId) && hasPermission('SALESORDER_UPDATE');
  // Return available for completed orders
  const canReturn = statusId === 'ORDER_COMPLETED' && hasPermission('ORDERMGR_UPDATE');

  return (
    <Box sx={{ overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[
          { label: 'Bán hàng' },
          { label: 'Đơn hàng bán', path: '/sales/orders' },
          { label: String(order.orderId) },
        ]}
        actions={<Button startIcon={<ArrowBack />} onClick={() => navigate('/sales/orders')} size="small">Quay lại</Button>}
      />

      {/* Order Header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2, mx: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Mã đơn hàng</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{String(order.orderId)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
            <StatusBadge status={statusId} size="medium"
              label={String(order.statusDescription ?? order.statusId ?? '')} />
          </Grid>
          <Grid size={{ xs: 12 }}><Divider /></Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Kênh bán hàng</Typography>
            <Typography variant="body2">{String(order.productStoreName ?? order.productStoreId ?? '—')}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Khách hàng</Typography>
            <Typography variant="body2">{String(order.billToPartyName ?? order.billToPartyId ?? '—')}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
            <Typography variant="body2">{fmtDate(order.orderDate as string)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Người tạo</Typography>
            <Typography variant="body2">{String(order.createdBy ?? '—')}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Tổng hàng</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{fmt(order.subTotal as number, order.currencyUom as string)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Thuế</Typography>
            <Typography variant="body2">{fmt(order.taxTotal as number, order.currencyUom as string)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Giảm giá</Typography>
            <Typography variant="body2">{fmt(order.discountTotal as number, order.currencyUom as string)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Tổng thanh toán</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{fmt(order.grandTotal as number, order.currencyUom as string)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      {(availableActions.length > 0 || canQuickShip || canEdit || canReturn || statusId !== 'ORDER_CANCELLED') && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, mx: 2, flexWrap: 'wrap' }}>
          {availableActions.map(action => {
            const a = ACTION_MAP[action];
            return (
              <Button key={action} variant="contained" color={a.color} size="small"
                startIcon={<a.icon fontSize="small" />}
                onClick={() => { setCancelReason(''); setConfirmAction(action); }}>
                {a.label}
              </Button>
            );
          })}
          {canQuickShip && <Button variant="contained" color="info" size="small" startIcon={<LocalShipping />}
            onClick={() => quickShipMut.mutate()} disabled={quickShipMut.isPending}>
            {quickShipMut.isPending ? 'Đang xử lý...' : 'Giao hàng nhanh'}
          </Button>}
          {canEdit && <Button variant="outlined" size="small">Sửa đơn</Button>}
          {canReturn && <Button variant="outlined" color="warning" size="small">Trả hàng</Button>}
          <Button variant="outlined" size="small" startIcon={<PictureAsPdf />}>Xuất PDF</Button>
        </Box>
      )}

      {/* Order Items */}
      <Box sx={{ mx: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Sản phẩm</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">SL</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Thành tiền</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length ? items.map((item, idx) => (
                <TableRow key={String(item.orderItemSeqId ?? idx)}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{String(item.productId ?? '')}</Typography></TableCell>
                  <TableCell>{String(item.productName ?? item.itemDescription ?? '—')}</TableCell>
                  <TableCell align="right">{String(item.quantity ?? '')}</TableCell>
                  <TableCell align="right">{fmt(item.unitPrice as number, order.currencyUom as string)}</TableCell>
                  <TableCell align="right">{fmt(item.subTotal as number, order.currencyUom as string)}</TableCell>
                  <TableCell>{Boolean(item.statusId) && <StatusBadge status={String(item.statusId)} label={String(item.statusDescription ?? item.statusId ?? '')} />}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={7} align="center"><Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>Không có sản phẩm</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Deliveries / Phiếu xuất */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Danh sách phiếu xuất</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Mã phiếu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kho xuất</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kho nhận</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày gửi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.length ? deliveries.map((d, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{String(d.shipmentId ?? d.deliveryId ?? '')}</Typography></TableCell>
                  <TableCell>{String(d.shipmentTypeId ?? d.deliveryTypeId ?? '—')}</TableCell>
                  <TableCell><Chip size="small" label={String(d.statusDescription ?? d.statusId ?? '—')} /></TableCell>
                  <TableCell>{String(d.originFacilityId ?? '—')}</TableCell>
                  <TableCell>{String(d.destinationFacilityId ?? '—')}</TableCell>
                  <TableCell>{fmtDate((d.estimatedShipDate ?? d.shipDate) as string)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} align="center"><Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>Chưa có phiếu xuất</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payments */}
        {payments.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Thanh toán</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Phương thức</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Số tiền</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{String(p.paymentMethodTypeId ?? p.paymentMethodType ?? '—')}</TableCell>
                      <TableCell align="right">{fmt(p.amount as number, order.currencyUom as string)}</TableCell>
                      <TableCell>{Boolean(p.statusId) && <StatusBadge status={String(p.statusId)} label={String(p.statusDescription ?? p.statusId ?? '')} />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Status History */}
        {statusHistory.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Lịch sử trạng thái</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              {statusHistory.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 0.5 }}>
                  <Chip label={String(h.statusDescription ?? h.statusId ?? '')} size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">{fmtDate(h.statusDatetime as string)}</Typography>
                  {Boolean(h.statusUserLogin) && <Typography variant="caption" color="text.secondary">bởi {String(h.statusUserLogin)}</Typography>}
                </Box>
              ))}
            </Paper>
          </>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Ghi chú</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              {notes.map((n, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography variant="body2">{String(n.noteInfo ?? '')}</Typography>
                  <Typography variant="caption" color="text.secondary">{fmtDate(n.noteDateTime as string)}</Typography>
                </Box>
              ))}
            </Paper>
          </>
        )}
      </Box>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{confirmAction ? ACTION_MAP[confirmAction]?.label : ''} đơn hàng {orderId}?</DialogTitle>
        <DialogContent>
          {confirmAction === 'cancel' && (
            <TextField size="small" label="Lý do hủy" fullWidth multiline rows={2} value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)} sx={{ mt: 1 }} />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn thực hiện thao tác này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy bỏ</Button>
          <Button variant="contained" color={confirmAction ? ACTION_MAP[confirmAction]?.color : 'primary'}
            disabled={statusMut.isPending}
            onClick={() => confirmAction && statusMut.mutate({ statusId: ACTION_MAP[confirmAction].targetStatus })}>
            {statusMut.isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
