export interface Product {
  productId: string;
  productName?: string;
  internalName?: string;
  productTypeId?: string;
  primaryProductCategoryId?: string;
  isVirtual?: string;
  isVariant?: string;
  createdDate?: string;
}

export interface ProductListResponse {
  productList: Product[];
  totalRows: number | string;
}

export interface ProductCategory {
  productCategoryId: string;
  categoryName?: string;
  productCategoryTypeId?: string;
  description?: string;
}

export interface ProductSupplier {
  partyId: string;
  supplierName?: string;
  lastPrice?: number;
  minimumOrderQuantity?: number;
  currencyUomId?: string;
}

export interface ProductPrice {
  productPriceTypeId: string;
  price: number;
  currencyUomId?: string;
  fromDate?: string;
  thruDate?: string;
}

export interface ProductDetail extends Product {
  description?: string;
  longDescription?: string;
  quantityUomId?: string;
  suppliers: ProductSupplier[];
  prices: ProductPrice[];
  categories: { productCategoryId: string; categoryName?: string }[];
}
