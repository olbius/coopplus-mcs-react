import { useQuery } from '@tanstack/react-query';
import { purchasingApi } from '../../../api/purchasing.api';
import type { POFilters } from '../../../types/purchasing.types';

export const usePurchaseOrders = (filters: POFilters, page: number, pageSize: number) =>
  useQuery({
    queryKey: ['purchasing', 'orders', filters, page, pageSize],
    queryFn: () => purchasingApi.listPurchaseOrders(filters, page, pageSize),
    placeholderData: (prev) => prev,
  });

export const usePOWaitingApprove = (page: number, pageSize: number) =>
  useQuery({
    queryKey: ['purchasing', 'waiting-approve', page, pageSize],
    queryFn: () => purchasingApi.listPOWaitingApprove(page, pageSize),
    placeholderData: (prev) => prev,
  });

export const usePOWaitingImport = (page: number, pageSize: number) =>
  useQuery({
    queryKey: ['purchasing', 'waiting-import', page, pageSize],
    queryFn: () => purchasingApi.listPOWaitingImport(page, pageSize),
    placeholderData: (prev) => prev,
  });
