import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, MenuItem, TextField } from '@mui/material';
import { TableChart, BarChart as BarChartIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { useProductStores } from '../../hooks/useReportFilterOptions';
import { OlapReportView } from './OlapReportView';
import { ReportFilters } from './ReportFilters';
import { FilterSelect } from './FilterSelect';
import type { OlapParams } from '../../../../api/report.api';

const TOP_OPTIONS = [
  { value: '10', label: 'Top 10' },
  { value: '20', label: 'Top 20' },
  { value: '50', label: 'Top 50' },
];

export const ProductReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [topProduct, setTopProduct] = useState('20');
  const [store, setStore] = useState('');
  const [params, setParams] = useState<OlapParams | null>(null);

  const stores = useProductStores();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: viewMode === 'grid' ? 'evaluateSalesGridTopProduct' : 'olapChartColTopProduct',
      olapType: viewMode === 'grid' ? 'GRID' : 'COLUMNCHART',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
      topProduct,
      filterType: 'product_',
      storeChannel: 'all',
      productStore: store || undefined,
    });
  }, [customTime, fromDate, thruDate, dateType, viewMode, topProduct, store]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Sản phẩm' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Số lượng" value={topProduct}
            onChange={(e) => setTopProduct(e.target.value)} sx={{ minWidth: 100 }}>
            {TOP_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <FilterSelect label="Cửa hàng" value={store} onChange={setStore}
            options={stores.data} loading={stores.isLoading} />
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><BarChartIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Top sản phẩm bán chạy</Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
            page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} chartType="bar" />
        </Paper>
      </Box>
    </Box>
  );
};
