import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Apr 25", year2020: 50, year12: 40 },
  { date: "Apr 25", year2020: 30, year12: 20 },
  { date: "Apr 25", year2020: 20, year12: 5 },
  { date: "Apr 25", year2020: 18, year12: 2 },
  { date: "Apr 25", year2020: 19, year12: 1 },
  { date: "Apr 25", year2020: 19, year12: 0 },
];

const Linechart = () => {
  return (
    <div className="w-[1000px] h-[600px] bg-white p-4 rounded-xl shadow outline-none focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          className="w-[100%]"
        >
          {/* Gradient fill under curves */}
          <defs>
            <linearGradient id="color2020" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="color12" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Blue Line (2020) */}
          <Line
            type="monotone"
            dataKey="year2020"
            stroke="#4F46E5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#color2020)"
            dot={{ r: 4, stroke: "#4F46E5", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* Red Line (12) */}
          <Line
            type="monotone"
            dataKey="year12"
            stroke="#EF4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#color12)"
            dot={{ r: 4, stroke: "#EF4444", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Linechart;
