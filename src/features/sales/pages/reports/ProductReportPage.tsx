import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, BarChart as BarChartIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { OlapReportView } from './OlapReportView';
import { ReportFilters } from './ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

const TOP_OPTIONS = [
  { value: '10', label: 'Top 10' },
  { value: '20', label: 'Top 20' },
  { value: '50', label: 'Top 50' },
];

const FILTER_TYPE_OPTIONS = [
  { value: 'QUANTITY', label: 'Theo số lượng' },
  { value: 'AMOUNT', label: 'Theo doanh thu' },
];

export const ProductReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [topProduct, setTopProduct] = useState('10');
  const [filterType, setFilterType] = useState('AMOUNT');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [params, setParams] = useState<OlapParams | null>(null);

  const handleSubmit = useCallback(() => {
    const base: Partial<OlapParams> = {
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
      topProduct,
      filterType,
    };
    setParams({
      ...base,
      serviceName: viewMode === 'grid' ? 'evaluateSalesGridTopProduct' : 'olapChartColTopProduct',
      olapType: viewMode === 'grid' ? 'GRID' : 'COLUMNCHART',
    });
  }, [customTime, fromDate, thruDate, dateType, topProduct, filterType, viewMode]);

  const { data, isLoading, error } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Sản phẩm' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Top" value={topProduct}
            onChange={(e) => setTopProduct(e.target.value)} sx={{ minWidth: 100 }}>
            {TOP_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField size="small" select label="Tiêu chí" value={filterType}
            onChange={(e) => setFilterType(e.target.value)} sx={{ minWidth: 150 }}>
            {FILTER_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><BarChartIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Top sản phẩm bán chạy</Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error} chartType="bar" />
        </Paper>
      </Box>
    </Box>
  );
};
