import { type FC } from 'react';
import { TextField, MenuItem, CircularProgress, InputAdornment } from '@mui/material';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
  loading?: boolean;
  allLabel?: string;
  minWidth?: number;
}

export const FilterSelect: FC<FilterSelectProps> = ({
  label, value, onChange, options = [], loading = false, allLabel = 'Tất cả', minWidth = 160,
}) => (
  <TextField size="small" select label={label} value={value}
    onChange={(e) => onChange(e.target.value)} sx={{ minWidth }}
    slotProps={loading ? { input: { endAdornment: <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment> } } : undefined}>
    <MenuItem value="">{allLabel}</MenuItem>
    {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
  </TextField>
);
