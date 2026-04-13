import { type FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Grid, Chip, Divider, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, PictureAsPdf, Done } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAuthStore } from '../../../store/authStore';
import { actionsApi } from '../../../api/actions.api';
import { usePurchaseOrderDetail } from '../hooks/usePurchaseOrderDetail';
import { PO_STATUS_LABELS } from '../../../types/purchasing.types';

const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
};

export const PODetailPage: FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = usePurchaseOrderDetail(orderId);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const qc = useQueryClient();
  const statusMut = useMutation({
    mutationFn: ({ statusId }: { statusId: string }) => actionsApi.changeOrderStatus(orderId!, statusId),
    onSuccess: () => { setConfirmAction(null); qc.invalidateQueries({ queryKey: ['purchase-order-detail', orderId] }); },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Không tìm thấy đơn hàng {orderId}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/orders')} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          { label: 'Mua sắm', href: '/po/orders' },
          { label: 'Quản lý đơn mua', href: '/po/orders' },
          { label: order.orderId },
        ]}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/orders')} size="small">
            Quay lại
          </Button>
        }
      />

      {/* Action Buttons — status + permission dependent */}
      {(() => {
        const s = order.statusId;
        const canApprove = s === 'ORDER_CREATED' && hasPermission('ACC_POAPPROVED_ADMIN');
        const canComplete = s === 'ORDER_APPROVED' && hasPermission('PURCHASEORDER_APPROVE');
        const canCancel = s !== 'ORDER_COMPLETED' && s !== 'ORDER_CANCELLED' && hasPermission('PURCHASEORDER_APPROVE');
        const canEdit = s !== 'ORDER_CANCELLED' && s !== 'ORDER_COMPLETED' && s !== 'ORDER_IN_TRANSIT' && hasPermission('PURCHASEORDER_EDIT');
        const showActions = canApprove || canComplete || canCancel || canEdit || s !== 'ORDER_CANCELLED';
        return showActions ? (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {canApprove && <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />}
              onClick={() => setConfirmAction('approve')}>Duyệt đơn</Button>}
            {canComplete && <Button variant="contained" color="success" size="small" startIcon={<Done />}
              onClick={() => setConfirmAction('complete')}>Hoàn thành</Button>}
            {canCancel && <Button variant="outlined" color="error" size="small" startIcon={<Cancel />}
              onClick={() => setConfirmAction('cancel')}>Hủy đơn</Button>}
            {canEdit && <Button variant="outlined" size="small">Sửa đơn</Button>}
            {s !== 'ORDER_CANCELLED' && <Button variant="outlined" size="small" startIcon={<PictureAsPdf />}>Xuất PDF</Button>}
          </Box>
        ) : null;
      })()}

      {/* Order Header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Mã đơn</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{order.orderId}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
            <StatusBadge status={order.statusId} size="medium"
              label={order.statusDescription ?? PO_STATUS_LABELS[order.statusId] ?? order.statusId} />
          </Grid>

          <Grid size={{ xs: 12 }}><Divider /></Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Nhà cung cấp</Typography>
            <Typography variant="body2">{order.supplierName ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Kho nhận</Typography>
            <Typography variant="body2">{order.facilityName ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
            <Typography variant="body2">{formatDate(order.orderDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Người tạo</Typography>
            <Typography variant="body2">{order.createdBy ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Giao từ</Typography>
            <Typography variant="body2">{formatDate(order.shipAfterDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Giao trước</Typography>
            <Typography variant="body2">{formatDate(order.shipBeforeDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Loại</Typography>
            <Typography variant="body2">
              {order.isAllocation === 'P' ? 'Phân bổ' : order.isAllocation === 'T' ? 'Nhập kho' : 'Bình thường'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Tổng sau thuế</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatCurrency(order.grandTotal, order.currencyUom)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Items */}
      <Typography variant="h6" sx={{ mb: 1.5 }}>Sản phẩm</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
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
            {order.items?.length ? order.items.map((item, idx) => (
              <TableRow key={item.orderItemSeqId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.productId}</TableCell>
                <TableCell>{item.productName ?? item.itemDescription ?? '—'}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.unitPrice, order.currencyUom)}</TableCell>
                <TableCell align="right">{formatCurrency(item.subTotal, order.currencyUom)}</TableCell>
                <TableCell>
                  {item.statusId && <StatusBadge status={item.statusId} label={item.statusDescription} />}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>Không có sản phẩm</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Lịch sử trạng thái</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {order.statusHistory.map((h, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 0.5 }}>
                <Chip label={h.statusDescription ?? h.statusId} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">{formatDate(h.statusDatetime)}</Typography>
                {h.statusUserLogin && (
                  <Typography variant="caption" color="text.secondary">bởi {h.statusUserLogin}</Typography>
                )}
              </Box>
            ))}
          </Paper>
        </>
      )}
      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmAction === 'approve' ? 'Duyệt' : confirmAction === 'complete' ? 'Hoàn thành' : 'Hủy'} đơn mua {orderId}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Bạn có chắc chắn?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy bỏ</Button>
          <Button variant="contained"
            color={confirmAction === 'cancel' ? 'error' : 'success'}
            disabled={statusMut.isPending}
            onClick={() => statusMut.mutate({ statusId:
              confirmAction === 'approve' ? 'ORDER_APPROVED' :
              confirmAction === 'complete' ? 'ORDER_COMPLETED' : 'ORDER_CANCELLED'
            })}>
            {statusMut.isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
