import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, BarChart as BarChartIcon } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { OlapReportView } from './OlapReportView';
import { ReportFilters } from './ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ORDER_COMPLETED', label: 'Hoàn thành' },
  { value: 'ORDER_APPROVED', label: 'Đã duyệt' },
  { value: 'ORDER_CANCELLED', label: 'Đã hủy' },
];

export const OrderReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [orderStatus, setOrderStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [params, setParams] = useState<OlapParams | null>(null);

  const handleSubmit = useCallback(() => {
    const base: Partial<OlapParams> = {
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
      orderStatusId: orderStatus || undefined,
    };
    setParams({
      ...base,
      serviceName: 'olapOtherTorSalesOrder',
      olapType: viewMode === 'grid' ? 'GRID' : 'COLUMNCHART',
      limit: viewMode === 'grid' ? 100 : undefined,
    });
  }, [customTime, fromDate, thruDate, dateType, orderStatus, viewMode]);

  const { data, isLoading, error } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Đơn hàng' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Trạng thái" value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)} sx={{ minWidth: 140 }}>
            {ORDER_STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><BarChartIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Số lượng đơn hàng theo cửa hàng</Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error} chartType="bar" />
        </Paper>
      </Box>
    </Box>
  );
};
