import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, ShowChart } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { OlapReportView } from './OlapReportView';
import { ReportFilters } from './ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

export const SalesRevenueReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [params, setParams] = useState<OlapParams | null>(null);

  const handleSubmit = useCallback(() => {
    const base: Partial<OlapParams> = {
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
    };
    setParams({
      ...base,
      serviceName: viewMode === 'grid' ? 'olapOtherTorSalesOrder' : 'olapChartLineSynTorSales',
      olapType: viewMode === 'grid' ? 'GRID' : 'LINECHART',
      limit: viewMode === 'grid' ? 100 : undefined,
      filterTypeId: 'SALES_CHANNEL',
    });
  }, [customTime, fromDate, thruDate, dateType, viewMode]);

  const { data, isLoading, error } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Doanh số' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><ShowChart fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {viewMode === 'grid' ? 'Chi tiết đơn hàng' : 'Doanh thu theo thời gian'}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error} chartType="line" />
        </Paper>
      </Box>
    </Box>
  );
};
