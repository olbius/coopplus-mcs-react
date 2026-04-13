import { type FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';

export const FileExportedPage: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'File trích xuất' }]} />
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <FolderOpen sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6">File trích xuất</Typography>
        <Typography variant="body2" color="text.secondary">Chưa có file nào được trích xuất</Typography>
      </Paper>
    </Box>
  </Box>
);
