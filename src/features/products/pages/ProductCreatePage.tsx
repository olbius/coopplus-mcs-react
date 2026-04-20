import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box, Paper, TextField, Button, Typography, Autocomplete, Grid, Divider,
  ImageList, ImageListItem, ImageListItemBar, IconButton as MuiIconButton,
} from '@mui/material';
import { ArrowBack, Save as SaveIcon, PlaylistAdd as SaveContinueIcon, AddPhotoAlternate, Close as CloseIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient } from '../../../api/client';

interface LookupItem { [key: string]: string }

// Product type options matching old system: productTypeTuyp2Id
const PRODUCT_TYPE_OPTIONS = [
  { id: 'PROD_CONGTY', label: 'Sản phẩm công ty' },
  { id: 'PROD_THUHO', label: 'Sản phẩm thu hộ' },
  { id: 'PROD_CHOTHUE', label: 'Sản phẩm cho thuê' },
];

export const ProductCreatePage: FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Form state — 3-column layout matching productNewInfo.ftl
  const [form, setForm] = useState({
    // Column 1
    productTypeTuyp2Id: 'PROD_CONGTY',
    inventoryItemTypeId: '',
    longDescription: '',
    // Column 2
    productCode: '',
    productName: '',
    barcode: '',
    brandName: '',
    primaryProductCategoryId: '',
    productCategoryIds: [] as string[],
    taxProductCategoryId: '',
    // Column 3
    productWeight: '',
    weight: '',
    weightUomId: '',
    quantityUomId: '',
    productListPrice: '',
    productDefaultPrice: '',
    currencyUomId: 'VND',
  });

  // Image state
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});

  const setField = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Load lookups
  const { data: lookups } = useQuery({
    queryKey: ['product-form-lookups'],
    queryFn: async () => {
      const res = await apiClient.post('/services/getProductFormLookups', { _dummy: '1' });
      return res.data?.data ?? {};
    },
  });

  const catalogCategories: LookupItem[] = lookups?.catalogCategories ?? [];
  const taxCategories: LookupItem[] = lookups?.taxCategories ?? [];
  const weightUoms: LookupItem[] = lookups?.weightUoms ?? [];
  const quantityUoms: LookupItem[] = lookups?.quantityUoms ?? [];
  const currencyUoms: LookupItem[] = lookups?.currencyUoms ?? [];
  const brands: LookupItem[] = lookups?.brands ?? [];

  // Derive actual productTypeId from productTypeTuyp2Id (same logic as old Java)
  const getProductTypeId = () => {
    if (form.productTypeTuyp2Id === 'PROD_THUHO' || form.productTypeTuyp2Id === 'PROD_CHOTHUE') return 'PRODUCT_SERVICE';
    return 'FINISHED_GOOD';
  };

  // Submit — uses FormData multipart to support image upload via OFBiz Content system
  // createProductAdvance accepts largeImage, smallImage, additionalImage1-4 as ByteBuffer
  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('productTypeId', getProductTypeId());
      formData.append('isVirtual', 'N');
      formData.append('isVariant', 'N');
      if (form.productCode) formData.append('productId', form.productCode);
      formData.append('productName', form.productName);
      formData.append('internalName', form.productName);
      if (form.longDescription) formData.append('longDescription', form.longDescription);
      if (form.primaryProductCategoryId) formData.append('primaryProductCategoryId', form.primaryProductCategoryId);
      if (form.productCategoryIds.length) {
        form.productCategoryIds.forEach(id => formData.append('productCategoryIds', id));
      }
      if (form.taxProductCategoryId) formData.append('taxProductCategoryId', form.taxProductCategoryId);
      formData.append('quantityUomId', form.quantityUomId || (getProductTypeId() === 'PRODUCT_SERVICE' ? 'PP_SERVICE' : ''));
      if (form.weightUomId) formData.append('weightUomId', form.weightUomId);
      if (form.currencyUomId) formData.append('currencyUomId', form.currencyUomId);
      if (form.productWeight) formData.append('productWeight', form.productWeight);
      if (form.productDefaultPrice) formData.append('productDefaultPrice', form.productDefaultPrice);
      if (form.productListPrice) formData.append('productListPrice', form.productListPrice);
      if (form.barcode) formData.append('barcode', form.barcode);
      formData.append('taxInPrice', 'N');

      // Append image files — OFBiz expects field name + _fileName + _contentType
      const imageMap: Record<string, string> = {
        largeImage: 'largeImage',
        smallImage: 'smallImage',
        additional1: 'additionalImage1',
        additional2: 'additionalImage2',
        additional3: 'additionalImage3',
        additional4: 'additionalImage4',
      };
      for (const [key, paramName] of Object.entries(imageMap)) {
        const file = imageFiles[key];
        if (file) {
          formData.append(paramName, file);
          formData.append(`_${paramName}_fileName`, file.name);
          formData.append(`_${paramName}_contentType`, file.type);
        }
      }

      const res = await apiClient.post('/services/createProductAdvance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: (data) => {
      const pid = data?.productId || '';
      showSuccess(`Tạo sản phẩm thành công: ${pid}`);
      navigate(`/po/products/${pid}`);
    },
    onError: (err: Error) => showError(err.message || 'Lỗi tạo sản phẩm'),
  });

  const handleSaveAndContinue = () => {
    createMutation.mutate(undefined, {
      onSuccess: () => {
        setForm(prev => ({
          ...prev,
          productCode: '', productName: '', barcode: '', longDescription: '',
          productWeight: '', weight: '', productDefaultPrice: '', productListPrice: '',
        }));
        setImages({});
        setImageFiles({});
      },
    });
  };

  const isService = form.productTypeTuyp2Id !== 'PROD_CONGTY';

  return (
    <Box>
      <PageHeader
        breadcrumbs={[{ label: 'Mua sắm', path: '/po/products' }, { label: 'Sản phẩm', path: '/po/products' }, { label: 'Tạo mới sản phẩm' }]}
        actions={<Button startIcon={<ArrowBack />} onClick={() => navigate('/po/products')} size="small">Quay lại</Button>}
      />

      {/* Main form: 3-column layout matching productNewInfo.ftl */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>

          {/* ══════ Column 1 (Left) ══════ */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Loại sản phẩm */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" >Loại sản phẩm <span style={{color:'red'}}>*</span></Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <Autocomplete size="small" disableClearable
                  options={PRODUCT_TYPE_OPTIONS}
                  getOptionLabel={(o) => o.label}
                  value={PRODUCT_TYPE_OPTIONS.find(t => t.id === form.productTypeTuyp2Id) || PRODUCT_TYPE_OPTIONS[0]}
                  onChange={(_, val) => setField('productTypeTuyp2Id', val?.id ?? 'PROD_CONGTY')}
                  renderInput={(params) => <TextField {...params} />} />
              </Grid>
            </Grid>

            {/* Mô tả */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Mô tả</Typography>
              <TextField size="small" fullWidth multiline rows={4} value={form.longDescription}
                onChange={(e) => setField('longDescription', e.target.value)} />
            </Box>
          </Grid>

          {/* ══════ Column 2 (Middle) ══════ */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Mã sản phẩm */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Mã sản phẩm</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <TextField size="small" fullWidth value={form.productCode}
                  onChange={(e) => setField('productCode', e.target.value.replace(/\s/g, ''))}
                  placeholder="Tự động nếu để trống" />
              </Grid>
            </Grid>
            {/* Tên sản phẩm * */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" >Tên sản phẩm <span style={{color:'red'}}>*</span></Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <TextField size="small" fullWidth value={form.productName}
                  onChange={(e) => setField('productName', e.target.value)} />
              </Grid>
            </Grid>
            {/* Mã vạch */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Mã vạch</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <TextField size="small" fullWidth value={form.barcode}
                  onChange={(e) => setField('barcode', e.target.value)} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            {/* Thương hiệu */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Thương hiệu</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <Autocomplete size="small" options={brands} getOptionLabel={(o) => o.groupName ?? ''}
                  onChange={(_, val) => setField('brandName', val?.partyId ?? '')}
                  renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
              </Grid>
            </Grid>
            {/* Danh mục chính */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Danh mục chính</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <Autocomplete size="small" options={catalogCategories}
                  getOptionLabel={(o) => o.categoryName ?? o.productCategoryId ?? ''}
                  value={catalogCategories.find(c => c.productCategoryId === form.primaryProductCategoryId) || null}
                  onChange={(_, val) => setField('primaryProductCategoryId', val?.productCategoryId ?? '')}
                  renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
              </Grid>
            </Grid>
            {/* Danh mục khác */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Danh mục khác</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <Autocomplete size="small" multiple options={catalogCategories}
                  getOptionLabel={(o) => o.categoryName ?? o.productCategoryId ?? ''}
                  onChange={(_, val) => setField('productCategoryIds', val.map(v => v.productCategoryId))}
                  renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
              </Grid>
            </Grid>
            {/* Danh mục thuế */}
            {!isService && (
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Danh mục thuế</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <Autocomplete size="small" options={taxCategories}
                    getOptionLabel={(o) => o.categoryName ?? o.productCategoryId ?? ''}
                    value={taxCategories.find(c => c.productCategoryId === form.taxProductCategoryId) || null}
                    onChange={(_, val) => setField('taxProductCategoryId', val?.productCategoryId ?? '')}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* ══════ Column 3 (Right) ══════ */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Weight fields — hidden for service products */}
            {!isService && (
              <>
                {/* KL tịnh */}
                <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">KL tịnh</Typography></Grid>
                  <Grid size={{ xs: 8 }}>
                    <TextField size="small" fullWidth type="number" value={form.productWeight}
                      onChange={(e) => setField('productWeight', e.target.value)} />
                  </Grid>
                </Grid>
                {/* KL sau đóng gói */}
                <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">KL sau đóng gói</Typography></Grid>
                  <Grid size={{ xs: 8 }}>
                    <TextField size="small" fullWidth type="number" value={form.weight}
                      onChange={(e) => setField('weight', e.target.value)} />
                  </Grid>
                </Grid>
                {/* Đơn vị KL */}
                <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Đơn vị KL</Typography></Grid>
                  <Grid size={{ xs: 8 }}>
                    <Autocomplete size="small" options={weightUoms} getOptionLabel={(o) => o.description ?? o.uomId ?? ''}
                      value={weightUoms.find(u => u.uomId === form.weightUomId) || null}
                      onChange={(_, val) => setField('weightUomId', val?.uomId ?? '')}
                      renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            {/* Đơn vị cơ bản * */}
            {!isService && (
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" >Đơn vị cơ bản <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <Autocomplete size="small" options={quantityUoms} getOptionLabel={(o) => o.description ?? o.uomId ?? ''}
                    value={quantityUoms.find(u => u.uomId === form.quantityUomId) || null}
                    onChange={(_, val) => setField('quantityUomId', val?.uomId ?? '')}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
                </Grid>
              </Grid>
            )}
            {/* Giá niêm yết * */}
            {!isService && (
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" >Giá niêm yết <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth type="number" value={form.productListPrice}
                    onChange={(e) => setField('productListPrice', e.target.value)} />
                </Grid>
              </Grid>
            )}
            {/* Giá mặc định * */}
            {!isService && (
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right" >Giá mặc định <span style={{color:'red'}}>*</span></Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField size="small" fullWidth type="number" value={form.productDefaultPrice}
                    onChange={(e) => setField('productDefaultPrice', e.target.value)} />
                </Grid>
              </Grid>
            )}
            {/* Đơn vị tiền tệ */}
            {!isService && (
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography variant="body2" textAlign="right">Đơn vị tiền tệ</Typography></Grid>
                <Grid size={{ xs: 8 }}>
                  <Autocomplete size="small" options={currencyUoms}
                    getOptionLabel={(o) => `${o.uomId} - ${o.description ?? ''}`}
                    value={currencyUoms.find(u => u.uomId === form.currencyUomId) || null}
                    onChange={(_, val) => setField('currencyUomId', val?.uomId ?? 'VND')}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn" />} />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Image upload + Supplier section — matching productNewTotal.ftl layout */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {/* Left: Images (span4 in old system) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Hình ảnh sản phẩm</Typography>
            <ImageList cols={3} gap={8} sx={{ mt: 0 }}>
              {[
                { key: 'largeImage', label: 'Ảnh lớn' },
                { key: 'smallImage', label: 'Ảnh nhỏ' },
                { key: 'additional1', label: 'Ảnh khác 1' },
                { key: 'additional2', label: 'Ảnh khác 2' },
                { key: 'additional3', label: 'Ảnh khác 3' },
                { key: 'additional4', label: 'Ảnh khác 4' },
              ].map((img) => {
                const preview = (images as Record<string, string>)[img.key];
                return (
                  <ImageListItem key={img.key} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                    {preview ? (
                      <>
                        <img src={preview} alt={img.label} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                        <MuiIconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                          onClick={() => { setImages(prev => ({ ...prev, [img.key]: '' })); setImageFiles(prev => ({ ...prev, [img.key]: null })); }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </MuiIconButton>
                      </>
                    ) : (
                      <Box sx={{ width: '100%', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', cursor: 'pointer' }}
                        onClick={() => document.getElementById(`file-${img.key}`)?.click()}>
                        <AddPhotoAlternate sx={{ fontSize: 28, color: 'text.disabled' }} />
                      </Box>
                    )}
                    <input type="file" id={`file-${img.key}`} accept="image/*" hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFiles(prev => ({ ...prev, [img.key]: file }));
                          const reader = new FileReader();
                          reader.onload = (ev) => setImages(prev => ({ ...prev, [img.key]: ev.target?.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }} />
                    <ImageListItemBar title={img.label} sx={{ '& .MuiImageListItemBar-title': { fontSize: '0.7rem' } }} />
                  </ImageListItem>
                );
              })}
            </ImageList>
          </Grid>

          {/* Right: Supplier placeholder (span8 in old system) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Nhà cung cấp</Typography>
            <Typography variant="body2" color="text.secondary">
              Thông tin nhà cung cấp sẽ được thêm sau khi tạo sản phẩm.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons — matching old system: Lưu + Lưu & Tiếp tục */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
        <Button variant="contained" color="primary" startIcon={<SaveIcon />}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !form.productName || (!isService && !form.quantityUomId)}>
          {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
        <Button variant="contained" color="success" startIcon={<SaveContinueIcon />}
          onClick={handleSaveAndContinue}
          disabled={createMutation.isPending || !form.productName || (!isService && !form.quantityUomId)}>
          Lưu & Tiếp tục
        </Button>
      </Box>
    </Box>
  );
};
