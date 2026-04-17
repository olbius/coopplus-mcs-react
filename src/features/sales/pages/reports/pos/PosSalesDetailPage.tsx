import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem } from '@mui/material';
import { PageHeader } from '../../../../../components/common/PageHeader';
import { useOlapReport } from '../../../hooks/useOlapReport';
import { useProductStores } from '../../../hooks/useReportFilterOptions';
import { OlapReportView } from '../OlapReportView';
import { ReportFilters } from '../ReportFilters';
import { FilterSelect } from '../FilterSelect';
import type { OlapParams } from '../../../../../api/report.api';

const REPORT_TYPES = [
  { value: 'salesDetail', label: 'Chi tiết bán hàng' },
  { value: 'departmentSummary', label: 'Theo bộ phận' },
  { value: 'itemSummary', label: 'Theo sản phẩm' },
  { value: 'customerSummary', label: 'Theo khách hàng' },
  { value: 'detailCustomer', label: 'Chi tiết khách hàng' },
];

export const PosSalesDetailPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('DAY');
  const [reportType, setReportType] = useState('salesDetail');
  const [store, setStore] = useState('');
  const [params, setParams] = useState<OlapParams | null>(null);

  const stores = useProductStores();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: 'salesOrderReport',
      olapType: 'GRID',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
      reportType,
      productStoreId: store || 'all',
    });
  }, [customTime, fromDate, thruDate, dateType, reportType, store]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'POS - Bán hàng' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Loại báo cáo" value={reportType}
            onChange={(e) => setReportType(e.target.value)} sx={{ minWidth: 180 }}>
            {REPORT_TYPES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <FilterSelect label="Cửa hàng" value={store} onChange={setStore}
            options={stores.data} loading={stores.isLoading} />
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {REPORT_TYPES.find((r) => r.value === reportType)?.label}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
            page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} />
        </Paper>
      </Box>
    </Box>
  );
};
