import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, Paper, TextField, Button, Stepper, Step, StepLabel, MenuItem } from '@mui/material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { actionsApi } from '../../../../api/actions.api';
import { useToast } from '../../../../contexts/ToastContext';

const YES_NO = [{ value: 'N', label: 'Không' }, { value: 'Y', label: 'Có' }];

export const CreateRetailStorePage: FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  // Basic info
  const [productStoreId, setProductStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [includeOtherCustomer, setIncludeOtherCustomer] = useState('N');
  const [prodCatalogId, setProdCatalogId] = useState('');
  const [vatTaxAuthPartyId, setVatTaxAuthPartyId] = useState('');
  const [vatTaxAuthGeoId, setVatTaxAuthGeoId] = useState('');
  const [defaultCurrencyUomId, setDefaultCurrencyUomId] = useState('VND');
  const [reserveOrderEnumId, setReserveOrderEnumId] = useState('');

  // Roles
  const [managerId, setManagerId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');

  // Address
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [countryGeoId, setCountryGeoId] = useState('VNM');
  const [provinceGeoId, setProvinceGeoId] = useState('');
  const [districtGeoId, setDistrictGeoId] = useState('');
  const [wardGeoId, setWardGeoId] = useState('');

  const canNext = productStoreId && storeName && prodCatalogId && defaultCurrencyUomId && phoneNumber && address;

  const createMut = useMutation({
    mutationFn: () => actionsApi.quickCreateRetailStore({
      productStoreId, storeName, defaultCurrencyUomId, prodCatalogId,
      includeOtherCustomer, vatTaxAuthPartyId, vatTaxAuthGeoId, reserveOrderEnumId,
      managerId, salesmanId, countryGeoId, provinceGeoId, districtGeoId, wardGeoId,
      phoneNumber, address,
    }),
    onSuccess: () => { showSuccess(`Tạo cửa hàng ${productStoreId} thành công`); navigate('/sales/settings/stores'); },
    onError: (err: Error) => showError(err.message || 'Lỗi tạo cửa hàng'),
  });

  const reqLabel = (text: string) => <>{text} <span style={{ color: 'red' }}>*</span></>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Tạo cửa hàng nhanh' }]} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step><StepLabel>Thông tin chung</StepLabel></Step>
          <Step><StepLabel>Xác nhận</StepLabel></Step>
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Basic Info */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Thông tin cơ bản</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField size="small" label={reqLabel('Mã cửa hàng')} value={productStoreId}
                  onChange={(e) => setProductStoreId(e.target.value)} required slotProps={{ htmlInput: { maxLength: 20 } }} />
                <TextField size="small" label="Cơ quan thuế (Party)" value={vatTaxAuthPartyId}
                  onChange={(e) => setVatTaxAuthPartyId(e.target.value)} />
                <TextField size="small" label={reqLabel('Tên cửa hàng')} value={storeName}
                  onChange={(e) => setStoreName(e.target.value)} required slotProps={{ htmlInput: { maxLength: 100 } }} />
                <TextField size="small" label="Cơ quan thuế (Geo)" value={vatTaxAuthGeoId}
                  onChange={(e) => setVatTaxAuthGeoId(e.target.value)} />
                <TextField size="small" label="Bao gồm KH kênh khác" select value={includeOtherCustomer}
                  onChange={(e) => setIncludeOtherCustomer(e.target.value)}>
                  {YES_NO.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <TextField size="small" label={reqLabel('Tiền tệ')} value={defaultCurrencyUomId}
                  onChange={(e) => setDefaultCurrencyUomId(e.target.value)} required />
                <TextField size="small" label={reqLabel('Catalog')} value={prodCatalogId}
                  onChange={(e) => setProdCatalogId(e.target.value)} required />
                <TextField size="small" label="Thứ tự ưu tiên tồn kho" value={reserveOrderEnumId}
                  onChange={(e) => setReserveOrderEnumId(e.target.value)} />
              </Box>
            </Paper>

            {/* Roles */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Vai trò</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField size="small" label={reqLabel('Quản lý')} value={managerId}
                  onChange={(e) => setManagerId(e.target.value)} placeholder="Mã nhân viên" />
                <TextField size="small" label={reqLabel('Nhân viên bán hàng')} value={salesmanId}
                  onChange={(e) => setSalesmanId(e.target.value)} placeholder="Mã nhân viên" />
              </Box>
            </Paper>

            {/* Address */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Địa chỉ</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField size="small" label={reqLabel('Quốc gia')} value={countryGeoId}
                  onChange={(e) => setCountryGeoId(e.target.value)} required />
                <TextField size="small" label={reqLabel('Số điện thoại')} value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)} required />
                <TextField size="small" label={reqLabel('Tỉnh/Thành phố')} value={provinceGeoId}
                  onChange={(e) => setProvinceGeoId(e.target.value)} required />
                <TextField size="small" label={reqLabel('Địa chỉ')} value={address}
                  onChange={(e) => setAddress(e.target.value)} required multiline rows={3}
                  slotProps={{ htmlInput: { maxLength: 250 } }} />
                <TextField size="small" label={reqLabel('Quận/Huyện')} value={districtGeoId}
                  onChange={(e) => setDistrictGeoId(e.target.value)} required />
                <Box />
                <TextField size="small" label={reqLabel('Phường/Xã')} value={wardGeoId}
                  onChange={(e) => setWardGeoId(e.target.value)} required />
              </Box>
            </Paper>
          </Box>
        )}

        {activeStep === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Xác nhận thông tin cửa hàng</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 1, columnGap: 2 }}>
              <Typography variant="body2" color="text.secondary">Mã cửa hàng:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{productStoreId}</Typography>
              <Typography variant="body2" color="text.secondary">Tên cửa hàng:</Typography>
              <Typography variant="body2">{storeName}</Typography>
              <Typography variant="body2" color="text.secondary">Tiền tệ:</Typography>
              <Typography variant="body2">{defaultCurrencyUomId}</Typography>
              <Typography variant="body2" color="text.secondary">Catalog:</Typography>
              <Typography variant="body2">{prodCatalogId}</Typography>
              <Typography variant="body2" color="text.secondary">Quản lý:</Typography>
              <Typography variant="body2">{managerId || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">NV bán hàng:</Typography>
              <Typography variant="body2">{salesmanId || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Điện thoại:</Typography>
              <Typography variant="body2">{phoneNumber}</Typography>
              <Typography variant="body2" color="text.secondary">Địa chỉ:</Typography>
              <Typography variant="body2">{address}</Typography>
            </Box>
          </Paper>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={() => setActiveStep(0)}>Quay lại</Button>
          )}
          {activeStep === 0 && (
            <Button variant="contained" disabled={!canNext} onClick={() => setActiveStep(1)}>Tiếp theo</Button>
          )}
          {activeStep === 1 && (
            <Button variant="contained" color="success" disabled={createMut.isPending}
              onClick={() => createMut.mutate()}>
              {createMut.isPending ? 'Đang tạo...' : 'Hoàn tất'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
