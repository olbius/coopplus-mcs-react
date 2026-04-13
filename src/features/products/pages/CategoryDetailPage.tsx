import { type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, Divider, Grid,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Folder as FolderIcon, Inventory as ProductIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { useCategoryDetail } from '../hooks/useProducts';

export const CategoryDetailPage: FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCategoryDetail(categoryId);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (error || !data?.category) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Không tìm thấy danh mục {categoryId}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Quay lại</Button>
      </Box>
    );
  }

  const { category, childCategories, products } = data;

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          { label: 'Mua sắm', href: '/po/products/categories' },
          { label: 'Danh mục SP', href: '/po/products/categories' },
          { label: category.productCategoryId },
        ]}
        actions={<Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} size="small">Quay lại</Button>}
      />

      {/* Category Info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Mã danh mục</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{category.productCategoryId}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Tên danh mục</Typography>
            <Typography variant="body1">{category.categoryName ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Loại</Typography>
            <Typography variant="body2">{category.productCategoryTypeId ? <Chip label={category.productCategoryTypeId} size="small" variant="outlined" /> : '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Danh mục cha</Typography>
            <Typography variant="body2">
              {category.primaryParentCategoryId
                ? <Chip label={category.primaryParentCategoryId} size="small" variant="outlined" clickable
                    onClick={() => navigate(`/po/products/categories/${category.primaryParentCategoryId}`)} />
                : '— (Danh mục gốc)'}
            </Typography>
          </Grid>
          {category.description && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">Mô tả</Typography>
              <Typography variant="body2">{category.description}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Split view: Children (left) | Products (right) */}
      <Grid container spacing={2}>
        {/* Left: Child Categories */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Danh mục con ({childCategories?.length ?? 0})
              </Typography>
            </Box>
            {childCategories?.length ? (
              <List dense sx={{ py: 0 }}>
                {childCategories.map((child) => (
                  <ListItem key={child.productCategoryId} disablePadding>
                    <ListItemButton onClick={() => navigate(`/po/products/categories/${child.productCategoryId}`)}>
                      <ListItemIcon sx={{ minWidth: 32 }}><FolderIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText
                        primary={child.categoryName ?? child.productCategoryId}
                        secondary={child.productCategoryId}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.disabled">Không có danh mục con</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Products in Category */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Sản phẩm trong danh mục ({products?.length ?? 0})
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Thứ tự</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products?.length ? products.map((p, idx) => (
                    <TableRow key={p.productId} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/po/products/${p.productId}`)}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.productCode ?? p.productId}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{p.productName ?? '—'}</Typography></TableCell>
                      <TableCell align="right">{p.sequenceNum ?? '—'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.disabled" sx={{ py: 4 }}>Không có sản phẩm</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
