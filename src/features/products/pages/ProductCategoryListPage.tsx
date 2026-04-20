import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, IconButton, Tooltip, TextField, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import {
  Add as AddIcon, Refresh as RefreshIcon, Edit as EditIcon,
  DriveFileMove as MoveIcon, Settings as ConfigIcon, Save as SaveIcon, Close as CancelIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useProductCategories } from '../hooks/useProducts';
import { useToast } from '../../../contexts/ToastContext';
import type { ProductCategory } from '../../../types/product.types';

export const ProductCategoryListPage: FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, isFetching, refetch } = useProductCategories();
  const { showInfo, showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ categoryName: string; description: string }>({ categoryName: '', description: '' });

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; category: ProductCategory } | null>(null);

  // Add category dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/services/createProductCategoryAndRollup', {
        productCategoryId: newCatId,
        categoryName: newCatName,
        longDescription: newCatDesc || undefined,
        productCategoryTypeId: 'CATALOG_CATEGORY',
      });
    },
    onSuccess: () => {
      showSuccess(`Tạo danh mục ${newCatId} thành công`);
      setAddOpen(false);
      setNewCatId(''); setNewCatName(''); setNewCatDesc('');
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
    onError: (err: Error) => showError(err.message || 'Lỗi tạo danh mục'),
  });

  const startEdit = (cat: ProductCategory) => {
    setEditingId(cat.productCategoryId);
    setEditValues({ categoryName: cat.categoryName ?? '', description: cat.description ?? '' });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = () => {
    showInfo(`Lưu danh mục ${editingId} đang được phát triển`);
    // TODO: Call updateCategoryAndRollupAjax service
    setEditingId(null);
  };

  const columns: Column<ProductCategory>[] = [
    {
      key: 'productCategoryId', label: 'Mã danh mục', width: 200,
      render: (row) => (
        <Link component="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}
          onClick={() => navigate(`/po/products/categories/${row.productCategoryId}`)}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, category: row }); }}>
          {row.productCategoryId}
        </Link>
      ),
    },
    {
      key: 'categoryName', label: 'Tên danh mục', width: 300,
      render: (row) => editingId === row.productCategoryId ? (
        <TextField size="small" fullWidth value={editValues.categoryName}
          onChange={(e) => setEditValues(prev => ({ ...prev, categoryName: e.target.value }))}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 } }} autoFocus />
      ) : (
        <Typography variant="body2"
          onDoubleClick={() => startEdit(row)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, px: 0.5, borderRadius: 0.5 }}>
          {row.categoryName ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'productCategoryTypeId', label: 'Loại', width: 180,
      render: (row) => row.productCategoryTypeId
        ? <Chip label={row.productCategoryTypeId} size="small" variant="outlined" />
        : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      key: 'description', label: 'Mô tả', width: 350,
      render: (row) => editingId === row.productCategoryId ? (
        <TextField size="small" fullWidth value={editValues.description}
          onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 } }} />
      ) : (
        <Typography variant="body2" noWrap
          onDoubleClick={() => startEdit(row)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, px: 0.5, borderRadius: 0.5 }}>
          {row.description ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'actions', label: '', width: 80,
      render: (row) => editingId === row.productCategoryId ? (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" color="primary" onClick={saveEdit}><SaveIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={cancelEdit}><CancelIcon fontSize="small" /></IconButton>
        </Box>
      ) : (
        <IconButton size="small" onClick={() => startEdit(row)}><EditIcon fontSize="small" /></IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Sản phẩm' }, { label: 'Danh mục SP' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm danh mục">
              <IconButton size="small" color="primary" onClick={() => setAddOpen(true)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới">
              <IconButton size="small" onClick={() => refetch()} disabled={isFetching}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <DataTable
        columns={columns}
        rows={categories}
        rowKey={(row) => row.productCategoryId}
        loading={isLoading || isFetching}
        emptyMessage="Không có danh mục sản phẩm"
        columnStorageKey="product-categories"
      />

      {/* Context Menu */}
      <Menu open={contextMenu !== null} onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
        <MenuItem onClick={() => { if (contextMenu) startEdit(contextMenu.category); setContextMenu(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAddOpen(true); setContextMenu(null); }}>
          <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Thêm danh mục con</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { showInfo('Di chuyển danh mục đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><MoveIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Di chuyển đến...</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Cấu hình danh mục đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><ConfigIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Cấu hình danh mục</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Category Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm danh mục sản phẩm</DialogTitle>
        <DialogContent>
          <TextField label="Mã danh mục" size="small" fullWidth required sx={{ mt: 1, mb: 2 }}
            value={newCatId} onChange={(e) => setNewCatId(e.target.value.replace(/\s/g, '').replace(/[^a-zA-Z0-9_-]/g, ''))}
            helperText="Không chứa ký tự đặc biệt, tối đa 60 ký tự" slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField label="Tên danh mục" size="small" fullWidth required sx={{ mb: 2 }}
            value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }} />
          <TextField label="Mô tả" size="small" fullWidth multiline rows={3}
            value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => createCategoryMutation.mutate()}
            disabled={!newCatId || !newCatName || createCategoryMutation.isPending}>
            {createCategoryMutation.isPending ? 'Đang tạo...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
