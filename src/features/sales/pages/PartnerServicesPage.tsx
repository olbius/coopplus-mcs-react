import { type FC, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert } from '@mui/material';
import { ChevronRight, AccountBalance } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { apiClient } from '../../../api/client';

interface BalanceResult { balance?: number; status?: string; message?: string; }

const VTC_ACTIONS = [
  { id: 'vtc-balance', label: 'Xem số dư', partnerCode: 'VTC' },
  { id: 'vtc-quantity', label: 'Số lượng thẻ trong kho VTC', action: 'quantityCard' },
  { id: 'vtc-history', label: 'Lịch sử giao dịch', action: 'historyTrans' },
  { id: 'vtc-price', label: 'Xem giá bán', action: 'salePrice' },
  { id: 'vtc-promo', label: 'Xem ngày khuyến mãi', action: 'promoDate' },
  { id: 'vtc-check', label: 'Kiểm tra dịch vụ', action: 'checkService' },
];

const MOMO_ACTIONS = [
  { id: 'momo-balance', label: 'Xem số dư', partnerCode: 'MOMO' },
  { id: 'momo-topup', label: 'Xem số dư (Topup)', partnerCode: 'MOMOWALLET' },
];

export const PartnerServicesPage: FC = () => {
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceResult, setBalanceResult] = useState<BalanceResult | null>(null);
  const [balancePartner, setBalancePartner] = useState('');
  const [balanceError, setBalanceError] = useState('');

  const handleGetBalance = async (partnerCode: string) => {
    setBalancePartner(partnerCode);
    setBalanceOpen(true);
    setBalanceLoading(true);
    setBalanceError('');
    setBalanceResult(null);
    try {
      // This calls the VTC/MoMo balance check service
      const res = await apiClient.post('/services/getPartnerBalance', { partnerCode });
      setBalanceResult(res.data?.data ?? {});
    } catch {
      setBalanceError('Không kết nối được dịch vụ đối tác');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleAction = (action: string) => {
    // These actions require popup windows calling external partner APIs
    // In production, these would call VTC SOAP services
    alert(`Chức năng "${action}" cần kết nối dịch vụ đối tác bên ngoài (VTC/MoMo)`);
  };

  const handleClick = (item: { partnerCode?: string; action?: string }) => {
    if (item.partnerCode) handleGetBalance(item.partnerCode);
    else if (item.action) handleAction(item.action);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đối tác', path: '/sales/partner/services' }, { label: 'Dịch vụ' }]} />

      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* VTC Card */}
        <Paper sx={{ flex: '1 1 300px', maxWidth: 400, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#307ECC', color: '#fff', px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>VTC</Typography>
          </Box>
          <List dense disablePadding>
            {VTC_ACTIONS.map((item) => (
              <ListItemButton key={item.id} onClick={() => handleClick(item)} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><ChevronRight color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2' } }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* MoMo Card */}
        <Paper sx={{ flex: '1 1 300px', maxWidth: 400, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#82AF6F', color: '#fff', px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>MoMo</Typography>
          </Box>
          <List dense disablePadding>
            {MOMO_ACTIONS.map((item) => (
              <ListItemButton key={item.id} onClick={() => handleClick(item)} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><ChevronRight color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2' } }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Balance Dialog */}
      <Dialog open={balanceOpen} onClose={() => setBalanceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance /> Số dư {balancePartner}
        </DialogTitle>
        <DialogContent>
          {balanceLoading && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress /></Box>}
          {balanceError && <Alert severity="error">{balanceError}</Alert>}
          {balanceResult && !balanceLoading && (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">Trạng thái: {balanceResult.status ?? '—'}</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                {balanceResult.balance != null ? Number(balanceResult.balance).toLocaleString('vi-VN') + ' đ' : '—'}
              </Typography>
              {balanceResult.message && <Typography variant="body2" sx={{ mt: 1 }}>{balanceResult.message}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
