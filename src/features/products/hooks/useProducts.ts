import { useQuery } from '@tanstack/react-query';
import { productApi, type ProductFilters } from '../../../api/product.api';

export const useProducts = (page: number, pageSize: number, filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ['products', page, pageSize, filters],
    queryFn: () => productApi.listProducts(page, pageSize, filters),
    placeholderData: (prev) => prev,
  });

export const useProductCategories = () =>
  useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productApi.listProductCategories(),
  });

export const useProductCatalogs = () =>
  useQuery({
    queryKey: ['product-catalogs'],
    queryFn: () => productApi.listProductCatalogs(),
  });

export const useProductDetail = (productId: string | undefined) =>
  useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => productApi.getProductDetail(productId!),
    enabled: !!productId,
  });

export const useCategoryDetail = (productCategoryId: string | undefined) =>
  useQuery({
    queryKey: ['category-detail', productCategoryId],
    queryFn: () => productApi.getCategoryDetail(productCategoryId!),
    enabled: !!productCategoryId,
  });
