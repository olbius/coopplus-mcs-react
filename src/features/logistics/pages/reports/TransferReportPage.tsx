import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem } from '@mui/material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../../sales/hooks/useOlapReport';
import { useFacilities } from '../../../sales/hooks/useReportFilterOptions';
import { FilterSelect } from '../../../sales/pages/reports/FilterSelect';
import { OlapReportView } from '../../../sales/pages/reports/OlapReportView';
import { ReportFilters } from '../../../sales/pages/reports/ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

const REPORT_TYPES = [
  { value: 'olapTransferReport', label: 'Tổng hợp' },
  { value: 'olapTransferDetailReport', label: 'Chi tiết' },
  { value: 'olapTransferSummaryReport', label: 'Tóm tắt' },
];

export const TransferReportPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [reportType, setReportType] = useState('olapTransferReport');
  const [params, setParams] = useState<OlapParams | null>(null);

  const [facility, setFacility] = useState('');
  const facilities = useFacilities();

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: reportType,
      olapType: 'GRID',
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      dateType,
    });
  }, [customTime, fromDate, thruDate, dateType, reportType]);

  const { data, isLoading, error, page, pageSize, totalSize, onPageChange, onPageSizeChange, columnFilters, onColumnFilterChange, isFetching } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Logistics' }, { label: 'Báo cáo', path: '/logistics/reports' }, { label: 'Điều chuyển' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading}>
          <TextField size="small" select label="Loại báo cáo" value={reportType}
            onChange={(e) => setReportType(e.target.value)} sx={{ minWidth: 140 }}>
            {REPORT_TYPES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <FilterSelect label="Kho" value={facility} onChange={setFacility}
            options={facilities.data} loading={facilities.isLoading} />
        </ReportFilters>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Báo cáo điều chuyển — {REPORT_TYPES.find((r) => r.value === reportType)?.label}
          </Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error}
          page={page} pageSize={pageSize} totalSize={totalSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            columnFilters={columnFilters} onColumnFilterChange={onColumnFilterChange} isFetching={isFetching} />
        </Paper>
      </Box>
    </Box>
  );
};
