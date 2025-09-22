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
        const chartData = result.progress.map((item) => {
          // Initialize earnings for specific services
          let remsEarnings = 0;
          let rpmEarnings = 0;
          let pr1Earnings = 0;

          // Sum earnings from servicesUsed in calls
          item.calls.forEach((call) => {
            call.servicesUsed.forEach((service) => {
              if (service.name === "REMS:KMS ENROUTE") {
                remsEarnings += service.total;
              } else if (service.name === "RPM:KMS UNDER TOW") {
                rpmEarnings += service.total;
              } else if (service.name === "PR1:WAITING TIME") {
                pr1Earnings += service.total;
              }
            });
          });

          return {
            date: new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            totalCalls: item.totalCalls,
            rems: remsEarnings,
            rpm: rpmEarnings,
            pr1: pr1Earnings,
          };
        });

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
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Total Calls */}
          <Line
            type="monotone"
            dataKey="totalCalls"
            name="Total Calls"
            stroke="#2563EB" // blue
            strokeWidth={2}
            dot={{ r: 4, stroke: "#2563EB", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* REMS:KMS ENROUTE Earnings */}
          <Line
            type="monotone"
            dataKey="rems"
            name="REMS Earnings"
            stroke="#16A34A" // green
            strokeWidth={2}
            dot={{ r: 4, stroke: "#16A34A", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* RPM:KMS UNDER TOW Earnings */}
          <Line
            type="monotone"
            dataKey="rpm"
            name="RPM Earnings"
            stroke="#9333EA" // purple
            strokeWidth={2}
            dot={{ r: 4, stroke: "#9333EA", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* PR1:WAITING TIME Earnings */}
          <Line
            type="monotone"
            dataKey="pr1"
            name="PR1 Earnings"
            stroke="#DC2626" // red
            strokeWidth={2}
            dot={{ r: 4, stroke: "#DC2626", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Linechart;