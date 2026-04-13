import { apiClient } from './client';
import type { SalesOrderFilters, SalesOrderListResponse, SalesReturnListResponse } from '../types/sales.types';

interface OFBizResponse<T> { statusCode: string; data: T; }

export const salesApi = {
  // ─── Orders ───────────────────────────────────────────────────────────────

  listSalesOrders: async (page: number, pageSize: number, filters: SalesOrderFilters = {}): Promise<SalesOrderListResponse> => {
    const res = await apiClient.post<OFBizResponse<SalesOrderListResponse>>(
      '/services/listSalesOrder',
      {
        pageIndex: String(page),
        pageSize: String(pageSize),
        orderTypeId: 'SALES_ORDER',
        orderId: filters.orderId || '',
        productStoreId: filters.productStoreId || '',
        createdBy: filters.createdBy || '',
        billToPartyId: filters.billToPartyId || '',
        ...(filters.statusFilters?.length ? { statusFilters: filters.statusFilters } : {}),
        ...(filters.fromDate ? { fromDate: `${filters.fromDate} 00:00:00.000` } : {}),
        ...(filters.thruDate ? { thruDate: `${filters.thruDate} 23:59:59.999` } : {}),
      },
    );
    const d = res.data?.data ?? (res.data as unknown as SalesOrderListResponse);
    return { orderList: d.orderList ?? [], totalRows: Number(d.totalRows ?? 0) };
  },

  getSalesOrderDetail: async (orderId: string) => {
    const res = await apiClient.post<OFBizResponse<{ order: Record<string, unknown> }>>(
      '/services/getSalesOrderDetail',
      { orderId },
    );
    return res.data?.data?.order;
  },

  // ─── Returns ──────────────────────────────────────────────────────────────

  listSalesReturns: async (page: number, pageSize: number, filters: {
    returnId?: string; orderId?: string; statusFilters?: string[];
  } = {}): Promise<SalesReturnListResponse> => {
    const res = await apiClient.post<OFBizResponse<SalesReturnListResponse>>(
      '/services/listSalesReturn',
      {
        pageIndex: String(page),
        pageSize: String(pageSize),
        returnId: filters.returnId || '',
        orderId: filters.orderId || '',
        ...(filters.statusFilters?.length ? { statusFilters: filters.statusFilters } : {}),
      },
    );
    const d = res.data?.data ?? (res.data as unknown as SalesReturnListResponse);
    return { returnList: d.returnList ?? [], totalRows: Number(d.totalRows ?? 0) };
  },

  getSalesReturnDetail: async (returnId: string) => {
    const res = await apiClient.post<OFBizResponse<{ returnOrder: Record<string, unknown> }>>(
      '/services/getSalesReturnDetail',
      { returnId },
    );
    return res.data?.data?.returnOrder;
  },

  // ─── Customers ────────────────────────────────────────────────────────────

  listCustomersFamily: async (page: number, pageSize: number, keyword?: string) => {
    const res = await apiClient.post<OFBizResponse<{ customerList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listCustomersFamily',
      { pageIndex: String(page), pageSize: String(pageSize), keyword: keyword || '' },
    );
    const d = res.data?.data;
    return { customerList: d?.customerList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listCustomersBusinesses: async (page: number, pageSize: number, keyword?: string) => {
    const res = await apiClient.post<OFBizResponse<{ customerList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listCustomersBusinesses',
      { pageIndex: String(page), pageSize: String(pageSize), keyword: keyword || '' },
    );
    const d = res.data?.data;
    return { customerList: d?.customerList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listCustomersSchool: async (page: number, pageSize: number, keyword?: string) => {
    const res = await apiClient.post<OFBizResponse<{ customerList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listCustomersSchool',
      { pageIndex: String(page), pageSize: String(pageSize), keyword: keyword || '' },
    );
    const d = res.data?.data;
    return { customerList: d?.customerList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listLoyaltyCustomers: async (page: number, pageSize: number, keyword?: string) => {
    const res = await apiClient.post<OFBizResponse<{ customerList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listLoyaltyCustomers',
      { pageIndex: String(page), pageSize: String(pageSize), keyword: keyword || '' },
    );
    const d = res.data?.data;
    return { customerList: d?.customerList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Employee ─────────────────────────────────────────────────────────────

  listEmployees: async (keyword?: string) => {
    const res = await apiClient.post<OFBizResponse<{ employeeList: Record<string, unknown>[] }>>(
      '/services/listEmployees',
      { keyword: keyword || '' },
    );
    return res.data?.data?.employeeList ?? [];
  },

  listHistoryLoginPOS: async (page: number, pageSize: number, filters: {
    partyCode?: string; partyName?: string; userLoginId?: string;
    posTerminalId?: string; terminalName?: string;
    fromDateFrom?: string; fromDateThru?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ historyList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listHistoryLoginPOS',
      {
        pageIndex: String(page), pageSize: String(pageSize),
        partyCode: filters.partyCode || '',
        partyName: filters.partyName || '',
        userLoginId: filters.userLoginId || '',
        posTerminalId: filters.posTerminalId || '',
        terminalName: filters.terminalName || '',
        ...(filters.fromDateFrom ? { fromDateFrom: filters.fromDateFrom } : {}),
        ...(filters.fromDateThru ? { fromDateThru: filters.fromDateThru } : {}),
      },
    );
    const d = res.data?.data;
    return { historyList: d?.historyList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── EVN Invoices ───────────────────────────────────────────────────────

  getEvnInvoiceList: async (fromDate: string, thruDate: string) => {
    const res = await apiClient.post<OFBizResponse<{ root: Record<string, unknown>[]; responseCode: string; responseMessage: string }>>(
      '/services/getEvnInvoiceList',
      { fromDate, thruDate },
    );
    const d = res.data?.data;
    return { root: d?.root ?? [], responseCode: d?.responseCode, responseMessage: d?.responseMessage };
  },

  // ─── Partner / Agreements ────────────────────────────────────────────────

  listAgreements: async (page: number, pageSize: number, filters: { agreementId?: string; statusFilters?: string[] } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ agreementList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listAgreements',
      {
        pageIndex: String(page), pageSize: String(pageSize),
        agreementId: filters.agreementId || '',
        ...(filters.statusFilters?.length ? { statusFilters: filters.statusFilters } : {}),
      },
    );
    const d = res.data?.data;
    return { agreementList: d?.agreementList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listPos3PtyTransLog: async (page: number, pageSize: number, filters: {
    thirdPartyCode?: string; statusId?: string; statusCode?: string;
    orderId?: string; productId?: string; requestId?: string;
    entryDateFrom?: string; entryDateThru?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ logList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listPos3PtyTransLog',
      {
        pageIndex: String(page), pageSize: String(pageSize),
        thirdPartyCode: filters.thirdPartyCode || '',
        statusId: filters.statusId || '',
        statusCode: filters.statusCode || '',
        orderId: filters.orderId || '',
        productId: filters.productId || '',
        requestId: filters.requestId || '',
        ...(filters.entryDateFrom ? { entryDateFrom: filters.entryDateFrom } : {}),
        ...(filters.entryDateThru ? { entryDateThru: filters.entryDateThru } : {}),
      },
    );
    const d = res.data?.data;
    return { logList: d?.logList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listKhttOrderOffline: async (page: number, pageSize: number, filters: {
    orderId?: string; sgcCustomerId?: string; isPush?: string;
    entryDateFrom?: string; entryDateThru?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ orderList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listKhttOrderOffline',
      {
        pageIndex: String(page), pageSize: String(pageSize),
        orderId: filters.orderId || '',
        sgcCustomerId: filters.sgcCustomerId || '',
        isPush: filters.isPush || '',
        ...(filters.entryDateFrom ? { entryDateFrom: filters.entryDateFrom } : {}),
        ...(filters.entryDateThru ? { entryDateThru: filters.entryDateThru } : {}),
      },
    );
    const d = res.data?.data;
    return { orderList: d?.orderList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  getCardInfoDetail: async (orderId?: string, requestId?: string) => {
    const res = await apiClient.post<OFBizResponse<{ orderId: string; requestId: string; orderDate: string; listCards: Record<string, unknown>[]; orderStatusDesc: string }>>(
      '/services/getCardInfoDetail',
      { orderId: orderId || '', requestId: requestId || '' },
    );
    return res.data?.data;
  },

  // ─── Settings ────────────────────────────────────────────────────────────

  listProductStoreGroups: async () => {
    const res = await apiClient.post<OFBizResponse<{ storeGroupList: Record<string, unknown>[] }>>(
      '/services/listProductStoreGroups',
      { _: '' },
    );
    return res.data?.data?.storeGroupList ?? [];
  },

  // ─── Create services ───────────────────────────────────────────────────

  createProductStoreGroup: async (data: { productStoreGroupId?: string; productStoreGroupName: string; description?: string }) => {
    const res = await apiClient.post('/services/createProductStoreGroupREST', data);
    return res.data?.data;
  },

  createTerminalPOS: async (data: { posTerminalId: string; terminalName: string; facilityId?: string }) => {
    const res = await apiClient.post('/services/createTerminalPOSREST', data);
    return res.data?.data;
  },

  createConfigPrintOrder: async (data: { productStoreId: string; fontFamily?: string; headerFontSize?: string; infoFontSize?: string; contentFontSize?: string }) => {
    const res = await apiClient.post('/services/createConfigPrintOrderREST', data);
    return res.data?.data;
  },

  createPosWallet: async (data: { walletId?: string; walletName?: string; currencyUomId?: string }) => {
    const res = await apiClient.post('/services/createPosWalletREST', data);
    return res.data?.data;
  },

  createQuickPickMenu: async (data: { menuId: string; menuName: string; menuTypeId?: string }) => {
    const res = await apiClient.post('/services/createQuickPickMenuREST', data);
    return res.data?.data;
  },

  listProductFeatures: async () => {
    const res = await apiClient.post<OFBizResponse<{ featureList: Record<string, unknown>[] }>>(
      '/services/listProductFeaturesREST', { _: '' });
    return res.data?.data?.featureList ?? [];
  },

  listAgreementTerms: async () => {
    const res = await apiClient.post<OFBizResponse<{ termList: Record<string, unknown>[] }>>(
      '/services/listAgreementTermsREST', { _: '' });
    return res.data?.data?.termList ?? [];
  },

  listConfigPrintOrder: async () => {
    const res = await apiClient.post<OFBizResponse<{ configList: Record<string, unknown>[] }>>(
      '/services/listConfigPrintOrderREST', { _: '' });
    return res.data?.data?.configList ?? [];
  },

  listProductStores: async () => {
    const res = await apiClient.post<OFBizResponse<{ storeList: Record<string, unknown>[] }>>(
      '/services/listProductStoresREST', { _: '' });
    return res.data?.data?.storeList ?? [];
  },

  listTerminalPOS: async () => {
    const res = await apiClient.post<OFBizResponse<{ terminalList: Record<string, unknown>[] }>>(
      '/services/listTerminalPOSREST', { _: '' });
    return res.data?.data?.terminalList ?? [];
  },

  listPosWallets: async () => {
    const res = await apiClient.post<OFBizResponse<{ walletList: Record<string, unknown>[] }>>(
      '/services/listPosWalletsREST', { _: '' });
    return res.data?.data?.walletList ?? [];
  },

  listCustomerGroups: async () => {
    const res = await apiClient.post<OFBizResponse<{ groupList: Record<string, unknown>[] }>>(
      '/services/listCustomerGroupsREST', { _: '' });
    return res.data?.data?.groupList ?? [];
  },

  listPartyClassificationGroups: async () => {
    const res = await apiClient.post<OFBizResponse<{ groupList: Record<string, unknown>[] }>>(
      '/services/listPartyClassificationGroupsREST', { _: '' });
    return res.data?.data?.groupList ?? [];
  },

  listQuickPickMenus: async () => {
    const res = await apiClient.post<OFBizResponse<{ menuList: Record<string, unknown>[] }>>(
      '/services/listQuickPickMenusREST', { _: '' });
    return res.data?.data?.menuList ?? [];
  },

  // ─── Common Settings sub-pages ────────────────────────────────────────────

  listEnumerationsFull: async (enumTypeId: string) => {
    const res = await apiClient.post<OFBizResponse<{ enumList: Record<string, unknown>[] }>>(
      '/services/listEnumerationsFullREST', { enumTypeId });
    return res.data?.data?.enumList ?? [];
  },

  listCustomTimePeriods: async () => {
    const res = await apiClient.post<OFBizResponse<{ periodList: Record<string, unknown>[] }>>(
      '/services/listCustomTimePeriodsREST', { _: '' });
    return res.data?.data?.periodList ?? [];
  },

  listRoleTypes: async () => {
    const res = await apiClient.post<OFBizResponse<{ roleList: Record<string, unknown>[] }>>(
      '/services/listRoleTypesREST', { _: '' });
    return res.data?.data?.roleList ?? [];
  },

  listPartyTypes: async () => {
    const res = await apiClient.post<OFBizResponse<{ typeList: Record<string, unknown>[] }>>(
      '/services/listPartyTypesREST', { _: '' });
    return res.data?.data?.typeList ?? [];
  },
};
