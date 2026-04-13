import { apiClient } from './client';

interface OFBizResponse<T> { statusCode: string; data: T; }

export const logisticsApi = {
  getFacilityDetail: async (facilityId: string) => {
    const res = await apiClient.post<OFBizResponse<{ facility: Record<string, unknown> }>>(
      '/services/getFacilityDetailREST', { facilityId });
    return res.data?.data?.facility;
  },

  getRequirementDetail: async (requirementId: string) => {
    const res = await apiClient.post<OFBizResponse<{ requirement: Record<string, unknown> }>>(
      '/services/getRequirementDetailREST', { requirementId });
    return res.data?.data?.requirement;
  },

  listFacilities: async (page: number, pageSize: number, filters: { facilityId?: string; facilityName?: string } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ facilityList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listFacilitiesREST',
      { pageIndex: String(page), pageSize: String(pageSize), facilityId: filters.facilityId || '', facilityName: filters.facilityName || '' },
    );
    const d = res.data?.data;
    return { facilityList: d?.facilityList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listInventoryItems: async (page: number, pageSize: number, filters: { facilityId?: string; productId?: string } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ itemList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listInventoryItemsREST',
      { pageIndex: String(page), pageSize: String(pageSize), facilityId: filters.facilityId || '', productId: filters.productId || '' },
    );
    const d = res.data?.data;
    return { itemList: d?.itemList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listFacilityPartyRoles: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ roleList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listFacilityPartyRolesREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { roleList: d?.roleList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listShipments: async (page: number, pageSize: number, shipmentTypeId?: string) => {
    const res = await apiClient.post<OFBizResponse<{ shipmentList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listShipmentsREST',
      { pageIndex: String(page), pageSize: String(pageSize), shipmentTypeId: shipmentTypeId || '' },
    );
    const d = res.data?.data;
    return { shipmentList: d?.shipmentList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },
};
