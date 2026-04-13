import { type FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Warehouse } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';

export const DepositFacilityPage: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <PageHeader breadcrumbs={[{ label: 'Logistics' }, { label: 'Kho hàng', path: '/logistics/facilities' }, { label: 'DS Kho ký gửi' }]} />
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Warehouse sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6">Kho ký gửi</Typography>
        <Typography variant="body2" color="text.secondary">Không có kho ký gửi</Typography>
      </Paper>
    </Box>
  </Box>
);
