import { type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link, Divider } from '@mui/material';
import { NavigateNext as SepIcon } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
  const nav = useNavigate();
  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs separator={<SepIcon sx={{ fontSize: 16 }} />} sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              if (isLast) {
                return (
                  <Typography key={i} variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                    {crumb.label}
                  </Typography>
                );
              }
              if (crumb.path) {
                return (
                  <Link key={i} component="button" underline="hover" color="text.secondary" variant="body2"
                    onClick={() => nav(crumb.path!)} sx={{ cursor: 'pointer' }}>
                    {crumb.label}
                  </Link>
                );
              }
              return (
                <Typography key={i} variant="body2" color="text.secondary">
                  {crumb.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        ) : title ? (
          <Typography variant="body1" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        ) : null}
        {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};
