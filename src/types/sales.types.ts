export interface SalesOrder {
  orderId: string;
  orderDate: string;
  statusId: string;
  statusDescription?: string;
  orderName?: string;
  grandTotal?: number;
  currencyUom?: string;
  productStoreId?: string;
  productStoreName?: string;
  createdBy?: string;
  customerPartyId?: string;
  customerName?: string;
  salesChannelEnumId?: string;
}

export interface SalesOrderFilters {
  orderId?: string;
  productStoreId?: string;
  statusFilters?: string[];
  createdBy?: string;
  billToPartyId?: string;
  fromDate?: string;
  thruDate?: string;
}

export interface SalesOrderListResponse {
  orderList: SalesOrder[];
  totalRows: number | string;
}

export const SALES_ORDER_STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Tạo mới',
  ORDER_APPROVED: 'Đã duyệt',
  ORDER_COMPLETED: 'Hoàn thành',
  ORDER_CANCELLED: 'Đã hủy',
  ORDER_HOLD: 'Tạm giữ',
  ORDER_REJECTED: 'Từ chối',
  ORDER_DOUBTED: 'Nghi ngờ',
};

export interface SalesReturn {
  returnId: string;
  statusId: string;
  statusDescription?: string;
  returnDate?: string;
  fromPartyId?: string;
  customerName?: string;
  toPartyId?: string;
  grandTotal?: number;
}

export interface SalesReturnListResponse {
  returnList: SalesReturn[];
  totalRows: number | string;
}
