import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, BarChart as BarChartIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../../sales/hooks/useOlapReport';
import { useFacilities } from '../../../sales/hooks/useReportFilterOptions';
import { FilterSelect } from '../../../sales/pages/reports/FilterSelect';
import { OlapReportView } from '../../../sales/pages/reports/OlapReportView';
import { ReportFilters } from '../../../sales/pages/reports/ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

export const ExportWarehouseReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [params, setParams] = useState<OlapParams | null>(null);

  const [facility, setFacility] = useState('');
  const facilities = useFacilities();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: viewMode === 'grid' ? 'olapExportedTotalReport' : 'olapChartColTopExportSales',
      olapType: viewMode === 'grid' ? 'GRID' : 'COLUMNCHART',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
    });
  }, [customTime, fromDate, thruDate, dateType, viewMode]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Logistics' }, { label: 'Báo cáo', path: '/logistics/reports' }, { label: 'Xuất kho' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <FilterSelect label="Kho" value={facility} onChange={setFacility}
            options={facilities.data} loading={facilities.isLoading} />
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><BarChartIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {viewMode === 'grid' ? 'Chi tiết xuất kho' : 'Top sản phẩm xuất kho'}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
          page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} chartType="bar" />
        </Paper>
      </Box>
    </Box>
  );
};
