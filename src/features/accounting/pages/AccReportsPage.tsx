import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';

const behalfReports = [
  { label: 'Tổng hợp thu hộ', desc: 'Báo cáo tổng hợp thu tiền hộ', path: '/accounting/reports/behalf-agg' },
  { label: 'Hoa hồng thu hộ', desc: 'Hoa hồng theo hợp đồng NCC', path: '/accounting/reports/behalf-commission' },
  { label: 'DT chi tiết thu hộ theo NCC', desc: 'Chi tiết doanh thu theo nhà cung cấp', path: '/accounting/reports/behalf-supplier' },
  { label: 'Chi tiết thu hộ theo GD (MCS)', desc: 'Chi tiết theo giao dịch nội bộ', path: '/accounting/reports/behalf-detail-mcs' },
  { label: 'Chi tiết thu hộ theo GD (NCC)', desc: 'Chi tiết theo giao dịch nhà cung cấp', path: '/accounting/reports/behalf-detail-supplier' },
  { label: 'Chi tiết thu hộ theo đơn hàng', desc: 'Chi tiết theo đơn hàng giao dịch', path: '/accounting/reports/behalf-order' },
];

const incomeReports = [
  { label: 'Báo cáo thu nhập', desc: 'Báo cáo kết quả kinh doanh', path: '/accounting/reports/income' },
  { label: 'Tăng trưởng thu nhập', desc: 'So sánh tăng trưởng doanh thu sản phẩm', path: '/accounting/reports/income-growth' },
  { label: 'Báo cáo chi phí', desc: 'Báo cáo chi phí theo danh mục', path: '/accounting/reports/expense' },
];

export const AccReportsPage: FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <PageHeader breadcrumbs={[{ label: 'Kế toán' }, { label: 'Báo cáo' }]} />
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ flex: '1 1 400px', maxWidth: 500, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#7B68EE', color: '#fff', px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Thu hộ</Typography>
          </Box>
          <List dense disablePadding>
            {behalfReports.map((r) => (
              <ListItemButton key={r.label} onClick={() => navigate(r.path)} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><ChevronRight color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary={r.label} secondary={r.desc}
                  slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper sx={{ flex: '1 1 400px', maxWidth: 500, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#82AF6F', color: '#fff', px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Thu nhập / Chi phí</Typography>
          </Box>
          <List dense disablePadding>
            {incomeReports.map((r) => (
              <ListItemButton key={r.label} onClick={() => navigate(r.path)} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><ChevronRight color="success" fontSize="small" /></ListItemIcon>
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
