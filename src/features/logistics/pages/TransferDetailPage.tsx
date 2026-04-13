import { type FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Refresh as RefreshIcon, ArrowBack, CheckCircle, Cancel, Block } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { accountingApi } from '../../../api/accounting.api';
import { useAuthStore } from '../../../store/authStore';
import { actionsApi } from '../../../api/actions.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>{label}:</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export const TransferDetailPage: FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const qc = useQueryClient();
  const statusMut = useMutation({
    mutationFn: (statusId: string) => actionsApi.changeTransferStatus(transferId!, statusId),
    onSuccess: () => { setConfirmAction(null); qc.invalidateQueries({ queryKey: ['transfer-detail', transferId] }); },
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['transfer-detail', transferId],
    queryFn: () => accountingApi.listTransfers(0, 1, { transferId: transferId! }),
    enabled: !!transferId,
  });

  const transfer = data?.transferList?.[0];

  if (isLoading) return <Box sx={{ p: 3 }}><Skeleton height={40} /><Skeleton height={200} /></Box>;
  if (!transfer) return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography>Không tìm thấy điều chuyển {transferId}</Typography>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/logistics/transfers')} sx={{ mt: 2 }}>Quay l��i</Button>
    </Box>
  );

  const statusId = String(transfer.statusId ?? '');

  // Actions based on status + permissions
  const canApprove = statusId === 'TRANSFER_CREATED' && hasPermission('ACC_TRANSFER_ADMIN');
  const canReject = statusId === 'TRANSFER_CREATED' && hasPermission('ACC_TRANSFER_ADMIN');
  const canCancel = statusId === 'TRANSFER_CREATED';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Điều chuyển', path: '/logistics/transfers' }, { label: `Chi tiết ${transferId}` }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/logistics/transfers')} size="small">Quay lại</Button>
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Action buttons */}
        {(canApprove || canReject || canCancel) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {canApprove && <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />}
              onClick={() => setConfirmAction('approve')}>Duyệt</Button>}
            {canReject && <Button variant="contained" color="error" size="small" startIcon={<Block />}
              onClick={() => { setRejectNote(''); setConfirmAction('reject'); }}>Từ chối</Button>}
            {canCancel && <Button variant="outlined" color="error" size="small" startIcon={<Cancel />}
              onClick={() => setConfirmAction('cancel')}>Hủy</Button>}
          </Box>
        )}

        {/* Transfer info */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông tin điều chuyển</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <InfoRow label="Mã điều chuyển" value={String(transfer.transferId ?? '—')} />
            <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>Trạng thái:</Typography>
              <Chip size="small" label={String(transfer.statusDescription ?? statusId ?? '—')}
                color={statusId === 'TRANSFER_APPROVED' ? 'success' : statusId === 'TRANSFER_CANCELLED' ? 'error' : 'default'} />
            </Box>
            <InfoRow label="Loại điều chuyển" value={String(transfer.transferTypeId ?? '—')} />
            <InfoRow label="Ưu tiên" value={transfer.priority != null ? String(transfer.priority) : '—'} />
            <InfoRow label="Kho nguồn" value={String(transfer.originFacilityId ?? '—')} />
            <InfoRow label="Kho đích" value={String(transfer.destFacilityId ?? '—')} />
            <InfoRow label="Ngày điều chuyển" value={fmtDate(transfer.transferDate as string)} />
            <InfoRow label="Ngày tạo" value={fmtDate(transfer.createdDate as string)} />
            <InfoRow label="Người tạo" value={String(transfer.createdByUserLogin ?? '—')} />
            <InfoRow label="Mô tả" value={String(transfer.description ?? '—')} />
          </Box>
        </Paper>
      </Box>

      {/* Confirm dialog */}
      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmAction === 'approve' ? 'Duyệt' : confirmAction === 'reject' ? 'Từ chối' : 'Hủy'} điều chuyển {transferId}?
        </DialogTitle>
        <DialogContent>
          {confirmAction === 'reject' && (
            <TextField size="small" label="Lý do từ chối" fullWidth multiline rows={2} value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)} sx={{ mt: 1 }} />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn thực hiện thao tác này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy bỏ</Button>
          <Button variant="contained" color={confirmAction === 'approve' ? 'success' : 'error'}
            disabled={statusMut.isPending}
            onClick={() => statusMut.mutate(confirmAction === 'approve' ? 'TRANSFER_APPROVED' : confirmAction === 'reject' ? 'TRANSFER_REJECTED' : 'TRANSFER_CANCELLED')}>
            {statusMut.isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
