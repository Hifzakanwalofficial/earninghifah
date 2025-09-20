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

const Graph = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycleGraph = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await fetch(
          "https://expensemanager-production-4513.up.railway.app/api/driver/cycle-graph",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cycle graph data");
        }

        const data = await response.json();
        
        // Transform API data into recharts-compatible format
        const transformedData = data.graphData.map((day) => ({
          name: new Date(day.date).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric" 
          }), // e.g., "Sep 19"
          earnings: day.totalEarnings,
          calls: day.totalCalls,
        }));

        setChartData(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);
      }
    };

    fetchCycleGraph();
  }, []);

  // Chart Shimmer Component
  const ChartShimmer = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header Shimmer */}
      <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>

      {/* Chart Area Shimmer */}
      <div className="w-full h-[300px] bg-gray-50 rounded-lg p-4">
        {/* Y-axis labels shimmer */}
        <div className="flex">
          <div className="flex flex-col justify-between h-[260px] w-8 mr-4">
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Chart bars shimmer */}
          <div className="flex-1">
            <div className="flex items-end justify-between h-[260px] px-4">
              {/* Bar 1 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '120px'}}></div>
              </div>
              {/* Bar 2 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '80px'}}></div>
              </div>
              {/* Bar 3 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '150px'}}></div>
              </div>
              {/* Bar 4 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '90px'}}></div>
              </div>
              {/* Bar 5 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '110px'}}></div>
              </div>
              {/* Bar 6 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '75px'}}></div>
              </div>
              {/* Bar 7 */}
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gray-200 rounded-t animate-pulse mb-2" style={{height: '95px'}}></div>
              </div>
            </div>

            {/* X-axis labels shimmer */}
            <div className="flex justify-between px-4 mt-2">
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Legend shimmer */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <ChartShimmer />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">Cycle Earnings</h2>
      <p className="text-sm text-gray-500 mb-4">Daily earnings for the current cycle period.</p>

      <div className="w-full h-[300px] [&>svg]:focus:outline-none">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'earnings') {
                  return [`₨${value.toLocaleString()}`, 'Earnings'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="earnings" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;