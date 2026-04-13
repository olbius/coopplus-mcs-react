import { type FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { apiClient } from '../../../api/client';

interface OFBizResponse<T> { statusCode: string; data: T; }

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>{label}:</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

const fetchPartyDetail = async (partyId: string) => {
  // Use listParties with the partyId as keyword to get basic info
  const res = await apiClient.post<OFBizResponse<{ partyList: Record<string, unknown>[]; totalRows: string }>>(
    '/services/listParties', { pageIndex: '0', pageSize: '1', keyword: partyId },
  );
  const parties = res.data?.data?.partyList ?? [];
  // Find exact match
  const party = parties.find(p => p.partyId === partyId) ?? parties[0];
  return party ?? null;
};

const fetchCustomerOrders = async (partyId: string) => {
  const res = await apiClient.post<OFBizResponse<{ orderList: Record<string, unknown>[]; totalRows: string }>>(
    '/services/listSalesOrder', { pageIndex: '0', pageSize: '10', billToPartyId: partyId, orderTypeId: 'SALES_ORDER' },
  );
  return res.data?.data?.orderList ?? [];
};

export const CustomerDetailPage: FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const [tab, setTab] = useState(0);

  const { data: party, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customer-detail', partyId],
    queryFn: () => fetchPartyDetail(partyId!),
    enabled: !!partyId,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['customer-orders', partyId],
    queryFn: () => fetchCustomerOrders(partyId!),
    enabled: !!partyId && tab === 1,
  });

  if (isLoading) return <Box sx={{ p: 3 }}><Skeleton height={40} /><Skeleton height={200} /></Box>;
  if (!party) return <Box sx={{ p: 3 }}><Typography>Không tìm thấy khách hàng {partyId}</Typography></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Khách hàng', path: '/sales/customers/family' }, { label: `Chi tiết ${partyId}` }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Customer info header */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{String(party.fullName ?? party.groupName ?? '—')}</Typography>
              <Typography variant="body2" color="text.secondary">Mã KH: {String(party.partyId ?? '')}</Typography>
            </Box>
            <Chip size="small" label={String(party.statusDescription ?? party.statusId ?? '—')}
              color={party.statusId === 'PARTY_ENABLED' ? 'success' : 'default'} />
          </Box>
        </Paper>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Thông tin" />
          <Tab label="Đơn hàng" />
        </Tabs>

        {tab === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông tin khách hàng</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
              <InfoRow label="Mã KH" value={String(party.partyId ?? '—')} />
              <InfoRow label="Loại" value={String(party.partyTypeId ?? '—')} />
              <InfoRow label="Họ" value={String(party.lastName ?? '—')} />
              <InfoRow label="Tên" value={String(party.firstName ?? '—')} />
              <InfoRow label="Tên đầy đủ" value={String(party.fullName ?? party.groupName ?? '—')} />
              <InfoRow label="Trạng thái" value={String(party.statusDescription ?? party.statusId ?? '—')} />
              <InfoRow label="Vai trò" value={String(party.roleTypeId ?? '—')} />
            </Box>
          </Paper>
        )}

        {tab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Đơn hàng gần đây</Typography>
            {orders.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Mã đơn</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Tổng tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((o, i) => (
                      <TableRow key={i}>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{String(o.orderId ?? '')}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{fmtDate(o.orderDate as string)}</Typography></TableCell>
                        <TableCell><Chip size="small" label={String(o.statusDescription ?? o.statusId ?? '—')} /></TableCell>
                        <TableCell align="right"><Typography variant="body2">{o.grandTotal != null ? Number(o.grandTotal).toLocaleString('vi-VN') + ' đ' : '—'}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Không có đơn hàng</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};
