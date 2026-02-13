import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: '28', electronics: 5, apparel: 3, homeGoods: 4 },
  { month: '20', electronics: 8, apparel: 5, homeGoods: 3 },
  { month: '20', electronics: 12, apparel: 7, homeGoods: 5 },
  { month: 'Month', electronics: 15, apparel: 9, homeGoods: 6 },
];

export function TrendChart() {
  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Legend />
          <Line type="monotone" dataKey="electronics" stroke="#3B82F6" strokeWidth={2} />
          <Line type="monotone" dataKey="apparel" stroke="#10B981" strokeWidth={2} />
          <Line type="monotone" dataKey="homeGoods" stroke="#F59E0B" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}