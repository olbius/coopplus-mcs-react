import { apiClient } from './client';
import type {
  POFilters, POListResponse, PurchaseOrderDetail,
  ReturnSupplierListResponse, PurchaseAgreementListResponse,
  PurchaseRequirementListResponse,
  Supplier, SupplierListResponse,
} from '../types/purchasing.types';

interface OFBizResponse<T> {
  statusCode: string;
  statusDescription?: string;
  data: T;
}

export const purchasingApi = {
  // ─── PO Lists ─────────────────────────────────────────────────────────────

  listPurchaseOrders: async (
    filters: POFilters, page: number, pageSize: number,
  ): Promise<POListResponse> => {
    const { statusFilters, isAllocationFilters, ...rest } = filters;
    const response = await apiClient.post<OFBizResponse<POListResponse>>(
      '/services/listPurchaseOrders',
      {
        pageIndex: page, pageSize,
        ...rest,
        ...(statusFilters?.length ? { statusFilters } : {}),
        ...(isAllocationFilters?.length ? { isAllocationFilters } : {}),
        fromDate: filters.fromDate ? `${filters.fromDate} 00:00:00.000` : undefined,
        thruDate: filters.thruDate ? `${filters.thruDate} 23:59:59.999` : undefined,
      },
    );
    const payload = response.data?.data ?? (response.data as unknown as POListResponse);
    return { poList: payload.poList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  listPOWaitingApprove: async (page: number, pageSize: number): Promise<POListResponse> => {
    const response = await apiClient.post<OFBizResponse<POListResponse>>(
      '/services/listPOWaitingApprove',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as POListResponse);
    return { poList: payload.poList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  listPOWaitingImport: async (page: number, pageSize: number): Promise<POListResponse> => {
    const response = await apiClient.post<OFBizResponse<POListResponse>>(
      '/services/listPOWaitingImport',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as POListResponse);
    return { poList: payload.poList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  listPONotReceived: async (page: number, pageSize: number): Promise<POListResponse> => {
    const response = await apiClient.post<OFBizResponse<POListResponse>>(
      '/services/listPONotReceived',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as POListResponse);
    return { poList: payload.poList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  listAllocationPO: async (page: number, pageSize: number): Promise<POListResponse> => {
    const response = await apiClient.post<OFBizResponse<POListResponse>>(
      '/services/listAllocationPO',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as POListResponse);
    return { poList: payload.poList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  // ─── PO Detail ────────────────────────────────────────────────────────────

  getPurchaseOrderDetail: async (orderId: string): Promise<PurchaseOrderDetail> => {
    const response = await apiClient.post<OFBizResponse<{ order: PurchaseOrderDetail }>>(
      '/services/getPurchaseOrderDetail',
      { orderId },
    );
    const payload = response.data?.data ?? ({} as { order: PurchaseOrderDetail });
    return payload.order;
  },

  // ─── Returns ──────────────────────────────────────────────────────────────

  listReturnSupplier: async (page: number, pageSize: number): Promise<ReturnSupplierListResponse> => {
    const response = await apiClient.post<OFBizResponse<ReturnSupplierListResponse>>(
      '/services/listReturnSupplier',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as ReturnSupplierListResponse);
    return { returnList: payload.returnList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  // ─── Agreements ───────────────────────────────────────────────────────────

  listPurchaseAgreements: async (page: number, pageSize: number): Promise<PurchaseAgreementListResponse> => {
    const response = await apiClient.post<OFBizResponse<PurchaseAgreementListResponse>>(
      '/services/listPurchaseAgreements',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as PurchaseAgreementListResponse);
    return { agreementList: payload.agreementList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  // ─── Requirements ─────────────────────────────────────────────────────────

  listPurchaseRequirements: async (page: number, pageSize: number): Promise<PurchaseRequirementListResponse> => {
    const response = await apiClient.post<OFBizResponse<PurchaseRequirementListResponse>>(
      '/services/listPurchaseRequirements',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? (response.data as unknown as PurchaseRequirementListResponse);
    return { requirementList: payload.requirementList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  // ─── Lookups ───────────────────────────────────────────────────────────────

  listSuppliers: async (keyword?: string): Promise<Supplier[]> => {
    const response = await apiClient.post<OFBizResponse<{ supplierList: Supplier[] }>>(
      '/services/listSuppliers',
      { keyword: keyword || '' },
    );
    return response.data?.data?.supplierList ?? [];
  },

  listFacilities: async (keyword?: string): Promise<{ facilityId: string; facilityName: string }[]> => {
    const response = await apiClient.post<OFBizResponse<{ facilityList: { facilityId: string; facilityName: string }[] }>>(
      '/services/listFacilities',
      { keyword: keyword || '' },
    );
    return response.data?.data?.facilityList ?? [];
  },

  getProductsBySupplier: async (supplierId: string, keyword?: string): Promise<{ productId: string; productName: string; lastPrice: number; minimumOrderQuantity: number; currencyUomId: string }[]> => {
    const response = await apiClient.post<OFBizResponse<{ productList: unknown[] }>>(
      '/services/getProductsBySupplierREST',
      { supplierId, keyword: keyword || '' },
    );
    return (response.data?.data?.productList ?? []) as { productId: string; productName: string; lastPrice: number; minimumOrderQuantity: number; currencyUomId: string }[];
  },

  // ─── Create PO ────────────────────────────────────────────────────────────

  createPurchaseOrder: async (data: {
    partyIdFrom: string;
    orderName?: string;
    originFacilityId?: string;
    currencyUomId?: string;
    shipBeforeDate?: string;
    shipAfterDate?: string;
    orderItems?: string;
  }): Promise<{ orderId: string }> => {
    // Backend expects dates as epoch milliseconds strings
    const toEpoch = (dateStr?: string) => {
      if (!dateStr) return String(Date.now());
      return String(new Date(dateStr).getTime());
    };
    const response = await apiClient.post<OFBizResponse<{ orderId: string }>>(
      '/services/createNewPurchaseOrder',
      {
        ...data,
        shipBeforeDate: toEpoch(data.shipBeforeDate),
        shipAfterDate: toEpoch(data.shipAfterDate),
      },
    );
    return response.data?.data ?? { orderId: '' };
  },

  // ─── Promotions ───────────────────────────────────────────────────────────

  listPromotionsPO: async (page: number, pageSize: number) => {
    const response = await apiClient.post<OFBizResponse<{ promotionList: unknown[]; totalRows: string }>>(
      '/services/listPromotionsPO',
      { pageIndex: page, pageSize },
    );
    const payload = response.data?.data ?? { promotionList: [], totalRows: '0' };
    return { promotionList: payload.promotionList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },
};
