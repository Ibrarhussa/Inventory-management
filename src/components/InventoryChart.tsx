import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { InventoryStat } from '../types';

interface InventoryChartProps {
  data: InventoryStat[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export function InventoryChart({ data }: InventoryChartProps) {
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.totalQuantity,
  }));

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
