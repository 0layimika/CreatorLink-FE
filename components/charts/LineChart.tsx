'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { theme } from '@/lib/constants';

interface LineChartProps {
  data: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
        <XAxis
          dataKey="date"
          stroke={theme.colors.textSecondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={theme.colors.textSecondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
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
        />
        <Legend
          wrapperStyle={{ color: theme.colors.textSecondary }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke={theme.colors.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: theme.colors.primary }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke={theme.colors.secondary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: theme.colors.secondary }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
