import { apiClient } from './client';

interface OFBizResponse<T> { statusCode: string; data: T; }

export interface SupplierItem {
  partyId: string;
  groupName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierFilters {
  partyId?: string;
  groupName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierDetail extends SupplierItem {
  address1?: string;
  city?: string;
}

export interface SupplierProduct {
  partyId: string;
  groupName?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  minimumOrderQuantity?: number;
  lastPrice?: number;
  currencyUomId?: string;
  supplierProductId?: string;
  availableFromDate?: string;
  availableThruDate?: string;
}

export const supplierApi = {
  listSuppliers: async (page: number, pageSize: number, filters: SupplierFilters = {}) => {
    const res = await apiClient.post<OFBizResponse<{ supplierList: SupplierItem[]; totalRows: string }>>(
      '/services/listSuppliersREST',
      {
        pageIndex: String(page),
        pageSize: String(pageSize),
        partyId: filters.partyId || '',
        groupName: filters.groupName || '',
        email: filters.email || '',
        phone: filters.phone || '',
        address: filters.address || '',
      },
    );
    const d = res.data?.data;
    return { supplierList: d?.supplierList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  getSupplierDetail: async (partyId: string) => {
    const res = await apiClient.post<OFBizResponse<{ supplier: SupplierDetail; products: SupplierProduct[] }>>(
      '/services/getSupplierDetail',
      { partyId },
    );
    return res.data?.data;
  },

  listSupplierProducts: async (page: number, pageSize: number, filters: {
    productCode?: string; productName?: string; groupName?: string; supplierProductId?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ supplierProductList: SupplierProduct[]; totalRows: string }>>(
      '/services/listSupplierProductsREST',
      {
        pageIndex: String(page), pageSize: String(pageSize),
        productCode: filters.productCode || '',
        productName: filters.productName || '',
        groupName: filters.groupName || '',
        supplierProductId: filters.supplierProductId || '',
      },
    );
    const d = res.data?.data;
    return { supplierProductList: d?.supplierProductList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },
};
