import { type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { useProductDetail } from '../hooks/useProducts';

const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

export const ProductDetailPage: FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProductDetail(productId);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (error || !product) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Không tìm thấy sản phẩm {productId}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/products')} sx={{ mt: 2 }}>Quay lại</Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          { label: 'Mua sắm', path: '/po/products' },
          { label: 'Sản phẩm', path: '/po/products' },
          { label: product.productId },
        ]}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/po/products')} size="small">Quay lại</Button>
        }
      />

      {/* Product Info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="subtitle2" color="text.secondary">Mã sản phẩm</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{product.productId}</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>{product.productName ?? ''}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {product.productTypeId && <Chip label={product.productTypeId} size="small" sx={{ mr: 1 }} />}
            {product.isVirtual === 'Y' && <Chip label="Virtual" size="small" color="info" sx={{ mr: 1 }} />}
            {product.isVariant === 'Y' && <Chip label="Variant" size="small" color="warning" />}
          </Grid>

          <Grid size={{ xs: 12 }}><Divider /></Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Tên nội bộ</Typography>
            <Typography variant="body2">{product.internalName ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Đơn vị</Typography>
            <Typography variant="body2">{product.quantityUomId ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Danh mục chính</Typography>
            <Typography variant="body2">{product.primaryProductCategoryId ?? '—'}</Typography>
          </Grid>

          {product.description && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">Mô tả</Typography>
              <Typography variant="body2">{product.description}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Categories */}
      {product.categories?.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Danh mục</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {product.categories.map((cat) => (
              <Chip key={cat.productCategoryId} label={`${cat.productCategoryId} - ${cat.categoryName ?? ''}`} variant="outlined" size="small" />
            ))}
          </Box>
        </Paper>
      )}

      {/* Suppliers */}
      {product.suppliers?.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Nhà cung cấp</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Mã NCC</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên NCC</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Giá gần nhất</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">MOQ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tiền tệ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.suppliers.map((s) => (
                  <TableRow key={s.partyId}>
                    <TableCell>{s.partyId}</TableCell>
                    <TableCell>{s.supplierName ?? '—'}</TableCell>
                    <TableCell align="right">{formatCurrency(s.lastPrice, s.currencyUomId)}</TableCell>
                    <TableCell align="right">{s.minimumOrderQuantity ?? '—'}</TableCell>
                    <TableCell>{s.currencyUomId ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Prices */}
      {product.prices?.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Bảng giá</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Loại giá</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Giá</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tiền tệ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.prices.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.productPriceTypeId}</TableCell>
                    <TableCell align="right">{formatCurrency(p.price, p.currencyUomId)}</TableCell>
                    <TableCell>{p.currencyUomId ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};
