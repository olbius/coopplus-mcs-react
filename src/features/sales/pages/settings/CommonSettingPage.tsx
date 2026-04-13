import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { CalendarMonth, Category, PriorityHigh, Badge, Tune, People } from '@mui/icons-material';
import { PageHeader } from '../../../../components/common/PageHeader';

const items = [
  { icon: CalendarMonth, label: 'Custom Time Period', desc: 'Cấu hình kỳ thời gian tùy chỉnh', path: '/sales/settings/common/time-period' },
  { icon: Category, label: 'Channel Type', desc: 'Loại kênh bán hàng', path: '/sales/settings/common/channel' },
  { icon: PriorityHigh, label: 'Priority', desc: 'Cấu hình ưu tiên', path: '/sales/settings/common/priority' },
  { icon: Badge, label: 'Role Type', desc: 'Loại vai trò cửa hàng', path: '/sales/settings/common/role-type' },
  { icon: Tune, label: 'Product Feature', desc: 'Đặc tính sản phẩm', path: '/sales/settings/common/product-feature' },
  { icon: People, label: 'Customer Type', desc: 'Loại khách hàng', path: '/sales/settings/common/customer-type' },
];

export const CommonSettingPage: FC = () => {
  const nav = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <PageHeader breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình' }, { label: 'Cấu hình chung' }]} />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {items.map((it) => (
            <Paper key={it.label}
              sx={{ p: 2, cursor: 'pointer', display: 'flex', gap: 2, alignItems: 'center',
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' },
                '&:hover': { bgcolor: 'rgba(111, 179, 224, 0.15)' }, transition: 'background-color 0.2s' }}
              onClick={() => nav(it.path)}>
              <it.icon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2">{it.label}</Typography>
                <Typography variant="caption" color="text.secondary">{it.desc}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
