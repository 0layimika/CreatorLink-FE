'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { theme } from '@/lib/constants';

interface BarChartProps {
  data: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
}

const COLORS = [
  theme.colors.primary,
  theme.colors.secondary,
  '#a855f7',
  '#f97316',
];

export default function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} horizontal={false} />
        <XAxis
          type="number"
          stroke={theme.colors.textSecondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="source"
          stroke={theme.colors.textSecondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            color: theme.colors.textPrimary,
          }}
          itemStyle={{ color: theme.colors.textPrimary }}
          labelStyle={{ color: theme.colors.textSecondary }}
          formatter={(value) => [
            `${Number(value).toLocaleString()} visits`,
            '',
          ]}
        />
        <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
