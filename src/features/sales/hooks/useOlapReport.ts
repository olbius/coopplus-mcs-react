import { useQuery } from '@tanstack/react-query';
import { reportApi, type OlapParams, type OlapResult } from '../../../api/report.api';

export function useOlapReport(params: OlapParams | null, enabled = true) {
  return useQuery<OlapResult>({
    queryKey: ['olap-report', params],
    queryFn: () => reportApi.runOlapReport(params!),
    enabled: enabled && params != null && !!params.serviceName,
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}
