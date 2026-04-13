import { type FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { logisticsApi } from '../../../api/logistics.api';

const fmtDate = (s?: string) => { if (!s) return '—'; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('vi-VN'); };

export const ShipmentListPage: FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['log-shipments', page, pageSize],
    queryFn: () => logisticsApi.listShipments(page, pageSize, 'TRANSFER'),
    placeholderData: (prev: { shipmentList: Record<string, unknown>[]; totalRows: number } | undefined) => prev,
  });

  const items = data?.shipmentList ?? [];
  const total = Number(data?.totalRows ?? 0);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'shipmentId', label: 'Mã chuyến', width: 120,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.shipmentId ?? '')}</Typography> },
    { key: 'shipmentTypeId', label: 'Loại', width: 160,
      render: (r) => <Typography variant="body2">{String(r.shipmentTypeId ?? '—')}</Typography> },
    { key: 'statusId', label: 'Trạng thái', width: 140,
      render: (r) => <Chip size="small" label={String(r.statusDescription ?? r.statusId ?? '—')} /> },
    { key: 'primaryOrderId', label: 'Đơn hàng', width: 120,
      render: (r) => <Typography variant="body2">{String(r.primaryOrderId ?? '—')}</Typography> },
    { key: 'originFacilityId', label: 'Kho nguồn', width: 120,
      render: (r) => <Typography variant="body2">{String(r.originFacilityId ?? '—')}</Typography> },
    { key: 'destinationFacilityId', label: 'Kho đích', width: 120,
      render: (r) => <Typography variant="body2">{String(r.destinationFacilityId ?? '—')}</Typography> },
    { key: 'estimatedShipDate', label: 'Ngày gửi dự kiến', width: 130,
      render: (r) => <Typography variant="body2">{fmtDate(r.estimatedShipDate as string)}</Typography> },
    { key: 'estimatedArrivalDate', label: 'Ngày đến dự kiến', width: 130,
      render: (r) => <Typography variant="body2">{fmtDate(r.estimatedArrivalDate as string)}</Typography> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        breadcrumbs={[{ label: 'Logistics' }, { label: 'Điều chuyển', path: '/logistics/transfers' }, { label: 'Chuyến hàng' }]}
        actions={<Tooltip title="Làm mới"><IconButton size="small" onClick={() => refetch()} disabled={isFetching}><RefreshIcon fontSize="small" /></IconButton></Tooltip>}
      />
      <DataTable columns={columns} rows={items} rowKey={(r) => String(r.shipmentId ?? Math.random())}
        loading={isLoading || isFetching} total={total} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        emptyMessage="Không có chuyến hàng" columnStorageKey="log-shipments" />
    </Box>
  );
};
