import { type FC } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';

const reports = [
  { label: 'Báo cáo xuất kho', desc: 'Chi tiết xuất kho theo chuyến hàng', path: '/logistics/reports/export' },
  { label: 'Xuất kho dự kiến', desc: 'Báo cáo xuất kho theo đơn hàng', path: '/logistics/reports/expected-export' },
  { label: 'Báo cáo nhập kho', desc: 'Chi tiết nhập kho', path: '/logistics/reports/receive' },
  { label: 'Nhập kho dự kiến', desc: 'Báo cáo nhập kho theo đơn hàng', path: '/logistics/reports/expected-receive' },
  { label: 'Báo cáo tồn kho', desc: 'Tổng hợp tồn kho theo kho hàng', path: '/logistics/reports/inventory' },
  { label: 'Báo cáo trả hàng', desc: 'Chi tiết hàng trả lại', path: '/logistics/reports/return' },
  { label: 'Báo cáo điều chuyển', desc: 'Chi tiết điều chuyển giữa các kho', path: '/logistics/reports/transfer' },
  { label: 'Lịch sử kiểm kê', desc: 'Lịch sử kiểm kê vật lý', path: '/logistics/reports/physical-inventory' },
];

export const LogReportsPage: FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <PageHeader breadcrumbs={[{ label: 'Logistics' }, { label: 'Báo cáo' }]} />
      <Box sx={{ p: 2 }}>
        <Paper sx={{ maxWidth: 600, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#307ECC', color: '#fff', px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Báo cáo Logistics</Typography>
          </Box>
          <List dense disablePadding>
            {reports.map((r) => (
              <ListItemButton key={r.label} sx={{ py: 0.75 }} onClick={() => navigate(r.path)}>
                <ListItemIcon sx={{ minWidth: 28 }}><ChevronRight color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary={r.label} secondary={r.desc}
                  slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};
