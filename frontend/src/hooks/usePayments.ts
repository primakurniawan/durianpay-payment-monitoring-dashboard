import { useQuery } from "@tanstack/react-query"
import api from "../lib/axios"

export const usePayments = (status?: string) => {
  return useQuery({
    queryKey: ["payments", status],
    queryFn: async () => {
      const res = await api.get("/payments", {
        params: status ? { status } : {}
      })
      // API returns null when no results, normalize to empty array
      return Array.isArray(res.data) ? res.data : []
    }
  })
}
