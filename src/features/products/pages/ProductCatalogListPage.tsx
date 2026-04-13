import { type FC, useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Edit as EditIcon, Save as SaveIcon, Close as CancelIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useProductCatalogs } from '../hooks/useProducts';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient } from '../../../api/client';

interface Catalog {
  prodCatalogId: string;
  catalogName: string;
  useQuickAdd: string;
  categoryCount: number;
}

export const ProductCatalogListPage: FC = () => {
  const { data: catalogs = [], isLoading, isFetching, refetch } = useProductCatalogs();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Add catalog dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCatalogId, setNewCatalogId] = useState('');
  const [newCatalogName, setNewCatalogName] = useState('');

  const createCatalogMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/services/createProdCatalog', {
        prodCatalogId: newCatalogId,
        catalogName: newCatalogName,
      });
    },
    onSuccess: () => {
      showSuccess(`Tạo catalog ${newCatalogId} thành công`);
      setAddOpen(false);
      setNewCatalogId('');
      setNewCatalogName('');
      queryClient.invalidateQueries({ queryKey: ['product-catalogs'] });
    },
    onError: (err: Error) => showError(err.message || 'Lỗi tạo catalog'),
  });

  const startEdit = (cat: Catalog) => {
    setEditingId(cat.prodCatalogId);
    setEditName(cat.catalogName ?? '');
  };

  const saveEditMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/services/updateProdCatalog', {
        prodCatalogId: editingId,
        catalogName: editName,
      });
    },
    onSuccess: () => {
      showSuccess(`Cập nhật catalog ${editingId} thành công`);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['product-catalogs'] });
    },
    onError: (err: Error) => showError(err.message || 'Lỗi cập nhật catalog'),
  });

  const saveEdit = () => saveEditMutation.mutate();

  const columns: Column<Catalog>[] = [
    {
      key: 'prodCatalogId', label: 'Mã Catalog', width: 200,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.prodCatalogId}</Typography>,
    },
    {
      key: 'catalogName', label: 'Tên Catalog', width: 350,
      render: (row) => editingId === row.prodCatalogId ? (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <TextField size="small" fullWidth value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 } }} autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }} />
          <IconButton size="small" color="primary" onClick={saveEdit}><SaveIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setEditingId(null)}><CancelIcon fontSize="small" /></IconButton>
        </Box>
      ) : (
        <Typography variant="body2"
          onDoubleClick={() => startEdit(row)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, px: 0.5, borderRadius: 0.5 }}>
          {row.catalogName ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'useQuickAdd', label: 'Quick Add', width: 120,
      render: (row) => row.useQuickAdd === 'Y'
        ? <Chip label="Có" size="small" color="success" variant="outlined" />
        : <Chip label="Không" size="small" variant="outlined" />,
    },
    {
      key: 'categoryCount', label: 'Số danh mục', width: 120,
      render: (row) => <Typography variant="body2">{row.categoryCount}</Typography>,
    },
    {
      key: 'actions', label: '', width: 60,
      render: (row) => editingId !== row.prodCatalogId ? (
        <IconButton size="small" onClick={() => startEdit(row)}><EditIcon fontSize="small" /></IconButton>
      ) : null,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Sản phẩm' }, { label: 'Danh mục Catalog' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Thêm Catalog">
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
        rows={catalogs}
        rowKey={(row) => row.prodCatalogId}
        loading={isLoading || isFetching}
        emptyMessage="Không có catalog"
        columnStorageKey="product-catalogs"
      />

      {/* Add Catalog Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Catalog</DialogTitle>
        <DialogContent>
          <TextField label="Mã Catalog" size="small" fullWidth required sx={{ mt: 1, mb: 2 }}
            value={newCatalogId} onChange={(e) => setNewCatalogId(e.target.value.replace(/\s/g, ''))} />
          <TextField label="Tên Catalog" size="small" fullWidth required
            value={newCatalogName} onChange={(e) => setNewCatalogName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => createCatalogMutation.mutate()}
            disabled={!newCatalogId || !newCatalogName || createCatalogMutation.isPending}>
            {createCatalogMutation.isPending ? 'Đang tạo...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
