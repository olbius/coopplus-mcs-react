import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, PieChart as PieChartIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { useProductStores, useCustomerGroups } from '../../hooks/useReportFilterOptions';
import { OlapReportView } from './OlapReportView';
import { ReportFilters } from './ReportFilters';
import { FilterSelect } from './FilterSelect';
import type { OlapParams } from '../../../../api/report.api';

export const CustomerReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [store, setStore] = useState('');
  const [loyaltyGroup, setLoyaltyGroup] = useState('');
  const [params, setParams] = useState<OlapParams | null>(null);

  const stores = useProductStores();
  const groups = useCustomerGroups();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: viewMode === 'grid' ? 'olapTorCustomer' : 'olapChartPieSynTorCustomerLoyalty',
      olapType: viewMode === 'grid' ? 'GRID' : 'PIECHART',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
      productStore: store || undefined,
      loyaltyGroup: loyaltyGroup || undefined,
    });
  }, [customTime, fromDate, thruDate, dateType, viewMode, store, loyaltyGroup]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Khách hàng' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <FilterSelect label="Cửa hàng" value={store} onChange={setStore}
            options={stores.data} loading={stores.isLoading} />
          <FilterSelect label="Nhóm KH" value={loyaltyGroup} onChange={setLoyaltyGroup}
            options={groups.data} loading={groups.isLoading} />
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><PieChartIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {viewMode === 'grid' ? 'Doanh thu theo khách hàng' : 'Phân bổ theo nhóm KH'}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
            page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} chartType="pie" />
        </Paper>
      </Box>
    </Box>
  );
};
