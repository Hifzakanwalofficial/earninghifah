import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Baseurl } from "../../Config";

const Graph = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cycleStart, setCycleStart] = useState(null);
  const [cycleEnd, setCycleEnd] = useState(null);

  // Helper function to check if a date is valid
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  useEffect(() => {
    const fetchCycleProgress = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found. Please log in.");

        const response = await fetch(
          `${Baseurl}/driver/cycle-progress`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cycle progress data");
        }

        const data = await response.json();

        // Filter up to today (in UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize to start of day in UTC

        const transformedData = data.progress
          .filter((day) => {
            const dayDate = new Date(day.date);
            return isValidDate(dayDate) && dayDate <= today;
          })
          .map((day) => ({
            name: new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC", // Ensure UTC for display
            }),
            earnings: parseFloat(Number(day.totalEarnings).toFixed(2)),
            date: day.date,
          }));

        setChartData(transformedData);
        setCycleStart(data.cycleStart);
        setCycleEnd(data.cycleEnd);
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message || "An error occurred while fetching cycle progress data");
        setLoading(false);
      }
    };

    fetchCycleProgress();
  }, []);

  // Format date for display in UTC
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (!isValidDate(date)) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">Cycle Earnings</h2>
      <p className="text-sm text-gray-500 mb-4">
        Daily earnings from {formatDate(cycleStart)} to {formatDate(cycleEnd)}
      </p>

      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "earnings") {
                  return [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Earnings"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="earnings" fill="#3498db" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;