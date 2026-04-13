import { type FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { logisticsApi } from '../../../api/logistics.api';
import { useAuthStore } from '../../../store/authStore';

const fmtNum = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN'); };
const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>{label}:</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export const FacilityDetailPage: FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [tab, setTab] = useState(0);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const { data: facility, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['facility-detail', facilityId],
    queryFn: () => logisticsApi.getFacilityDetail(facilityId!),
    enabled: !!facilityId,
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['facility-inventory', facilityId],
    queryFn: () => logisticsApi.listInventoryItems(0, 50, { facilityId: facilityId! }),
    enabled: !!facilityId && tab === 1,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['facility-roles-detail', facilityId],
    queryFn: () => logisticsApi.listFacilityPartyRoles(0, 100),
    enabled: !!facilityId && tab === 2,
  });

  const inventoryItems = inventoryData?.itemList ?? [];
  const allRoles = rolesData?.roleList ?? [];
  const facilityRoles = allRoles.filter(r => r.facilityId === facilityId);

  const canEdit = hasPermission('LOG_FACILITY_ADMIN');
  const canDelete = hasPermission('LOG_FACILITY_ADMIN');

  if (isLoading) return <Box sx={{ p: 3 }}><Skeleton height={40} /><Skeleton height={200} /></Box>;
  if (!facility) return <Box sx={{ p: 3 }}><Typography>Không tìm thấy kho {facilityId}</Typography></Box>;

  const storeIds = (facility.productStoreIds as string[]) ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Kho hàng', path: '/logistics/facilities' }, { label: String(facility.facilityName ?? facilityId) }]}
        actions={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && <Tooltip title="Sửa"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>}
            {canDelete && <Tooltip title="Xóa"><IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
            <Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        }
      />

      <Box sx={{ px: 2, pb: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông tin kho hàng</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5 }}>
            <InfoRow label="Mã kho" value={String(facility.facilityId ?? '—')} />
            <InfoRow label="Tên kho" value={String(facility.facilityName ?? '—')} />
            <InfoRow label="Chủ sở hữu" value={String(facility.ownerName ?? facility.ownerPartyId ?? '—')} />
            <InfoRow label="Trực thuộc" value={String(facility.parentFacilityName ?? facility.parentFacilityId ?? '—')} />
            <InfoRow label="Diện tích" value={facility.facilitySize != null ? `${facility.facilitySize} ${facility.facilitySizeUomId === 'AREA_m2' ? 'm²' : String(facility.facilitySizeUomId ?? '')}` : '—'} />
            <InfoRow label="Mô tả" value={String(facility.description ?? '—')} />
            <InfoRow label="Số điện thoại" value={String(facility.phoneNumber ?? '—')} />
            <InfoRow label="Địa chỉ" value={String(facility.address ?? '—')} />
            <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>Kênh bán hàng:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {storeIds.length > 0 ? storeIds.map(id => <Chip key={id} label={id} size="small" />) : <Typography variant="body2">—</Typography>}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Kho con" />
          <Tab label="Tồn kho" />
          <Tab label="Vai trò" />
        </Tabs>

        {tab === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Danh sách kho con trực thuộc (cần backend query parentFacilityId)
            </Typography>
          </Paper>
        )}

        {tab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tồn kho ({inventoryItems.length})</Typography>
            {inventoryItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Tồn kho</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Khả dụng</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{String(item.productId ?? '')}</Typography></TableCell>
                        <TableCell align="right">{fmtNum(item.quantityOnHandTotal as number)}</TableCell>
                        <TableCell align="right">{fmtNum(item.availableToPromiseTotal as number)}</TableCell>
                        <TableCell align="right">{item.unitCost != null ? fmtNum(item.unitCost as number) : '—'}</TableCell>
                        <TableCell>{String(item.statusId ?? '—')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Không có tồn kho</Typography>
            )}
          </Paper>
        )}

        {tab === 2 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Vai trò ({facilityRoles.length})</Typography>
            {facilityRoles.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tổ chức/Cá nhân</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày hiệu lực</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày hết hạn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {facilityRoles.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{String(r.partyName ?? r.partyId ?? '—')}</TableCell>
                        <TableCell>{String(r.roleTypeDescription ?? r.roleTypeId ?? '—')}</TableCell>
                        <TableCell>{fmtDate(r.fromDate as string)}</TableCell>
                        <TableCell>{fmtDate(r.thruDate as string)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Không có vai trò</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};
