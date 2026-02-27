import { useState } from "react"
import { usePayments } from "../features/payments/usePayments"

export default function DashboardPage() {
  const [status, setStatus] = useState<string>()
  const { data = [] } = usePayments(status)

  const total = data.length
  const completed = data.filter((p: { status: string }) => p.status === "completed").length
  const failed = data.filter((p: { status: string }) => p.status === "failed").length
  const processing = data.filter((p: { status: string }) => p.status === "processing").length

  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <span>Total: {total}</span>
        <span>Completed: {completed}</span>
        <span>Processing: {processing}</span>
        <span>Failed: {failed}</span>
      </div>

      <select onChange={e => setStatus(e.target.value || undefined)}>
        <option value="">All</option>
        <option value="completed">Completed</option>
        <option value="processing">Processing</option>
        <option value="failed">Failed</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p: any) => (
            <tr key={p.payment_id}>
              <td>{p.payment_id}</td>
              <td>{p.merchant_name}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}