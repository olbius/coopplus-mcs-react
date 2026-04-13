import { type FC, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart, ShowChart } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';
import { useOlapReport } from '../../hooks/useOlapReport';
import { OlapReportView } from './OlapReportView';
import type { OlapParams } from '../../../../api/report.api';
import { Search } from '@mui/icons-material';
import { Button } from '@mui/material';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }));
const QUARTERS = [{ value: '1', label: 'Quý 1' }, { value: '2', label: 'Quý 2' }, { value: '3', label: 'Quý 3' }, { value: '4', label: 'Quý 4' }];
const COMPARE_TYPES = [
  { value: 'month', label: 'So theo tháng' },
  { value: 'quarter', label: 'So theo quý' },
  { value: 'year', label: 'So theo năm' },
];

export const SalesGrowthReportPage: FC = () => {
  const [typee, setTypee] = useState('month');
  const [yearr, setYearr] = useState(String(currentYear));
  const [monthh, setMonthh] = useState(String(new Date().getMonth() + 1));
  const [quarterr, setQuarterr] = useState('1');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [params, setParams] = useState<OlapParams | null>(null);

  const handleSubmit = useCallback(() => {
    setParams({
      serviceName: viewMode === 'grid' ? 'evaluateSalesGrowthGrid' : 'evaluateSalesGrowthChart',
      olapType: viewMode === 'grid' ? 'GRID' : 'LINECHART',
      typee,
      type2: typee,
      yearr,
      monthh: typee === 'month' ? monthh : undefined,
      quarterr: typee === 'quarter' ? quarterr : undefined,
    });
  }, [typee, yearr, monthh, quarterr, viewMode]);

  const { data, isLoading, error } = useOlapReport(params);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto' }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo', path: '/sales/reports' }, { label: 'Tăng trưởng' }]} />
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <TextField size="small" select label="So sánh" value={typee}
            onChange={(e) => setTypee(e.target.value)} sx={{ minWidth: 150 }}>
            {COMPARE_TYPES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField size="small" select label="Năm" value={yearr}
            onChange={(e) => setYearr(e.target.value)} sx={{ minWidth: 100 }}>
            {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          {typee === 'month' && (
            <TextField size="small" select label="Tháng" value={monthh}
              onChange={(e) => setMonthh(e.target.value)} sx={{ minWidth: 120 }}>
              {MONTHS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
          )}
          {typee === 'quarter' && (
            <TextField size="small" select label="Quý" value={quarterr}
              onChange={(e) => setQuarterr(e.target.value)} sx={{ minWidth: 100 }}>
              {QUARTERS.map((q) => <MenuItem key={q.value} value={q.value}>{q.label}</MenuItem>)}
            </TextField>
          )}
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><TableChart fontSize="small" /></ToggleButton>
            <ToggleButton value="chart"><ShowChart fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" size="small" startIcon={<Search />} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang tải...' : 'Xem báo cáo'}
          </Button>
        </Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>So sánh tăng trưởng</Typography>
          <OlapReportView data={data} isLoading={isLoading} error={error as Error} chartType="line" />
        </Paper>
      </Box>
    </Box>
  );
};
