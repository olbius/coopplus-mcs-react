import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem } from '@mui/material';
import { PageHeader } from '../../../../../components/common/PageHeader';
import { useOlapReport } from '../../../hooks/useOlapReport';
import { useProductStores } from '../../../hooks/useReportFilterOptions';
import { OlapReportView } from '../OlapReportView';
import { ReportFilters } from '../ReportFilters';
import { FilterSelect } from '../FilterSelect';
import type { OlapParams } from '../../../../../api/report.api';

const CHART_TYPES = [
  { value: 'bestSellerChartv2', label: 'SP bán chạy' },
  { value: 'storeChartv2', label: 'Theo cửa hàng' },
  { value: 'categoryChartv2', label: 'Theo danh mục' },
];

export const PosBestSellerPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [chartService, setChartService] = useState('bestSellerChartv2');
  const [store, setStore] = useState('');
  const [params, setParams] = useState<OlapParams | null>(null);

  const stores = useProductStores();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: chartService,
      olapType: 'COLUMNCHART',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      productStoreId: store || 'all',
    });
  }, [customTime, fromDate, thruDate, chartService, store]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'POS - Biểu đồ' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Loại biểu đồ" value={chartService}
            onChange={(e) => setChartService(e.target.value)} sx={{ minWidth: 160 }}>
            {CHART_TYPES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <FilterSelect label="Cửa hàng" value={store} onChange={setStore}
            options={stores.data} loading={stores.isLoading} />
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {CHART_TYPES.find((c) => c.value === chartService)?.label}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
            page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} chartType="bar" />
        </Paper>
      </Box>
    </Box>
  );
};
