import { apiClient } from './client';
import type { ProductListResponse, ProductCategory, ProductDetail } from '../types/product.types';

interface OFBizResponse<T> {
  statusCode: string;
  data: T;
}

export interface ProductFilters {
  productId?: string;
  productName?: string;
  productCategoryId?: string;
  isDeactive?: string;
  stateFilter?: string;
}

export const productApi = {
  listProducts: async (
    page: number, pageSize: number, filters: ProductFilters = {},
  ): Promise<ProductListResponse> => {
    const response = await apiClient.post<OFBizResponse<ProductListResponse>>(
      '/services/listProducts',
      {
        pageIndex: String(page),
        pageSize: String(pageSize),
        productId: filters.productId || '',
        productName: filters.productName || '',
        productCategoryId: filters.productCategoryId || '',
        isDeactive: filters.isDeactive || '',
        stateFilter: filters.stateFilter || '',
      },
    );
    const payload = response.data?.data ?? (response.data as unknown as ProductListResponse);
    return { productList: payload.productList ?? [], totalRows: Number(payload.totalRows ?? 0) };
  },

  listProductCategories: async (keyword?: string): Promise<ProductCategory[]> => {
    const response = await apiClient.post<OFBizResponse<{ categoryList: ProductCategory[] }>>(
      '/services/listProductCategories',
      { keyword: keyword || '' },
    );
    return response.data?.data?.categoryList ?? [];
  },

  listProductCatalogs: async (keyword?: string): Promise<{ prodCatalogId: string; catalogName: string; useQuickAdd: string; categoryCount: number }[]> => {
    const response = await apiClient.post<OFBizResponse<{ catalogList: { prodCatalogId: string; catalogName: string; useQuickAdd: string; categoryCount: number }[] }>>(
      '/services/listProductCatalogs',
      { keyword: keyword || '' },
    );
    return response.data?.data?.catalogList ?? [];
  },

  getCategoryDetail: async (productCategoryId: string): Promise<{
    category: { productCategoryId: string; categoryName: string; productCategoryTypeId: string; description: string; longDescription: string; primaryParentCategoryId: string };
    childCategories: { productCategoryId: string; categoryName: string; sequenceNum: number }[];
    products: { productId: string; productName: string; productCode: string; sequenceNum: number }[];
  }> => {
    const response = await apiClient.post<OFBizResponse<{
      category: { productCategoryId: string; categoryName: string; productCategoryTypeId: string; description: string; longDescription: string; primaryParentCategoryId: string };
      childCategories: { productCategoryId: string; categoryName: string; sequenceNum: number }[];
      products: { productId: string; productName: string; productCode: string; sequenceNum: number }[];
    }>>('/services/getCategoryDetail', { productCategoryId });
    return response.data?.data;
  },

  getProductDetail: async (productId: string): Promise<ProductDetail> => {
    const response = await apiClient.post<OFBizResponse<{ product: ProductDetail }>>(
      '/services/getProductDetail',
      { productId },
    );
    return response.data?.data?.product;
  },
};
