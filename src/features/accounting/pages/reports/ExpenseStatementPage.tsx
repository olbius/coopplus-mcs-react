import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../../sales/hooks/useOlapReport';
import { OlapReportView } from '../../../sales/pages/reports/OlapReportView';
import { ReportFilters } from '../../../sales/pages/reports/ReportFilters';
import type { OlapParams } from '../../../../api/report.api';

export const ExpenseStatementPage: FC = () => {
  const [customTime, setCustomTime] = useState('mm');
  const [fromDate, setFromDate] = useState('');
  const [thruDate, setThruDate] = useState('');
  const [dateType, setDateType] = useState('MONTH');
  const [params, setParams] = useState<OlapParams | null>(null);

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: 'getExpenseStatement',
      olapType: 'GRID',
      dateType,
      customTime: customTime !== 'oo' ? customTime : undefined,
      fromDate: customTime === 'oo' ? fromDate : undefined,
      thruDate: customTime === 'oo' ? thruDate : undefined,
      limit: 100,
    });
  }, [customTime, fromDate, thruDate, dateType]);

  const { data, isLoading, error } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Kế toán' }, { label: 'Báo cáo', path: '/accounting/reports' }, { label: 'Báo cáo chi phí' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <ReportFilters customTime={customTime} onCustomTimeChange={setCustomTime}
          fromDate={fromDate} onFromDateChange={setFromDate} thruDate={thruDate} onThruDateChange={setThruDate}
          dateType={dateType} onDateTypeChange={setDateType} showDateType
          onSubmit={handleSubmit} loading={isLoading} />
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Báo cáo chi phí theo danh mục</Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error} />
        </Paper>
      </Box>
    </Box>
  );
};
