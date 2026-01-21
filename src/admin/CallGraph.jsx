// src/components/ClientActivityGraph.jsx
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Baseurl } from "../Config";

const ClientActivityGraph = ({ fromDate, toDate }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = [
    "#F97316", "#3B82F6", "#10B981", "#8B5CF6",
    "#F43F5E", "#FACC15", "#06B6D4", "#EC4899",
    "#14B8A6", "#6366F1"
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Change: Allow single date selection by setting toDate to fromDate if it's empty
      if (!fromDate) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${Baseurl}/admin/clients-graph`);
        url.searchParams.append("startDate", fromDate);
        
        // FIXED: Now sends EXACT selected date (no +1 day added)
        const effectiveToDate = toDate || fromDate;
        if (effectiveToDate) {
          url.searchParams.append("endDate", effectiveToDate);
        }

        console.log("Fetching client graph with URL:", url.toString()); // Debug log

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");
        const res = await response.json();
        console.log("Client graph data received:", res); // Debug log
        const rawData = res.data || [];

        // Sort by calls descending → fixed color order
        const sortedByCalls = [...rawData].sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0));

        // Assign fixed color to each client
        const clientsWithColor = sortedByCalls.map((client, index) => ({
          name: client.name || "Unknown Client",
          totalCalls: client.totalCalls || 0,
          totalEarnings: client.totalEarnings || 0,
          color: COLORS[index % COLORS.length],
        }));

        setClients(clientsWithColor);
      } catch (error) {
        console.error("Error:", error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  const totalCalls = clients.reduce((sum, c) => sum + c.totalCalls, 0);
  const totalEarnings = clients.reduce((sum, c) => sum + c.totalEarnings, 0);

  const callsPieData = clients.map(c => ({
    name: c.name,
    value: c.totalCalls,
    color: c.color,
  }));

  const earningsPieData = [...clients]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .map(c => ({
      name: c.name,
      value: c.totalEarnings,
      color: c.color,
    }));

  const CallsTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const percent = totalCalls > 0 ? ((d.value / totalCalls) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white">{d.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Calls: <strong className="text-blue-600">{d.value.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{percent}% of total</p>
        </div>
      );
    }
    return null;
  };

  const EarningsTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const percent = totalEarnings > 0 ? ((d.value / totalEarnings) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white">{d.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Earnings: <strong className="text-black dark:text-white">${d.value.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{percent}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ percent }) => {
    return percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : "";
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-[#101935] rounded-xl shadow-2xl p-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#101935] rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Client Activity Analytics
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Calls & Earnings Distribution
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calls Pie */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-inner">
            <h3 className="text-center text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">
              By Total Calls
            </h3>
            {clients.length === 0 ? (
              <p className="text-center text-gray-500 h-64 flex items-center justify-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={callsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius="85%"
                    labelLine={false}
                    label={renderLabel}
                  >
                    {callsPieData.map((entry, index) => (
                      <Cell key={`call-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CallsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Earnings Pie */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-inner">
            <h3 className="text-center text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">
              By Total Earnings
            </h3>
            {clients.length === 0 ? (
              <p className="text-center text-gray-500 h-64 flex items-center justify-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={earningsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius="85%"
                    labelLine={false}
                    label={renderLabel}
                  >
                    {earningsPieData.map((entry, index) => (
                      <Cell key={`earn-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<EarningsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          All Clients ({clients.length})
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[700px] bg-gray-50 dark:bg-gray-900">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Client</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Calls</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Earnings</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">% Calls</th>
                {/* <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">% Earnings</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-7 h-7 rounded-full shadow-lg border-2 border-white dark:border-gray-900"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    {client.totalCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-white">
                    ${client.totalEarnings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                    {totalCalls > 0 ? ((client.totalCalls / totalCalls) * 100).toFixed(1) : 0}%
                  </td>
                  {/* <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                    {totalEarnings > 0 ? ((client.totalEarnings / totalEarnings) * 100).toFixed(1) : 0}%
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientActivityGraph;