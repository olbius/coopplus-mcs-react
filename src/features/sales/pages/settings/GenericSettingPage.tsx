import { type FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';

interface Props {
  title: string;
  breadcrumbs: (string | { label: string; path?: string })[];
}

export const GenericSettingPage: FC<Props> = ({ title, breadcrumbs }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <PageHeader breadcrumbs={breadcrumbs.map(b => typeof b === 'string' ? { label: b } : b)} />
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Construction sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Trang này cần thêm REST API backend. Đang phát triển...
        </Typography>
      </Paper>
    </Box>
  </Box>
);
