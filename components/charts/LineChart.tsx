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
        <CartesianGrid strokeDasharray="4 6" stroke="#d6d4cd" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#777772"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#777772"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111111',
            border: '1px solid #111111',
            borderRadius: '14px',
            color: '#ffffff',
          }}
          itemStyle={{ color: '#ffffff' }}
          labelStyle={{ color: '#baff3c' }}
        />
        <Legend
          wrapperStyle={{ color: '#777772', fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#2457f5"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#2457f5' }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#8acb17"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#8acb17' }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
