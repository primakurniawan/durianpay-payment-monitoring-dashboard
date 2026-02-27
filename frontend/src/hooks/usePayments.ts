import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import type { SortDir, SortField } from '../components/PaymentTable';

interface PaymentsParams {
  status?: string;
  search?: string;
  sortField: SortField;
  sortDir: SortDir;
  page: number;
  limit: number;
}

export interface Payment {
  payment_id: string;
  merchant_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Summary {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

export interface PaymentsResult {
  data: Payment[];
  total: number;
  summary: Summary;
}

export const usePayments = (params: PaymentsParams) => {
  const { status, search, sortField, sortDir, page, limit } = params;
  const offset = (page - 1) * limit;

  return useQuery<PaymentsResult>({
    queryKey: ['payments', status, search, sortField, sortDir, page, limit],
    queryFn: async () => {
      const res = await api.get('/payments', {
        params: {
          ...(status ? { status } : {}),
          ...(search ? { search } : {}),
          sort: `${sortField}:${sortDir}`,
          limit,
          offset,
        },
      });
      return {
        data: Array.isArray(res.data?.data) ? res.data.data : [],
        total: res.data?.total ?? 0,
        summary: res.data?.summary ?? {
          total: 0,
          completed: 0,
          processing: 0,
          failed: 0,
        },
      };
    },
    placeholderData: (prev) => prev,
  });
};
