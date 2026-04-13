import { type FC, useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Print as PrintIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../../../types/product.types';
import { useToast } from '../../../contexts/ToastContext';

interface SelectedProduct {
  productId: string;
  productName: string;
  primaryProductCategoryId?: string;
}

export const ProductBarcodePage: FC = () => {
  const { showInfo, showError } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedKeyword(keyword); setPage(0); }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, isLoading, isFetching, refetch } = useProducts(page, pageSize, { productId: debouncedKeyword, productName: debouncedKeyword });
  const products = data?.productList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const handleAddProduct = () => {
    if (!selectedProductId) { showError('Vui lòng chọn sản phẩm'); return; }
    if (selectedProducts.find(p => p.productId === selectedProductId)) { showInfo('Sản phẩm đã có trong danh sách'); return; }
    const product = products.find(p => p.productId === selectedProductId);
    if (product) {
      setSelectedProducts(prev => [...prev, {
        productId: product.productId,
        productName: product.productName ?? '',
        primaryProductCategoryId: product.primaryProductCategoryId,
      }]);
    }
  };

  const handleRemoveSelected = () => {
    if (!selectedExportId) { showError('Vui lòng chọn sản phẩm cần xóa'); return; }
    setSelectedProducts(prev => prev.filter(p => p.productId !== selectedExportId));
    setSelectedExportId(null);
  };

  const handleExportPDF = () => {
    if (selectedProducts.length === 0) { showError('Vui lòng thêm sản phẩm vào danh sách in'); return; }

    // Matches old FO template: 2 columns of 8cm each, yellow border, barcode CODE128
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const cellWidth = 80; // 8cm per column (old: column-width="8cm")
    const cellHeight = 28; // ~2cm content + padding
    const borderWidth = 1.5; // old: border-width="1.5mm"
    const borderColor = '#FFDE15'; // old: border-color="#FFDE15"
    const startX = 15;
    const startY = 10;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getFullYear()).slice(-2)}`;

    let col = 0;
    let row = 0;

    selectedProducts.forEach((p) => {
      const x = startX + col * (cellWidth + 2);
      const y = startY + row * (cellHeight + 1);

      // Yellow border (old: border-color="#FFDE15" border-style="solid" border-width="1.5mm")
      doc.setDrawColor(borderColor);
      doc.setLineWidth(borderWidth);
      doc.rect(x, y, cellWidth, cellHeight);

      // Product name (old: font-size="10pt", top of cell)
      doc.setFontSize(9);
      doc.setTextColor('#000000');
      const name = p.productName.length > 35 ? p.productName.substring(0, 35) + '...' : p.productName;
      doc.text(name, x + 2, y + 5);

      // Date (old: format ddMMyy, bottom-left)
      doc.setFontSize(6);
      doc.text(dateStr, x + 2, y + cellHeight - 3);

      // Barcode (old: code128, height=16mm, module-width=0.25mm, right side)
      const canvas = document.createElement('canvas');
      try {
        JsBarcode(canvas, p.productId, {
          format: 'CODE128',
          width: 1,
          height: 50,
          displayValue: true,
          fontSize: 10,
          margin: 1,
          textMargin: 1,
        });
        const barcodeX = x + 43; // old: first column 43mm, barcode in second column 32mm
        const barcodeWidth = 32;
        const barcodeHeight = 18;
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', barcodeX, y + 7, barcodeWidth, barcodeHeight);
      } catch {
        doc.setFontSize(8);
        doc.text(p.productId, x + 45, y + 16);
      }

      // Next position (2 columns)
      col++;
      if (col >= 2) {
        col = 0;
        row++;
      }

      // New page
      if (startY + (row + 1) * (cellHeight + 1) > 285) {
        doc.addPage();
        col = 0;
        row = 0;
      }
    });

    doc.save(`barcodes_${now.toISOString().slice(0, 10)}.pdf`);
  };

  const findColumns: Column<Product>[] = [
    {
      key: 'productId', label: 'Mã SP', width: 140,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.productId}</Typography>,
      filterRender: () => (
        <TextField size="small" variant="standard" placeholder="Tìm..."
          value={keyword} onChange={(e) => setKeyword(e.target.value)} fullWidth
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
      ),
    },
    {
      key: 'primaryProductCategoryId', label: 'Danh mục', width: 120,
      render: (row) => <Typography variant="body2">{row.primaryProductCategoryId ?? '—'}</Typography>,
    },
    {
      key: 'productName', label: 'Tên SP', width: 250,
      render: (row) => <Typography variant="body2" noWrap>{row.productName ?? '—'}</Typography>,
    },
    {
      key: 'productTypeId', label: 'Loại', width: 120,
      render: (row) => <Typography variant="body2">{row.productTypeId ?? '—'}</Typography>,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader breadcrumbs={[{ label: 'Mua sắm' }, { label: 'Sản phẩm' }, { label: 'In mã vạch SP' }]} />

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, minHeight: 0 }}>
        {/* Left: Product Find */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Chọn sản phẩm</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Thêm vào danh sách in">
                <span>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddProduct} disabled={!selectedProductId}>
                    Thêm
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Làm mới">
                <IconButton size="small" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <DataTable
            columns={findColumns}
            rows={products}
            rowKey={(row) => row.productId}
            loading={isLoading || isFetching}
            total={total}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
            emptyMessage="Không tìm thấy sản phẩm"
            filtersVisible={true}
            onRowClick={(row) => setSelectedProductId(row.productId)}
            selectedRowKey={selectedProductId}
            columnStorageKey="barcode-find"
          />
        </Box>

        {/* Right: Selected Products */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Danh sách in <Chip label={selectedProducts.length} size="small" sx={{ ml: 0.5 }} />
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Xóa SP đã chọn">
                <span>
                  <IconButton size="small" color="error" onClick={handleRemoveSelected} disabled={!selectedExportId}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Button size="small" variant="contained" startIcon={<PrintIcon />}
                onClick={handleExportPDF} disabled={selectedProducts.length === 0}>
                Xuất PDF
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên SP</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.disabled" sx={{ py: 4 }}>
                        Chọn sản phẩm bên trái rồi nhấn "Thêm"
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : selectedProducts.map((p) => (
                  <TableRow key={p.productId} hover
                    onClick={() => setSelectedExportId(p.productId)}
                    selected={selectedExportId === p.productId}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.productId}</Typography></TableCell>
                    <TableCell><Typography variant="body2" noWrap>{p.productName}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{p.primaryProductCategoryId ?? '—'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};
