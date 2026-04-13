import { useQuery } from '@tanstack/react-query';
import { purchasingApi } from '../../../api/purchasing.api';

export const usePurchaseOrderDetail = (orderId: string | undefined) =>
  useQuery({
    queryKey: ['purchasing', 'order-detail', orderId],
    queryFn: () => purchasingApi.getPurchaseOrderDetail(orderId!),
    enabled: !!orderId,
  });
