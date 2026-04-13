import { type FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inventory2 } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';

export const PhysicalInventoryPage: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <PageHeader breadcrumbs={[{ label: 'Logistics' }, { label: 'Tồn kho', path: '/logistics/inventory' }, { label: 'Kiểm kê' }]} />
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Inventory2 sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6">Kiểm kê vật lý</Typography>
        <Typography variant="body2" color="text.secondary">Không có dữ liệu kiểm kê</Typography>
      </Paper>
    </Box>
  </Box>
);
