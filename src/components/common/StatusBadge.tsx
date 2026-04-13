import { type FC } from 'react';
import { Chip } from '@mui/material';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'default';

const VARIANT_MAP: Record<string, Variant> = {
  ACTIVE: 'success', APPROVED: 'success', COMPLETED: 'success', PAID: 'success',
  INACTIVE: 'default', CANCELLED: 'error', REJECTED: 'error',
  PENDING: 'warning', IN_PROGRESS: 'info', DRAFT: 'default',
  ORDER_CREATED: 'info', ORDER_PROCESSING: 'warning', ORDER_APPROVED: 'success',
  ORDER_COMPLETED: 'success', ORDER_CANCELLED: 'error', ORDER_REJECTED: 'error',
  ORDER_ESTIMATED: 'info',
  RETURN_REQUESTED: 'warning', RETURN_ACCEPTED: 'info', RETURN_RECEIVED: 'success',
  RETURN_COMPLETED: 'success', RETURN_CANCELLED: 'error',
  REQ_CREATED: 'info', REQ_PROPOSED: 'warning', REQ_APPROVED: 'success',
  REQ_CONFIRMED: 'success', REQ_REJECTED: 'error', REQ_CANCELLED: 'error',
  REQ_COMPLETED: 'success',
  PARTY_ENABLED: 'success', PARTY_DISABLED: 'error',
  SUPPLIER_ACTIVE: 'success', SUPPLIER_INACTIVE: 'default',
  PROMO_CREATED: 'warning', PROMO_ACCEPTED: 'success', PROMO_CANCELLED: 'error',
};

const COLOR_MAP: Record<Variant, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  success: 'success', error: 'error', warning: 'warning', info: 'info', default: 'default',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, label, size = 'small' }) => {
  const variant = VARIANT_MAP[status?.toUpperCase()] ?? 'default';
  const color = COLOR_MAP[variant];
  const displayLabel = label ?? status?.replace(/_/g, ' ') ?? '';

  return (
    <Chip label={displayLabel} color={color} size={size} variant="outlined"
      sx={{ fontWeight: 500, textTransform: 'capitalize' }} />
  );
};
