import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart, TrendingUp, Receipt, Assessment, PieChart, PointOfSale, Undo, Leaderboard } from '@mui/icons-material';
import { PageHeader } from '../../../components/common/PageHeader';

const reports = [
  { icon: BarChart, label: 'Báo cáo doanh số', desc: 'Thống kê doanh số theo thời gian, cửa hàng', path: '/sales/reports/revenue' },
  { icon: TrendingUp, label: 'Báo cáo tăng trưởng', desc: 'So sánh doanh thu các kỳ', path: '/sales/reports/growth' },
  { icon: Receipt, label: 'Báo cáo đơn hàng', desc: 'Chi tiết đơn hàng theo trạng thái', path: '/sales/reports/orders' },
  { icon: Assessment, label: 'Báo cáo sản phẩm', desc: 'Top sản phẩm bán chạy', path: '/sales/reports/products' },
  { icon: PieChart, label: 'Báo cáo khách hàng', desc: 'Phân tích khách hàng theo nhóm', path: '/sales/reports/customers' },
];

const posReports = [
  { icon: PointOfSale, label: 'POS - Chi tiết bán hàng', desc: 'Bán hàng theo bộ phận, sản phẩm, khách hàng', path: '/sales/reports/pos-sales' },
  { icon: Undo, label: 'POS - Hoàn trả', desc: 'Chi tiết và biểu đồ hoàn trả', path: '/sales/reports/pos-return' },
  { icon: Leaderboard, label: 'POS - Biểu đồ', desc: 'SP bán chạy, cửa hàng, danh mục', path: '/sales/reports/pos-chart' },
];

export const ReportsPage: FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Báo cáo' }]} />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {reports.map((r) => (
            <Paper key={r.label} onClick={() => navigate(r.path)}
              sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center',
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' },
                cursor: 'pointer', transition: 'all 0.15s',
                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)', boxShadow: 3 } }}>
              <r.icon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2">{r.label}</Typography>
                <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>Báo cáo POS</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {posReports.map((r) => (
            <Paper key={r.label} onClick={() => navigate(r.path)}
              sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center',
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' },
                cursor: 'pointer', transition: 'all 0.15s',
                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)', boxShadow: 3 } }}>
              <r.icon sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Box>
                <Typography variant="subtitle2">{r.label}</Typography>
                <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
