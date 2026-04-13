import { apiClient } from './client';

interface OFBizResponse<T> { statusCode: string; data: T; }

export const accReportApi = {
  listPayCollBehaflAgg: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ rows: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listPayCollBehaflAggREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { rows: d?.rows ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listAgreementTermSupplier: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ rows: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listAgreementTermSupplierREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { rows: d?.rows ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listPayColBehalfDetail: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ rows: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listPayColBehalfDetailREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { rows: d?.rows ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listPayColBehalfDetailByTrans: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ rows: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listPayColBehalfDetailByTransREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { rows: d?.rows ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },
};
