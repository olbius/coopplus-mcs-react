import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Skeleton, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { salesApi } from '../../../api/sales.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString('vi-VN'); };
const fmtCurrency = (v?: number | string) => { const n = Number(v); return isNaN(n) ? '—' : n.toLocaleString('vi-VN') + ' đ'; };

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>{label}:</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export const SalesReturnDetailPage: FC = () => {
  const { returnId } = useParams<{ returnId: string }>();

  const { data: ret, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['sales-return-detail', returnId],
    queryFn: () => salesApi.getSalesReturnDetail(returnId!),
    enabled: !!returnId,
  });

  if (isLoading) return <Box sx={{ p: 3 }}><Skeleton height={40} /><Skeleton height={200} /><Skeleton height={200} /></Box>;
  if (!ret) return <Box sx={{ p: 3 }}><Typography>Không tìm thấy đơn trả hàng {returnId}</Typography></Box>;

  const items = (ret.items as Record<string, unknown>[]) ?? [];
  const statusHistory = (ret.statusHistory as Record<string, unknown>[]) ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
      <PageHeader
        breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Đơn hàng trả', path: '/sales/returns' }, { label: `Chi tiết ${returnId}` }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />

      <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header info */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông tin đơn trả hàng</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <InfoRow label="Mã đơn trả" value={String(ret.returnId ?? '—')} />
            <InfoRow label="Trạng thái" value={String(ret.statusDescription ?? ret.statusId ?? '—')} />
            <InfoRow label="Ngày trả" value={fmtDate((ret.entryDate ?? ret.returnDate) as string)} />
            <InfoRow label="Khách hàng" value={String(ret.fromPartyName ?? ret.customerName ?? ret.fromPartyId ?? '—')} />
            <InfoRow label="Mã KH" value={String(ret.fromPartyId ?? '—')} />
            <InfoRow label="Tổng tiền" value={fmtCurrency(ret.grandTotal as number)} />
            <InfoRow label="Đơn hàng gốc" value={String(ret.orderId ?? '—')} />
            <InfoRow label="Người tạo" value={String(ret.createdBy ?? '—')} />
          </Box>
        </Paper>

        {/* Return items */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Danh sách sản phẩm trả</Typography>
          {items.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã SP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên SP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">SL</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Đơn giá</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Thành tiền</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{String(item.productId ?? '—')}</TableCell>
                      <TableCell>{String(item.productName ?? item.description ?? '—')}</TableCell>
                      <TableCell align="right">{String(item.returnQuantity ?? '—')}</TableCell>
                      <TableCell align="right">{fmtCurrency(item.returnPrice as number)}</TableCell>
                      <TableCell align="right">{fmtCurrency(
                        (Number(item.returnQuantity) || 0) * (Number(item.returnPrice) || 0)
                      )}</TableCell>
                      <TableCell>{String(item.returnReasonDescription ?? item.returnReasonId ?? '—')}</TableCell>
                      <TableCell>
                        <Chip size="small" label={String(item.statusDescription ?? item.statusId ?? '—')} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">Không có sản phẩm</Typography>
          )}
        </Paper>

        {/* Status history */}
        {statusHistory.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Lịch sử trạng thái</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Người thực hiện</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusHistory.map((h, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{fmtDate(h.statusDatetime as string)}</TableCell>
                      <TableCell>{String(h.statusDescription ?? h.statusId ?? '—')}</TableCell>
                      <TableCell>{String(h.changeByUserLoginId ?? '—')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
};
