import { type FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { useSupplierDetail } from '../hooks/useSuppliers';

const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
};

export const SupplierDetailPage: FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSupplierDetail(partyId);
  const [tab, setTab] = useState(0);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  if (error || !data?.supplier) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Không tìm thấy nhà cung cấp {partyId}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/suppliers')} sx={{ mt: 2 }}>Quay lại</Button>
      </Box>
    );
  }

  const { supplier, products } = data;

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          { label: 'Mua sắm', path: '/po/suppliers' },
          { label: 'Nhà cung cấp', path: '/po/suppliers' },
          { label: supplier.partyId },
        ]}
        actions={<Button startIcon={<ArrowBack />} onClick={() => navigate('/po/suppliers')} size="small">Quay lại</Button>}
      />

      {/* Tabs matching old system: General | Products | Promotions */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Thông tin chung" />
        <Tab label={`Sản phẩm (${products?.length ?? 0})`} />
        <Tab label="Khuyến mại" />
      </Tabs>

      {/* Tab 0: General Info */}
      {tab === 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Thông tin chung</Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 5 }}><Typography variant="body2" color="text.secondary" textAlign="right">Mã NCC</Typography></Grid>
                <Grid size={{ xs: 7 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{supplier.partyId}</Typography></Grid>
                <Grid size={{ xs: 5 }}><Typography variant="body2" color="text.secondary" textAlign="right">Tên NCC</Typography></Grid>
                <Grid size={{ xs: 7 }}><Typography variant="body2">{supplier.groupName ?? '—'}</Typography></Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Thông tin liên lạc</Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 5 }}><Typography variant="body2" color="text.secondary" textAlign="right">Email</Typography></Grid>
                <Grid size={{ xs: 7 }}><Typography variant="body2">{supplier.email ?? '—'}</Typography></Grid>
                <Grid size={{ xs: 5 }}><Typography variant="body2" color="text.secondary" textAlign="right">Số điện thoại</Typography></Grid>
                <Grid size={{ xs: 7 }}><Typography variant="body2">{supplier.phone ?? '—'}</Typography></Grid>
                <Grid size={{ xs: 5 }}><Typography variant="body2" color="text.secondary" textAlign="right">Địa chỉ</Typography></Grid>
                <Grid size={{ xs: 7 }}><Typography variant="body2">{[supplier.address1, supplier.city].filter(Boolean).join(', ') || '—'}</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tab 1: Products */}
      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">MOQ</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Giá mua</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tiền tệ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mã NCC-SP</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày bắt đầu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày kết thúc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.length ? products.map((p, idx) => {
                const isExpired = p.availableThruDate && new Date(p.availableThruDate) < new Date();
                return (
                  <TableRow key={`${p.productId}-${idx}`} sx={isExpired ? { bgcolor: 'action.disabledBackground', opacity: 0.6 } : undefined}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => navigate(`/po/products/${p.productId}`)}>
                        {p.productCode ?? p.productId}
                      </Typography>
                    </TableCell>
                    <TableCell>{p.productName ?? '—'}</TableCell>
                    <TableCell align="right">{p.minimumOrderQuantity ?? '—'}</TableCell>
                    <TableCell align="right">{formatCurrency(p.lastPrice, p.currencyUomId)}</TableCell>
                    <TableCell>{p.currencyUomId ?? '—'}</TableCell>
                    <TableCell>{p.supplierProductId ?? '—'}</TableCell>
                    <TableCell>{formatDate(p.availableFromDate)}</TableCell>
                    <TableCell>{formatDate(p.availableThruDate)}</TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.disabled" sx={{ py: 4 }}>Không có sản phẩm</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: Promotions */}
      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">Khuyến mại của nhà cung cấp sẽ được hiển thị ở đây.</Typography>
        </Paper>
      )}
    </Box>
  );
};
