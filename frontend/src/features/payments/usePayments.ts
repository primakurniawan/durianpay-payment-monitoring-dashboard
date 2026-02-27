import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"

export const usePayments = (status?: string) => {
  return useQuery({
    queryKey: ["payments", status],
    queryFn: async () => {
      const res = await api.get("/payments", {
        params: status ? { status } : {}
      })
      return res.data
    }
  })
}