// ─── Purchase Order ──────────────────────────────────────────────────────────

export interface PurchaseOrder {
  orderId: string;
  orderDate: string;
  originFacilityId?: string;
  facilityName?: string;
  statusId: string;
  statusDescription?: string;
  orderName?: string;
  shipAfterDate?: string;
  shipBeforeDate?: string;
  priority?: string;
  priorityDescription?: string;
  remainingSubTotal?: number;
  grandTotal?: number;
  currencyUom?: string;
  isAllocation?: string;
}

export interface POFilters {
  orderId?: string;
  originFacilityId?: string;
  statusFilters?: string[];
  isAllocationFilters?: string[];
  orderName?: string;
  fromDate?: string;
  thruDate?: string;
}

export interface POListResponse {
  poList: PurchaseOrder[];
  totalRows: number | string;
}

export const PO_STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Tạo mới',
  ORDER_PROCESSING: 'Đang xử lý',
  ORDER_APPROVED: 'Đã duyệt',
  ORDER_COMPLETED: 'Hoàn thành',
  ORDER_CANCELLED: 'Đã hủy',
  ORDER_ESTIMATED: 'Ước lượng',
};

export const PO_ORDER_TYPE_LABELS: Record<string, string> = {
  N: 'Bình thường',
  T: 'Nhập kho',
  P: 'Phân bổ',
};

// ─── PO Detail ──────────────────────────────────────────────────────────────

export interface POItemDetail {
  orderItemSeqId: string;
  productId: string;
  productName?: string;
  itemDescription?: string;
  quantity: number;
  cancelQuantity?: number;
  unitPrice: number;
  subTotal?: number;
  statusId?: string;
  statusDescription?: string;
}

export interface POStatusHistory {
  statusId: string;
  statusDescription?: string;
  statusDatetime: string;
  statusUserLogin?: string;
}

export interface PurchaseOrderDetail {
  orderId: string;
  orderDate: string;
  statusId: string;
  statusDescription?: string;
  currencyUom: string;
  grandTotal: number;
  remainingSubTotal?: number;
  orderName?: string;
  createdBy?: string;
  originFacilityId?: string;
  facilityName?: string;
  priority?: string;
  isAllocation?: string;
  shipAfterDate?: string;
  shipBeforeDate?: string;
  supplierPartyId?: string;
  supplierName?: string;
  items: POItemDetail[];
  statusHistory: POStatusHistory[];
}

// ─── Supplier ───────────────────────────────────────────────────────────────

export interface Supplier {
  partyId: string;
  groupName?: string;
  email?: string;
  phone?: string;
  statusId?: string;
}

export interface SupplierListResponse {
  supplierList: Supplier[];
  totalRows: number | string;
}

// ─── Return Supplier ────────────────────────────────────────────────────────

export interface ReturnSupplier {
  returnId: string;
  statusId: string;
  statusDescription?: string;
  returnDate?: string;
  supplierPartyId?: string;
  supplierName?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface ReturnSupplierListResponse {
  returnList: ReturnSupplier[];
  totalRows: number | string;
}

// ─── Purchase Agreement ─────────────────────────────────────────────────────

export interface PurchaseAgreement {
  agreementId: string;
  partyIdFrom: string;
  partyIdTo: string;
  supplierName?: string;
  agreementDate?: string;
  statusId?: string;
  description?: string;
}

export interface PurchaseAgreementListResponse {
  agreementList: PurchaseAgreement[];
  totalRows: number | string;
}

// ─── Purchase Requirement ───────────────────────────────────────────────────

export interface PurchaseRequirement {
  requirementId: string;
  requirementTypeId?: string;
  statusId: string;
  statusDescription?: string;
  description?: string;
  createdDate?: string;
  requiredByDate?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface PurchaseRequirementListResponse {
  requirementList: PurchaseRequirement[];
  totalRows: number | string;
}
