import { apiClient } from './client';

interface OFBizResponse<T> { statusCode: string; data: T; }

export const accountingApi = {
  // ─── Payments (AR/AP) ────────────────────────────────────────────────────
  listPayments: async (page: number, pageSize: number, paymentType: 'AR' | 'AP', filters: {
    statusId?: string; paymentId?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ paymentList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listPaymentsREST',
      { pageIndex: String(page), pageSize: String(pageSize), paymentType, statusId: filters.statusId || '', paymentId: filters.paymentId || '' },
    );
    const d = res.data?.data;
    return { paymentList: d?.paymentList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Invoices ────────────────────────────────────────────────────────────
  listInvoices: async (page: number, pageSize: number, filters: {
    invoiceTypeId?: string; statusId?: string; invoiceId?: string;
  } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ invoiceList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listInvoicesREST',
      { pageIndex: String(page), pageSize: String(pageSize), invoiceTypeId: filters.invoiceTypeId || '', statusId: filters.statusId || '', invoiceId: filters.invoiceId || '' },
    );
    const d = res.data?.data;
    return { invoiceList: d?.invoiceList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Workshift ───────────────────────────────────────────────────────────
  listWorkShift: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ shiftList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listWorkShiftREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { shiftList: d?.shiftList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Accounting Transactions ─────────────────────────────────────────────
  listAcctgTrans: async (page: number, pageSize: number, filters: { acctgTransId?: string } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ transList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listAcctgTransREST',
      { pageIndex: String(page), pageSize: String(pageSize), acctgTransId: filters.acctgTransId || '' },
    );
    const d = res.data?.data;
    return { transList: d?.transList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Transfers ───────────────────────────────────────────────────────────
  listTransfers: async (page: number, pageSize: number, filters: { transferId?: string; statusId?: string } = {}) => {
    const res = await apiClient.post<OFBizResponse<{ transferList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listTransfersREST',
      { pageIndex: String(page), pageSize: String(pageSize), transferId: filters.transferId || '', statusId: filters.statusId || '' },
    );
    const d = res.data?.data;
    return { transferList: d?.transferList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Transaction Entries (detail) ─────────────────────────────────────────
  listAcctgTransEntries: async (acctgTransId: string) => {
    const res = await apiClient.post<OFBizResponse<{ entryList: Record<string, unknown>[] }>>(
      '/services/listAcctgTransEntriesREST', { acctgTransId });
    return res.data?.data?.entryList ?? [];
  },

  // ─── Fail Orders ─────────────────────────────────────────────────────────
  listFailOrders: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ failList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listFailOrdersREST',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { failList: d?.failList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  // ─── Reuse sales services ───────────────────────────────────────────────
  listRequirements: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ requirementList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listRequirements',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { requirementList: d?.requirementList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },

  listReturnOrderPOS: async (page: number, pageSize: number) => {
    const res = await apiClient.post<OFBizResponse<{ returnList: Record<string, unknown>[]; totalRows: string }>>(
      '/services/listReturnOrderPOS',
      { pageIndex: String(page), pageSize: String(pageSize) },
    );
    const d = res.data?.data;
    return { returnList: d?.returnList ?? [], totalRows: Number(d?.totalRows ?? 0) };
  },
};
