import { type FC } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';

const TIME_OPTIONS = [
  { value: 'dd', label: 'Hôm nay' },
  { value: 'ww', label: 'Tuần này' },
  { value: 'mm', label: 'Tháng này' },
  { value: 'qq', label: 'Quý này' },
  { value: 'yy', label: 'Năm nay' },
  { value: 'oo', label: 'Tùy chọn' },
];

const DATE_TYPE_OPTIONS = [
  { value: 'DAY', label: 'Ngày' },
  { value: 'MONTH', label: 'Tháng' },
  { value: 'QUARTER', label: 'Quý' },
  { value: 'YEAR', label: 'Năm' },
];

interface ReportFiltersProps {
  customTime: string;
  onCustomTimeChange: (v: string) => void;
  fromDate: string;
  onFromDateChange: (v: string) => void;
  thruDate: string;
  onThruDateChange: (v: string) => void;
  dateType?: string;
  onDateTypeChange?: (v: string) => void;
  showDateType?: boolean;
  onSubmit: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export const ReportFilters: FC<ReportFiltersProps> = ({
  customTime, onCustomTimeChange, fromDate, onFromDateChange, thruDate, onThruDateChange,
  dateType, onDateTypeChange, showDateType = false, onSubmit, loading, children,
}) => (
  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
    <TextField size="small" select label="Thời gian" value={customTime}
      onChange={(e) => onCustomTimeChange(e.target.value)} sx={{ minWidth: 130 }}>
      {TIME_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
    {customTime === 'oo' && (
      <>
        <TextField size="small" type="date" label="Từ ngày" value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField size="small" type="date" label="Đến ngày" value={thruDate}
          onChange={(e) => onThruDateChange(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </>
    )}
    {showDateType && onDateTypeChange && (
      <TextField size="small" select label="Gom theo" value={dateType ?? 'year_month'}
        onChange={(e) => onDateTypeChange(e.target.value)} sx={{ minWidth: 110 }}>
        {DATE_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </TextField>
    )}
    {children}
    <Button variant="contained" size="small" startIcon={<Search />} onClick={onSubmit} disabled={loading}>
      {loading ? 'Đang tải...' : 'Xem báo cáo'}
    </Button>
  </Box>
);
