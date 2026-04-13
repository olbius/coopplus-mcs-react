import { type FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Link, TextField, IconButton, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Chip, Autocomplete, Checkbox,
} from '@mui/material';
import {
  Refresh as RefreshIcon, FilterList as FilterIcon, FilterListOff as FilterOffIcon,
  Add as AddIcon, FileDownload as ExcelIcon,
  OpenInNew as OpenNewTabIcon, Visibility as ViewIcon, Edit as EditIcon,
  ContentCopy as CloneIcon, Block as DiscontinueIcon, PlayArrow as ContinueIcon,
  CheckBoxOutlineBlank, CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../../../contexts/ToastContext';
import type { Product } from '../../../types/product.types';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
};

const getProductState = (product: Product): { label: string; color: 'success' | 'error' | 'warning' } => {
  const p = product as Product & { salesDiscontinuationDate?: string; purchaseDiscontinuationDate?: string; isDeactive?: string };
  if (p.isDeactive === 'Y') return { label: 'Ngừng hoạt động', color: 'error' };
  const now = Date.now();
  const salesDisc = p.salesDiscontinuationDate ? new Date(p.salesDiscontinuationDate).getTime() : null;
  const purchDisc = p.purchaseDiscontinuationDate ? new Date(p.purchaseDiscontinuationDate).getTime() : null;
  if (salesDisc && salesDisc < now && purchDisc && purchDisc < now) return { label: 'Ngừng bán & mua', color: 'error' };
  if (salesDisc && salesDisc < now) return { label: 'Ngừng bán', color: 'warning' };
  if (purchDisc && purchDisc < now) return { label: 'Ngừng mua', color: 'warning' };
  return { label: 'Hoạt động', color: 'success' };
};

const DEACTIVE_OPTIONS = [
  { value: 'Y', label: 'Ngừng hoạt động' },
  { value: 'N', label: 'Hoạt động' },
];

const STATE_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'disc_sales', label: 'Ngừng bán' },
  { value: 'disc_purchase', label: 'Ngừng mua' },
  { value: 'disc_both', label: 'Ngừng bán & mua' },
];

// Reusable checklist filter component
const ChecklistFilter: FC<{
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ options, selected, onChange }) => (
  <Autocomplete
    multiple size="small" disableCloseOnSelect options={options}
    getOptionLabel={(o) => o.label}
    value={options.filter((o) => selected.includes(o.value))}
    onChange={(_, sel) => onChange(sel.map((s) => s.value))}
    renderOption={(props, option, { selected: sel }) => {
      const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
      return (
        <li key={key} {...rest}>
          <Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />} checked={sel} sx={{ mr: 0.5, p: 0 }} />
          <Typography variant="body2">{option.label}</Typography>
        </li>
      );
    }}
    renderInput={(params) => (
      <TextField {...params} variant="standard" placeholder="Lọc..." />
    )}
    sx={{ minWidth: 0 }}
  />
);

export const ProductListPage: FC = () => {
  const navigate = useNavigate();
  const { showInfo } = useToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Per-column filter state
  const [filterProductId, setFilterProductId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProductName, setFilterProductName] = useState('');
  const [filterDeactive, setFilterDeactive] = useState<string[]>([]);
  const [filterState, setFilterState] = useState<string[]>([]);

  // Debounced text filters
  const [debouncedTexts, setDebouncedTexts] = useState({ productId: '', category: '', productName: '' });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTexts({ productId: filterProductId, category: filterCategory, productName: filterProductName });
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterProductId, filterCategory, filterProductName]);

  // Build server-side filters
  const activeFilters = {
    productId: debouncedTexts.productId || undefined,
    productName: debouncedTexts.productName || undefined,
    productCategoryId: debouncedTexts.category || undefined,
    isDeactive: filterDeactive.length === 1 ? filterDeactive[0] : undefined,
    stateFilter: filterState.length === 1 ? filterState[0] : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useProducts(page, pageSize, activeFilters);
  const products = data?.productList ?? [];
  const total = Number(data?.totalRows ?? 0);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; product: Product } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, product });
  }, []);

  const hasActiveFilters = !!(filterProductId || filterCategory || filterProductName || filterDeactive.length || filterState.length);

  const handleClearFilters = () => {
    setFilterProductId(''); setFilterCategory(''); setFilterProductName('');
    setFilterDeactive([]); setFilterState([]);
    setPage(0);
  };

  const handleExportExcel = () => showInfo('Xuất Excel đang được phát triển');

  const columns: Column<Product>[] = [
    {
      key: 'productId', label: 'Mã SP', sortable: true, width: 140,
      render: (row) => (
        <Link component="button" variant="body2"
          onClick={() => navigate(`/po/products/${row.productId}`)}
          onContextMenu={(e) => handleContextMenu(e, row)}
          sx={{ textAlign: 'left', fontWeight: 600 }}>
          {row.productId}
        </Link>
      ),
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm mã SP..."
          value={filterProductId} onChange={(e) => setFilterProductId(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'primaryProductCategoryId', label: 'Danh mục', width: 140,
      render: (row) => <Typography variant="body2">{row.primaryProductCategoryId ?? '—'}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm danh mục..."
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'productName', label: 'Tên sản phẩm', width: 250,
      render: (row) => (
        <Typography variant="body2" noWrap onContextMenu={(e) => handleContextMenu(e, row)}>
          {row.productName ?? '—'}
        </Typography>
      ),
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm tên SP..."
          value={filterProductName} onChange={(e) => setFilterProductName(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'internalName', label: 'Tên nội bộ', width: 180,
      render: (row) => <Typography variant="body2" noWrap>{row.internalName ?? '—'}</Typography>,
    },
    {
      key: 'productTypeId', label: 'Loại', width: 130,
      render: (row) => <Typography variant="body2">{row.productTypeId ?? '—'}</Typography>,
    },
    {
      key: 'isDeactive', label: 'Ngừng HĐ', width: 130,
      render: (row) => {
        const p = row as Product & { isDeactive?: string };
        return p.isDeactive === 'Y'
          ? <Chip label="Ngừng HĐ" size="small" color="error" variant="outlined" />
          : <Typography variant="body2" color="text.disabled">—</Typography>;
      },
      filterRender: () => (
        <ChecklistFilter options={DEACTIVE_OPTIONS} selected={filterDeactive}
          onChange={(v) => { setFilterDeactive(v); setPage(0); }} />
      ),
    },
    {
      key: 'productState', label: 'Trạng thái', width: 160,
      render: (row) => {
        const state = getProductState(row);
        return <Chip label={state.label} size="small" variant="outlined" color={state.color} />;
      },
      filterRender: () => (
        <ChecklistFilter options={STATE_OPTIONS} selected={filterState}
          onChange={(v) => { setFilterState(v); setPage(0); }} />
      ),
    },
    {
      key: 'createdDate', label: 'Ngày tạo', width: 110,
      render: (row) => <Typography variant="body2">{formatDate(row.createdDate)}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Sản phẩm' }, { label: 'Danh sách SP' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Tạo mới sản phẩm">
              <IconButton size="small" color="primary" onClick={() => navigate('/po/products/new')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <IconButton size="small" onClick={handleExportExcel}>
                <ExcelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Xóa tất cả bộ lọc">
                <IconButton size="small" onClick={handleClearFilters}>
                  <FilterOffIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}>
              <IconButton size="small" onClick={() => setFiltersVisible(!filtersVisible)}>
                <FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} />
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
        rows={products}
        rowKey={(row) => row.productId}
        loading={isLoading || isFetching}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        emptyMessage="Không tìm thấy sản phẩm"
        filtersVisible={filtersVisible}
        onRowClick={(row) => navigate(`/po/products/${row.productId}`)}
        columnStorageKey="po-products"
      />

      {/* Right-Click Context Menu */}
      <Menu open={contextMenu !== null} onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
        <MenuItem onClick={() => { window.open(`/po/products/${contextMenu?.product.productId}`, '_blank'); setContextMenu(null); }}>
          <ListItemIcon><OpenNewTabIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết (tab mới)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/po/products/${contextMenu?.product.productId}`); setContextMenu(null); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Chỉnh sửa đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa sản phẩm</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Tạo SP tương tự đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><CloneIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Tạo SP tương tự</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { showInfo('Ngừng bán đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><DiscontinueIcon fontSize="small" color="warning" /></ListItemIcon>
          <ListItemText>Ngừng bán</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Ngừng mua đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><DiscontinueIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Ngừng mua</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Tiếp tục bán đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><ContinueIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Tiếp tục bán</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { showInfo('Tiếp tục mua đang được phát triển'); setContextMenu(null); }}>
          <ListItemIcon><ContinueIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Tiếp tục mua</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { refetch(); setContextMenu(null); }}>
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Làm mới</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};
