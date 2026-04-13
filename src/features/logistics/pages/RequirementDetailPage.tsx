import { type FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, Skeleton, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ArrowBack, Send, CheckCircle, Block, Cancel, Upload, Download } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { logisticsApi } from '../../../api/logistics.api';
import { useAuthStore } from '../../../store/authStore';
import { actionsApi } from '../../../api/actions.api';
import { useToast } from '../../../contexts/ToastContext';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };
const fmtQty = (v?: number | string) => { const n = Number(v); return isNaN(n) || n === 0 ? '—' : n.toLocaleString('vi-VN'); };

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>{label}:</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

interface ReqItem {
  reqItemSeqId: string;
  productId: string;
  productName?: string;
  quantity?: number;
  weight?: number;
  actualExecutedQuantity?: number;
  actualExecutedWeight?: number;
  quantityUomId?: string;
  weightUomId?: string;
  unitCost?: number;
  statusId?: string;
  description?: string;
}

export const RequirementDetailPage: FC = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const qc = useQueryClient();
  const { showSuccess, showError } = useToast();

  const statusMut = useMutation({
    mutationFn: (statusId: string) => actionsApi.changeRequirementStatus(requirementId!, statusId),
    onSuccess: () => { setConfirmAction(null); showSuccess('Cập nhật trạng thái thành công'); qc.invalidateQueries({ queryKey: ['requirement-detail', requirementId] }); },
    onError: (err: Error) => showError(err.message || 'Lỗi cập nhật trạng thái'),
  });

  const exportMut = useMutation({
    mutationFn: (items: ReqItem[]) => actionsApi.exportProductFromRequirement({
      requirementId: requirementId!,
      facilityId: String(req?.facilityId ?? ''),
      contactMechId: String(req?.contactMechId ?? ''),
      listRequirementItems: JSON.stringify(items.map(i => ({
        reqItemSeqId: i.reqItemSeqId,
        productId: i.productId,
        actualExecutedQuantity: String(i.quantity ?? 0),
        actualExecutedWeight: String(i.weight ?? 0),
      }))),
    }),
    onSuccess: () => { setConfirmAction(null); showSuccess('Xuất kho th��nh công'); qc.invalidateQueries({ queryKey: ['requirement-detail', requirementId] }); },
    onError: (err: Error) => { setConfirmAction(null); showError(err.message || 'L���i xuất kho'); },
  });

  const receiveMut = useMutation({
    mutationFn: (items: ReqItem[]) => actionsApi.receiveProductFromRequirement({
      requirementId: requirementId!,
      facilityId: String(req?.facilityId ?? ''),
      contactMechId: String(req?.contactMechId ?? ''),
      listRequirementItems: JSON.stringify(items.map(i => ({
        reqItemSeqId: i.reqItemSeqId,
        productId: i.productId,
        actualExecutedQuantity: String(i.quantity ?? 0),
        actualExecutedWeight: String(i.weight ?? 0),
      }))),
    }),
    onSuccess: () => { setConfirmAction(null); showSuccess('Nhập kho thành c��ng'); qc.invalidateQueries({ queryKey: ['requirement-detail', requirementId] }); },
    onError: (err: Error) => { setConfirmAction(null); showError(err.message || 'Lỗi nhập kho'); },
  });

  const { data: req, isLoading } = useQuery({
    queryKey: ['requirement-detail', requirementId],
    queryFn: () => logisticsApi.getRequirementDetail(requirementId!),
    enabled: !!requirementId,
  });

  if (isLoading) return <Box sx={{ p: 3 }}><Skeleton height={40} /><Skeleton height={200} /></Box>;
  if (!req) return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography>Không tìm thấy yêu cầu {requirementId}</Typography>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/logistics/requirements')} sx={{ mt: 2 }}>Quay lại</Button>
    </Box>
  );

  const statusId = String(req.statusId ?? '');
  const typeId = String(req.requirementTypeId ?? '');
  const items = (req.items ?? []) as ReqItem[];

  // Actions: status + permissions (matching old requirementDetailBegin.ftl)
  const canSend = statusId === 'REQ_CREATED' && hasPermission('LOG_REQUIREMENT_CREATE');
  const canCancelCreated = statusId === 'REQ_CREATED';
  const canApprove = statusId === 'REQ_PROPOSED' && hasPermission('ACC_REQUIREMENT_ADMIN');
  const canReject = statusId === 'REQ_PROPOSED' && hasPermission('ACC_REQUIREMENT_ADMIN');
  const canExport = statusId === 'REQ_APPROVED' && typeId === 'EXPORT_REQUIREMENT' && hasPermission('LOG_REQUIREMENT_UPDATE');
  const canReceive = statusId === 'REQ_APPROVED' && typeId === 'RECEIVE_REQUIREMENT' && hasPermission('LOG_REQUIREMENT_UPDATE');
  const hasActions = canSend || canCancelCreated || canApprove || canReject || canExport || canReceive;

  const handleExport = () => {
    if (items.length === 0) { showError('Không có sản phẩm trong yêu cầu'); return; }
    setConfirmAction('export');
  };
  const handleReceive = () => {
    if (items.length === 0) { showError('Không có sản phẩm trong yêu cầu'); return; }
    setConfirmAction('receive');
  };

  const isInventoryAction = confirmAction === 'export' || confirmAction === 'receive';
  const inventoryPending = exportMut.isPending || receiveMut.isPending;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Yêu cầu', path: '/logistics/requirements' }, { label: `Chi tiết ${requirementId}` }]}
        actions={<Button startIcon={<ArrowBack />} onClick={() => navigate('/logistics/requirements')} size="small">Quay lại</Button>}
      />

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Actions */}
        {hasActions && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {canSend && <Button variant="contained" color="primary" size="small" startIcon={<Send />}
              onClick={() => setConfirmAction('send')}>Gửi yêu cầu</Button>}
            {canApprove && <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />}
              onClick={() => setConfirmAction('approve')}>Duyệt</Button>}
            {canReject && <Button variant="contained" color="error" size="small" startIcon={<Block />}
              onClick={() => { setRejectNote(''); setConfirmAction('reject'); }}>Từ chối</Button>}
            {canExport && <Button variant="contained" color="info" size="small" startIcon={<Upload />}
              disabled={exportMut.isPending} onClick={handleExport}>
              {exportMut.isPending ? 'Đang xử lý...' : 'Xuất kho'}</Button>}
            {canReceive && <Button variant="contained" color="info" size="small" startIcon={<Download />}
              disabled={receiveMut.isPending} onClick={handleReceive}>
              {receiveMut.isPending ? 'Đang xử lý...' : 'Nhập kho'}</Button>}
            {canCancelCreated && <Button variant="outlined" color="error" size="small" startIcon={<Cancel />}
              onClick={() => setConfirmAction('cancel')}>Hủy</Button>}
          </Box>
        )}

        {/* Info */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông tin yêu cầu</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <InfoRow label="Mã yêu cầu" value={String(req.requirementId ?? '—')} />
            <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>Trạng thái:</Typography>
              <Chip size="small" label={String(req.statusDescription ?? statusId)}
                color={statusId === 'REQ_APPROVED' ? 'success' : statusId === 'REQ_REJECTED' ? 'error' : 'default'} />
            </Box>
            <InfoRow label="Loại yêu cầu" value={String(req.requirementTypeDescription ?? typeId)} />
            <InfoRow label="Lý do" value={String(req.reason ?? '—')} />
            <InfoRow label="Kho" value={String(req.facilityId ?? '—')} />
            {typeId === 'TRANSFER_REQUIREMENT' && <InfoRow label="Kho đích" value={String(req.facilityIdTo ?? '—')} />}
            <InfoRow label="Ngày cần" value={fmtDate(req.requiredByDate as string)} />
            <InfoRow label="Ngày bắt đầu" value={fmtDate(req.requirementStartDate as string)} />
            <InfoRow label="Ngân sách" value={fmtCurrency(req.estimatedBudget as number)} />
            <InfoRow label="Người tạo" value={String(req.createdByUserLogin ?? '—')} />
            <InfoRow label="Ngày tạo" value={fmtDate(req.createdDate as string)} />
            <InfoRow label="Mô tả" value={String(req.description ?? '—')} />
          </Box>
        </Paper>

        {/* Items table */}
        {items.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Danh sách sản phẩm</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Mã SP</TableCell>
                    <TableCell>Tên SP</TableCell>
                    <TableCell align="right">SL yêu cầu</TableCell>
                    <TableCell align="right">KL yêu cầu</TableCell>
                    <TableCell align="right">SL thực hiện</TableCell>
                    <TableCell align="right">KL thực hiện</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.reqItemSeqId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>{item.productName ?? '—'}</TableCell>
                      <TableCell align="right">{fmtQty(item.quantity)}</TableCell>
                      <TableCell align="right">{fmtQty(item.weight)}</TableCell>
                      <TableCell align="right">{fmtQty(item.actualExecutedQuantity)}</TableCell>
                      <TableCell align="right">{fmtQty(item.actualExecutedWeight)}</TableCell>
                      <TableCell align="right">{fmtCurrency(item.unitCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* Confirm dialog for status changes */}
      <Dialog open={!!confirmAction && !isInventoryAction} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmAction === 'send' ? 'Gửi' : confirmAction === 'approve' ? 'Duyệt' : confirmAction === 'reject' ? 'Từ chối' : 'Hủy'} yêu cầu {requirementId}?
        </DialogTitle>
        <DialogContent>
          {confirmAction === 'reject' && (
            <TextField size="small" label="Lý do từ chối" fullWidth multiline rows={2} value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)} sx={{ mt: 1 }} />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Bạn có chắc chắn?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy bỏ</Button>
          <Button variant="contained" color={confirmAction === 'reject' || confirmAction === 'cancel' ? 'error' : 'success'}
            disabled={statusMut.isPending}
            onClick={() => statusMut.mutate(
              confirmAction === 'send' ? 'REQ_PROPOSED' : confirmAction === 'approve' ? 'REQ_APPROVED' :
              confirmAction === 'reject' ? 'REQ_REJECTED' : 'REQ_CANCELLED'
            )}>
            {statusMut.isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog for inventory actions (export/receive) */}
      <Dialog open={isInventoryAction} onClose={() => !inventoryPending && setConfirmAction(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {confirmAction === 'export' ? 'Xác nhận xuất kho' : 'Xác nhận nhập kho'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {confirmAction === 'export' ? 'Xuất' : 'Nhập'} {items.length} sản phẩm {confirmAction === 'export' ? 'từ' : 'vào'} kho <strong>{String(req.facilityId ?? '')}</strong>?
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã SP</TableCell>
                  <TableCell>Tên SP</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Khối lượng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.reqItemSeqId}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.productName ?? '—'}</TableCell>
                    <TableCell align="right">{fmtQty(item.quantity)}</TableCell>
                    <TableCell align="right">{fmtQty(item.weight)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} disabled={inventoryPending}>Hủy bỏ</Button>
          <Button variant="contained" color={confirmAction === 'export' ? 'warning' : 'info'}
            disabled={inventoryPending}
            onClick={() => confirmAction === 'export' ? exportMut.mutate(items) : receiveMut.mutate(items)}>
            {inventoryPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
