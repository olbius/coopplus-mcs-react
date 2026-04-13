import { apiClient } from './client';

interface OFBizResponse<T> { statusCode: string; data: T; }

export interface OlapGridResult {
  type: 'GRID';
  datafields: Array<string | { name: string; type?: string }>;
  data: Array<Record<string, unknown>>;
  totalsize: number;
}

export interface OlapChartResult {
  type: 'CHART';
  xAxis: string[];
  yAxis: Record<string, (number | string)[]>;
  dateType?: string;
}

export type OlapResult = OlapGridResult | OlapChartResult | { type: 'EMPTY' } | { type: 'LIST'; [key: string]: unknown };

export interface OlapParams {
  serviceName: string;
  olapType?: 'GRID' | 'COLUMNCHART' | 'LINECHART' | 'PIECHART';
  fromDate?: string;
  thruDate?: string;
  dateType?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  sorttype?: string;
  customTime?: string;
  orderStatusId?: string;
  orderStatus?: string;
  filterProductStoreGroup?: string;
  productStore?: string;
  storeChannel?: string;
  channel?: string;
  filterTypeId?: string;
  filterType?: string;
  topProduct?: string;
  statusSales?: string;
  region?: string;
  partyId?: string;
  filterTop?: string;
  filterSort?: string;
  loyaltyGroup?: string;
  typee?: string;
  type2?: string;
  monthh?: string;
  quarterr?: string;
  yearr?: string;
  // Accounting
  reportType?: string;
  organizationPartyId?: string;
}

export const reportApi = {
  runOlapReport: async (params: OlapParams): Promise<OlapResult> => {
    const body: Record<string, string> = { serviceName: params.serviceName };
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'serviceName' && v != null && v !== '') {
        body[k] = String(v);
      }
    }
    const res = await apiClient.post<OFBizResponse<{ reportData: OlapResult }>>(
      '/services/olapReportBridgeREST', body, { timeout: 120000 });
    return res.data?.data?.reportData ?? { type: 'EMPTY' };
  },
};
