import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../../api/sales.api';
import type { SalesOrderFilters } from '../../../types/sales.types';

export const useSalesOrders = (page: number, pageSize: number, filters: SalesOrderFilters = {}) =>
  useQuery({
    queryKey: ['sales-orders', page, pageSize, filters],
    queryFn: () => salesApi.listSalesOrders(page, pageSize, filters),
    placeholderData: (prev) => prev,
  });

export const useSalesOrderDetail = (orderId: string | undefined) =>
  useQuery({
    queryKey: ['sales-order-detail', orderId],
    queryFn: () => salesApi.getSalesOrderDetail(orderId!),
    enabled: !!orderId,
  });

export const useSalesReturns = (page: number, pageSize: number, filters: {
  returnId?: string; orderId?: string; statusFilters?: string[];
} = {}) =>
  useQuery({
    queryKey: ['sales-returns', page, pageSize, filters],
    queryFn: () => salesApi.listSalesReturns(page, pageSize, filters),
    placeholderData: (prev) => prev,
  });

export const useSalesReturnDetail = (returnId: string | undefined) =>
  useQuery({
    queryKey: ['sales-return-detail', returnId],
    queryFn: () => salesApi.getSalesReturnDetail(returnId!),
    enabled: !!returnId,
  });
