import { useQuery } from '@tanstack/react-query';
import { supplierApi, type SupplierFilters } from '../../../api/supplier.api';

export const useSuppliers = (page: number, pageSize: number, filters: SupplierFilters = {}) =>
  useQuery({
    queryKey: ['suppliers-list', page, pageSize, filters],
    queryFn: () => supplierApi.listSuppliers(page, pageSize, filters),
    placeholderData: (prev) => prev,
  });

export const useSupplierDetail = (partyId: string | undefined) =>
  useQuery({
    queryKey: ['supplier-detail', partyId],
    queryFn: () => supplierApi.getSupplierDetail(partyId!),
    enabled: !!partyId,
  });

export interface SupplierProductFilters {
  productCode?: string;
  productName?: string;
  groupName?: string;
  supplierProductId?: string;
}

export const useSupplierProducts = (page: number, pageSize: number, filters: SupplierProductFilters = {}) =>
  useQuery({
    queryKey: ['supplier-products-all', page, pageSize, filters],
    queryFn: () => supplierApi.listSupplierProducts(page, pageSize, filters),
    placeholderData: (prev) => prev,
  });
