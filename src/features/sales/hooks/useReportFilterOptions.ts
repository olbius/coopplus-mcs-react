import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../../api/sales.api';
import { logisticsApi } from '../../../api/logistics.api';

export function useProductStores() {
  return useQuery({
    queryKey: ['report-filter', 'productStores'],
    queryFn: () => salesApi.listProductStores(),
    staleTime: 30 * 60 * 1000,
    select: (data) => data.map((s) => ({
      value: String(s.productStoreId ?? ''),
      label: String(s.storeName ?? s.productStoreId ?? ''),
    })),
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['report-filter', 'facilities'],
    queryFn: () => logisticsApi.listFacilities(0, 200),
    staleTime: 30 * 60 * 1000,
    select: (data) => data.facilityList.map((f) => ({
      value: String(f.facilityId ?? ''),
      label: String(f.facilityName ?? f.facilityId ?? ''),
    })),
  });
}

export function useSalesChannels() {
  return useQuery({
    queryKey: ['report-filter', 'salesChannels'],
    queryFn: () => salesApi.listEnumerationsFull('SALES_METHOD_CHN'),
    staleTime: 30 * 60 * 1000,
    select: (data) => data.map((e) => ({
      value: String(e.enumId ?? ''),
      label: String(e.description ?? e.enumId ?? ''),
    })),
  });
}

export function useCustomerGroups() {
  return useQuery({
    queryKey: ['report-filter', 'customerGroups'],
    queryFn: () => salesApi.listPartyClassificationGroups(),
    staleTime: 30 * 60 * 1000,
    select: (data) => data.map((g) => ({
      value: String(g.partyClassificationGroupId ?? ''),
      label: String(g.description ?? g.partyClassificationGroupId ?? ''),
    })),
  });
}
