// // src/components/DriverPerformanceAnalytics.jsx
// import React, { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LabelList,
// } from "recharts";
// import { Baseurl } from "../Config";

// // Shimmer Component
// const Shimmer = () => (
//   <div className="w-full h-[450px] bg-gray-100 dark:bg-[#101935] animate-pulse">
//     <div className="h-full flex flex-col justify-center">
//       {[1, 2, 3, 4, 5].map((_, i) => (
//         <div
//           key={i}
//           className="h-8 bg-gray-200 dark:bg-gray-700 rounded mx-4 mb-4"
//           style={{ width: `${Math.random() * 50 + 50}%` }}
//         />
//       ))}
//     </div>
//   </div>
// );

// // Main Component
// const DriverPerformanceAnalytics = ({ fromDate, toDate }) => {
//   const [driverData, setDriverData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

//   useEffect(() => {
//     const observer = new MutationObserver(() => {
//       setIsDark(document.documentElement.classList.contains('dark'));
//     });
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
//     return () => observer.disconnect();
//   }, []);

//   // Fetch Data
//   const fetchData = async (start, end) => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const url = new URL(`${Baseurl}/admin/drivers-graph`);
//       url.searchParams.append("startDate", start);
//       url.searchParams.append("endDate", end);

//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) throw new Error("Failed to fetch data");
//       const res = await response.json();
//       setDriverData(res.data || []);
//     } catch (err) {
//       console.error("Error fetching driver analytics:", err);
//       setDriverData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Re-fetch when fromDate or toDate changes
//   useEffect(() => {
//     if (fromDate && toDate) {
//       fetchData(fromDate, toDate);
//     }
//   }, [fromDate, toDate]);

//   // Format Display Date
//   const formatDisplayDate = (dateStr) => {
//     if (!dateStr) return "N/A";
//     const [y, m, d] = dateStr.split("-");
//     const date = new Date(y, m - 1, d);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const getDateRangeText = () => {
//     if (!fromDate || !toDate) return "Loading...";
//     return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`;
//   };

//   // Chart Data Processing
//   const maxEarnings = Math.max(...driverData.map((d) => d.totalEarnings || 0), 1);
//   const maxCalls = Math.max(...driverData.map((d) => d.totalCalls || 0), 1);

//   const scaledData = driverData.map((d) => ({
//     name: d.name || "Unknown",
//     driverName: d.name || "Unknown",
//     totalCalls: d.totalCalls || 0,
//     totalEarnings: d.totalEarnings || 0,
//     scaledCalls: (d.totalCalls / maxCalls) * maxEarnings * 0.4,
//   }));

//   const sortedData = [...scaledData].sort((a, b) => b.totalEarnings - a.totalEarnings);
//   const chartMinWidth = Math.max(800, sortedData.length * 120 + 100);

//   // Custom Tooltip
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload?.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
//           <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{data.driverName}</p>
//           <p className="text-sm text-amber-600 mb-1">
//             <span className="font-medium">Total Calls:</span> {data.totalCalls}
//           </p>
//           <p className="text-sm text-[#0078BD]">
//             <span className="font-medium">Total Earnings:</span> ${data.totalEarnings.toFixed(2)}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="w-full bg-white dark:bg-[#101935] p-1 md:p-6 lg:p-3">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
//             Driver Performance Analytics
//           </h2>
//           <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Earnings vs. Calls</p>
//           <p className="text-sm text-gray-500 dark:text-gray-400">{getDateRangeText()}</p>
//         </div>

     
//       </div>

//       {/* Chart */}
//       <div className="w-full scrollbar-hide bg-white dark:bg-gray-900" style={{ height: "450px", overflowX: "auto" }}>
//         <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

//         {isLoading ? (
//           <Shimmer />
//         ) : sortedData.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
//             No data available for selected range.
//           </div>
//         ) : (
//           <div style={{ minWidth: `${chartMinWidth}px`, height: "100%" }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={sortedData}
//                 margin={{ top: 40, right: 30, left: 20, bottom: 30 }}
//                 barGap={4}
//                 barCategoryGap={30}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} vertical={true} />
//                 <XAxis
//                   dataKey="name"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 13, fontWeight: 500 }}
//                   dy={10}
//                 />
//                 <YAxis
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 13 }}
//                   tickFormatter={(v) => `$${v}`}
//                   domain={[0, "auto"]}
//                   dx={-5}
//                 />
//                 <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(55, 65, 81, 0.1)" : "rgba(0, 0, 0, 0.05)" }} />
//                 <Legend
//                   verticalAlign="bottom"
//                   height={36}
//                   iconType="square"
//                   iconSize={14}
//                   wrapperStyle={{ paddingTop: "25px", fontSize: "14px", fontWeight: 500, color: isDark ? "#9CA3AF" : "#6B7280" }}
//                 />

//                 <Bar
//                   dataKey="scaledCalls"
//                   fill="#F5AF1B"
//                   name="Total Calls"
//                   barSize={30}
//                   radius={[4, 4, 0, 0]}
//                 >
//                   <LabelList
//                     dataKey="totalCalls"
//                     position="top"
//                     fill={isDark ? "#F3F4F6" : "#374151"}
//                     fontSize={13}
//                     fontWeight={600}
//                     offset={10}
//                     stroke="white"
//                     strokeWidth={0.5}
//                   />
//                 </Bar>
//                 <Bar
//                   dataKey="totalEarnings"
//                   fill="#0078BD"
//                   name="Total Earnings"
//                   barSize={30}
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DriverPerformanceAnalytics;










import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Baseurl } from "../Config";


const DriverCallsPieChart = ({ fromDate, toDate }) => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fixed colors — 10 vibrant colors
  const COLORS = [
    "#F97316", // orange
    "#3B82F6", // blue
    "#10B981", // green
    "#8B5CF6", // purple
    "#F43F5E", // red
    "#FACC15", // yellow
    "#06B6D4", // cyan
    "#EC4899", // pink
    "#14B8A6", // teal
    "#6366F1", // indigo
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
        const url = new URL(`${Baseurl}/admin/drivers-graph`);
        url.searchParams.append("startDate", fromDate);
        
        // FIXED: Removed +1 day logic — now sends exact date
        const effectiveToDate = toDate || fromDate;
        if (effectiveToDate) {
          url.searchParams.append("endDate", effectiveToDate);
        }

        console.log("Fetching driver graph with URL:", url.toString()); // Debug log

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");
        const res = await response.json();
        console.log("Driver graph data received:", res); // Debug log
        const rawData = res.data || [];

        // Sort by calls descending → this order decides color
        const sortedByCalls = [...rawData].sort(
          (a, b) => (b.totalCalls || 0) - (a.totalCalls || 0)
        );

        // Assign fixed color to each driver based on calls rank
        const driversWithColor = sortedByCalls.map((driver, index) => ({
          name: driver.name || "Unknown Driver",
          totalCalls: driver.totalCalls || 0,
          totalEarnings: driver.totalEarnings || 0,
          color: COLORS[index % COLORS.length], // ← FIXED COLOR FOREVER
        }));

        setDrivers(driversWithColor);
      } catch (error) {
        console.error("Error:", error);
        setDrivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  const totalCalls = drivers.reduce((sum, d) => sum + d.totalCalls, 0);
  const totalEarnings = drivers.reduce((sum, d) => sum + d.totalEarnings, 0);

  // Data for Calls Pie
  const callsPieData = drivers.map(d => ({
    name: d.name,
    value: d.totalCalls,
    color: d.color,
  }));

  // Data for Earnings Pie — sort by earnings but keep SAME color
  const earningsPieData = [...drivers]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .map(d => ({
      name: d.name,
      value: d.totalEarnings,
      color: d.color, // ← SAME COLOR AS IN CALLS
    }));

  const CallsTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const percent = totalCalls > 0 ? ((data.value / totalCalls) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-600">
          <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Calls: <strong className="text-blue-600">{data.value.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  const EarningsTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const percent = totalEarnings > 0 ? ((data.value / totalEarnings) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-600">
          <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Earnings: <strong className="text-white dark:text-white">${data.value.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : "";

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
          Driver Activity Analytics
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
            {drivers.length === 0 ? (
              <p className="text-center text-gray-500 h-64 flex items-center justify-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={callsPieData}
                    dataKey="value"
                    cx="50%" cy="50%"
                    outerRadius="85%"
                    labelLine={false}
                    label={renderLabel}
                  >
                    {callsPieData.map((entry, i) => (
                      <Cell key={`call-${i}`} fill={entry.color} />
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
            {drivers.length === 0 ? (
              <p className="text-center text-gray-500 h-64 flex items-center justify-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={earningsPieData}
                    dataKey="value"
                    cx="50%" cy="50%"
                    outerRadius="85%"
                    labelLine={false}
                    label={renderLabel}
                  >
                    {earningsPieData.map((entry, i) => (
                      <Cell key={`earn-${i}`} fill={entry.color} />
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
          All Drivers ({drivers.length})
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[700px] bg-gray-50 dark:bg-gray-900">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Driver</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Calls</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Earnings</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">% Calls</th>
                {/* <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">% Earnings</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {drivers.map((driver, i) => (
                <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full shadow-lg border-2 border-white dark:border-gray-900"
                        style={{ backgroundColor: driver.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {driver.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    {driver.totalCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    ${driver.totalEarnings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                    {totalCalls > 0 ? ((driver.totalCalls / totalCalls) * 100).toFixed(1) : 0}%
                  </td>
                  {/* <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                    {totalEarnings > 0 ? ((driver.totalEarnings / totalEarnings) * 100).toFixed(1) : 0}%
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

export default DriverCallsPieChart;


