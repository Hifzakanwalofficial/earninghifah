import React, { useEffect, useState } from "react";
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

const Linechart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycleProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found. Please login.");
        }

        const response = await fetch(
          "https://expensemanager-production-4513.up.railway.app/api/driver/cycle-progress",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cycle progress.");
        }

        const result = await response.json();

        // Map API progress data to chart data format
        // Using date (formatted) and totalEarnings
        const chartData = result.progress.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          totalEarnings: item.totalEarnings,
        }));

        setData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleProgress();
  }, []);

  if (loading) {
    return (
      <div className="w-[1000px] h-[600px] flex items-center justify-center bg-white p-4 rounded-xl shadow">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[1000px] h-[600px] flex items-center justify-center bg-white p-4 rounded-xl shadow">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-[1000px] h-[600px] bg-white p-4 rounded-xl shadow outline-none focus:outline-none">
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          className="w-[100%]"
        >
          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="color2020" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Blue Line for totalEarnings */}
          <Line
            type="monotone"
            dataKey="totalEarnings"
            stroke="#4F46E5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#color2020)"
            dot={{ r: 4, stroke: "#4F46E5", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Linechart;
