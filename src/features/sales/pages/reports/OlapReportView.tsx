import { type FC } from 'react';
import { Box, Typography, Skeleton, Alert } from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import type { OlapResult, OlapGridResult, OlapChartResult } from '../../../../api/report.api';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7', '#c2185b', '#455a64'];

// ─── Field Labels ───────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  order_id: 'Mã đơn hàng', order_date: 'Ngày', product_store_id: 'Mã CH', store_name: 'Tên cửa hàng',
  customer_id: 'Mã KH', customer_name: 'Tên KH', total_quantity: 'Số lượng', total_amount: 'Tổng tiền',
  return_quantity: 'SL trả', discount_amount: 'Chiết khấu', sub_total_amount: 'Tạm tính',
  total_selected_amount: 'Tổng chọn', num_order: 'Số đơn', product_store_group_name: 'Nhóm CH',
  product_id: 'Mã SP', product_code: 'Mã SP', product_name: 'Tên SP', party_id: 'Mã đối tác',
  party_code: 'Mã đối tác', sales_method_channel_name: 'Kênh bán', sales_method_channel_enum_id: 'Mã kênh',
  loyalty_group_name: 'Nhóm KH', loyalty_group_id: 'Mã nhóm KH', dateTime: 'Thời gian',
  productId: 'Mã SP', productName: 'Tên SP', productStoreId: 'Mã CH', productStoreName: 'Tên CH',
  totalAgreement: 'Tổng HĐ', totalAgreementToStore: 'HĐ theo CH', amount: 'Số tiền',
  currencyUomId: 'Tiền tệ', cfCode: 'Mã CF',
};
const isHashKey = (name: string) => /^[0-9a-f]{20,}$/.test(name);

// ─── Grid View ──────────────────────────────────────────────────────────────
const GridView: FC<{ result: OlapGridResult }> = ({ result }) => {
  const fieldNames = (result.datafields ?? []).map((f) => typeof f === 'string' ? f : f.name);
  const columns: Column<Record<string, unknown>>[] = fieldNames
    .filter((name) => !isHashKey(name))
    .map((name) => ({
      key: name,
      label: FIELD_LABELS[name] ?? name,
      sortable: true,
      align: typeof result.data?.[0]?.[name] === 'number' ? 'right' as const : 'left' as const,
      render: (row) => {
        const v = row[name];
        if (v == null) return '—';
        if (typeof v === 'number') return v.toLocaleString('vi-VN');
        return String(v);
      },
    }));

  return (
    <DataTable
      columns={columns}
      rows={result.data ?? []}
      rowKey={(row: Record<string, unknown>) => String(row['product_store_id'] ?? row['productStoreId'] ?? row['order_id'] ?? row['product_id'] ?? Math.random())}
      total={result.totalsize || result.data?.length || 0}
      emptyMessage="Không có dữ liệu"
    />
  );
};

// ─── Chart View ─────────────────────────────────────────────────────────────
const ChartView: FC<{ result: OlapChartResult; chartType: 'line' | 'bar' | 'pie' }> = ({ result, chartType }) => {
  const { xAxis, yAxis } = result;
  if (!xAxis?.length || !yAxis) {
    return <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Không có dữ liệu biểu đồ</Typography>;
  }

  const seriesKeys = Object.keys(yAxis);

  if (chartType === 'pie') {
    // For pie chart, use the first series
    const firstSeries = yAxis[seriesKeys[0]] ?? [];
    const pieData = xAxis.map((label, i) => ({
      name: label,
      value: Number(firstSeries[i]) || 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={(entry) => `${entry.name} (${((entry.percent ?? 0) * 100).toFixed(0)}%)`}>
            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => Number(v).toLocaleString('vi-VN')} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Bar / Line chart — build data array [{xAxis: label, series1: val, series2: val, ...}]
  const chartData = xAxis.map((label, i) => {
    const point: Record<string, unknown> = { xAxis: label };
    for (const key of seriesKeys) {
      point[key] = Number(yAxis[key]?.[i]) || 0;
    }
    return point;
  });

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ChartComponent data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="xAxis" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => { const n = Number(v); if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ'; if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(0) + ' tr'; return n.toLocaleString('vi-VN'); }} width={80} />
        <Tooltip formatter={(v) => Number(v).toLocaleString('vi-VN') + ' đ'} />
        <Legend />
        {seriesKeys.map((key, i) =>
          chartType === 'bar'
            ? <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            : <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />,
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
interface OlapReportViewProps {
  data?: OlapResult | null;
  isLoading: boolean;
  error?: Error | null;
  chartType?: 'line' | 'bar' | 'pie';
}

export const OlapReportView: FC<OlapReportViewProps> = ({ data, isLoading, error, chartType = 'bar' }) => {
  if (isLoading) return <Box sx={{ p: 2 }}><Skeleton height={40} /><Skeleton height={300} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Lỗi: {error.message}</Alert>;
  if (!data || data.type === 'EMPTY') return <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Chọn bộ lọc và nhấn xem báo cáo</Typography>;

  if (data.type === 'GRID') return <GridView result={data as OlapGridResult} />;
  if (data.type === 'CHART') return <ChartView result={data as OlapChartResult} chartType={chartType} />;

  return <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Dạng dữ liệu không hỗ trợ hiển thị</Typography>;
};
