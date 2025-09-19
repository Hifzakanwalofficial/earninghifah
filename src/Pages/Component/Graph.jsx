import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Mon", earnings: 200 },
  { name: "Tue", earnings: 350 },
  { name: "Wed", earnings: 150 },
  { name: "Thu", earnings: 500 },
  { name: "Fri", earnings: 950 },
  { name: "Sat", earnings: 120 },
  { name: "Sun", earnings: 1000 }
];

const Graph = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">Daily Breakdown</h2>
      <p className="text-sm text-gray-500 mb-4">
        Earnings by day of the week.
      </p>

      <div className="w-full h-[300px] [&>svg]:focus:outline-none">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earnings" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;
