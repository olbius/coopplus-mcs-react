import { type FC, useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Alert, TextField, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { FilterList as FilterIcon, FilterListOff as FilterOffIcon } from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DataTable, type Column } from '../../../../components/common/DataTable';
import type { OlapResult, OlapGridResult, OlapChartResult } from '../../../../api/report.api';
import type { ColumnFilter } from '../../hooks/useOlapReport';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7', '#c2185b', '#455a64'];

// ─── Field Labels ───────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  // Sales
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
  // Logistics — common
  quantity: 'Số lượng', facility: 'Kho', facility_id: 'Mã kho', facility_name: 'Tên kho',
  product: 'Sản phẩm', uom: 'ĐVT', uom_name: 'Đơn vị tính', quantity_uom_id: 'ĐVT',
  quantity_uom: 'ĐVT', category_name: 'Danh mục', internal_name: 'Tên nội bộ',
  // Logistics — inventory
  export: 'Xuất', receive: 'Nhập', inventory: 'Tồn kho', inventoryP: 'Tồn kho (KT)',
  quantity_on_hand_total: 'Tổng tồn kho', inventory_date: 'Ngày kiểm kê',
  expire_date: 'Hạn sử dụng', manufactured_date: 'Ngày sản xuất', datetime_manufactured: 'Ngày sản xuất',
  // Logistics — transfer
  transfer_id: 'Mã điều chuyển', transfer_type_id: 'Loại điều chuyển', transfer_date: 'Ngày điều chuyển',
  status_id: 'Trạng thái', status_transfer_id: 'Trạng thái', delivery_id: 'Mã giao hàng',
  delivery_status_id: 'TT giao hàng', origin_facility: 'Kho xuất', origin_facility_name: 'Tên kho xuất',
  dest_facility: 'Kho nhập', dest_facility_name: 'Tên kho nhập',
  actual_exported_quantity: 'SL xuất thực', actual_delivered_quantity: 'SL nhận thực',
  unit_price: 'Đơn giá', total_price: 'Thành tiền', lot_id: 'Mã lô',
  // Logistics — return
  return_reason_id: 'Lý do trả', return_item_type_id: 'Loại trả', product_store: 'Cửa hàng',
  party_from_name: 'Bên gửi', party_to_name: 'Bên nhận', status: 'Trạng thái',
  // Logistics — physical inventory
  variance_reason_id: 'Lý do chênh lệch',
  // POS reports
  extended_price: 'Doanh thu', sum_quantity: 'Tổng SL', sum_ext_price: 'Tổng DT',
  category_id: 'Mã danh mục', party_name: 'Tên KH',
  sumQuantity: 'Tổng SL', sumExtPrice: 'Tổng DT',
};
const isHashKey = (name: string) => /^[0-9a-f]{20,}$/.test(name);

// ─── Grid View ──────────────────────────────────────────────────────────────
interface GridViewProps {
  result: OlapGridResult;
  page: number;
  pageSize: number;
  totalSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  columnFilters: ColumnFilter[];
  onColumnFilterChange: (filters: ColumnFilter[]) => void;
  isFetching: boolean;
}

const GridView: FC<GridViewProps> = ({ result, page, pageSize, totalSize, onPageChange, onPageSizeChange, onColumnFilterChange, isFetching }) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // Debounce filter values → push to parent as ColumnFilter[]
  useEffect(() => {
    const t = setTimeout(() => {
      const filters: ColumnFilter[] = [];
      for (const [col, val] of Object.entries(filterValues)) {
        if (val.trim()) {
          const isNum = typeof result.data?.[0]?.[col] === 'number';
          filters.push({ column: col, condition: isNum ? 'GREATER_THAN_OR_EQUAL' : 'CONTAINS', value: val, type: isNum ? 'numericfilter' : 'string' });
        }
      }
      onColumnFilterChange(filters);
    }, 500);
    return () => clearTimeout(t);
  }, [filterValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = Object.values(filterValues).some((v) => v.trim());
  const handleClearFilters = () => { setFilterValues({}); };

  const fieldNames = (result.datafields ?? []).map((f) => typeof f === 'string' ? f : f.name);

  const makeTextFilter = (col: string) => () => (
    <TextField size="small" variant="standard" placeholder="Tìm..." fullWidth
      value={filterValues[col] ?? ''}
      onChange={(e) => setFilterValues((prev) => ({ ...prev, [col]: e.target.value }))}
      slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.8125rem' } } }} />
  );

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
      filterRender: makeTextFilter(name),
    }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 0.5 }}>
        {hasActiveFilters && (
          <MuiTooltip title="Xóa bộ lọc">
            <IconButton size="small" onClick={handleClearFilters}>
              <FilterOffIcon fontSize="small" color="warning" />
            </IconButton>
          </MuiTooltip>
        )}
        <MuiTooltip title={filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}>
          <IconButton size="small" onClick={() => setFiltersVisible((v) => !v)}>
            <FilterIcon fontSize="small" color={hasActiveFilters || filtersVisible ? 'primary' : 'inherit'} />
          </IconButton>
        </MuiTooltip>
      </Box>
      <DataTable
        columns={columns}
        rows={result.data ?? []}
        rowKey={(row: Record<string, unknown>) => String(row['product_store_id'] ?? row['productStoreId'] ?? row['order_id'] ?? row['product_id'] ?? Math.random())}
        loading={isFetching}
        total={totalSize}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        filtersVisible={filtersVisible}
        emptyMessage="Không có dữ liệu"
      />
    </Box>
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
    const firstSeries = yAxis[seriesKeys[0]] ?? [];
    const pieData = xAxis.map((label, i) => ({ name: label, value: Number(firstSeries[i]) || 0 }));
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

  const chartData = xAxis.map((label, i) => {
    const point: Record<string, unknown> = { xAxis: label };
    for (const key of seriesKeys) point[key] = Number(yAxis[key]?.[i]) || 0;
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
  page?: number;
  pageSize?: number;
  totalSize?: number;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  columnFilters?: ColumnFilter[];
  onColumnFilterChange?: (filters: ColumnFilter[]) => void;
  isFetching?: boolean;
}

export const OlapReportView: FC<OlapReportViewProps> = ({
  data, isLoading, error, chartType = 'bar',
  page = 0, pageSize = 20, totalSize = 0, onPageChange, onPageSizeChange,
  columnFilters = [], onColumnFilterChange, isFetching = false,
}) => {
  if (isLoading) return <Box sx={{ p: 2 }}><Skeleton height={40} /><Skeleton height={300} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Lỗi: {error.message}</Alert>;
  if (!data || data.type === 'EMPTY') return <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Chọn bộ lọc và nhấn xem báo cáo</Typography>;

  if (data.type === 'GRID') return (
    <GridView result={data as OlapGridResult}
      page={page} pageSize={pageSize} totalSize={totalSize || (data as OlapGridResult).totalsize || (data as OlapGridResult).data?.length || 0}
      onPageChange={onPageChange ?? (() => {})} onPageSizeChange={onPageSizeChange ?? (() => {})}
      columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange ?? (() => {})}
      isFetching={isFetching} />
  );
  if (data.type === 'CHART') return <ChartView result={data as OlapChartResult} chartType={chartType} />;

  return <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Dạng dữ liệu không hỗ trợ hiển thị</Typography>;
};
