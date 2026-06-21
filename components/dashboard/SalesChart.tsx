'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const mockData = [
  { month: 'Jan', revenue: 42000, deals: 8 },
  { month: 'Feb', revenue: 38500, deals: 7 },
  { month: 'Mar', revenue: 65000, deals: 12 },
  { month: 'Apr', revenue: 59000, deals: 11 },
  { month: 'May', revenue: 78000, deals: 15 },
  { month: 'Jun', revenue: 95000, deals: 18 },
]

export default function SalesChart() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-slate-500 mt-0.5">Monthly closed revenue</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={mockData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
