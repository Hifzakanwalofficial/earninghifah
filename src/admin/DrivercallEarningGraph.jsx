// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const DriverPerformanceAnalytics = () => {
//   // Your actual JSON data
//   const driverData = [
//     {
//       driverId: "68d16de8c6c9a8ed54e25161",
//       name: "Rock",
//       totalCalls: 130,
//       totalEarnings: 20
//     },
//     {
//       driverId: "68d3dd4a41561a02a9978ed9",
//       name: "6080",
//       totalCalls: 48,
//       totalEarnings: 122.25
//     },
//     {
//       driverId: "68d4ee5f41561a02a997fd04",
//       name: "Haris",
//       totalCalls: 6,
//       totalEarnings: 190
//     },
//      {
//       driverId: "68d16de8c6c9a8ed54e25161",
//       name: "Rock",
//       totalCalls: 130,
//       totalEarnings: 140
//     },
//     {
//       driverId: "68d3dd4a41561a02a9978ed9",
//       name: "6080",
//       totalCalls: 4,
//       totalEarnings: 12.25
//     },
//     {
//       driverId: "68d4ee5f41561a02a997fd04",
//       name: "Haris",
//       totalCalls: 6,
//       totalEarnings: 178.82
//     }
//   ];

//   // Format data for the chart
//   const chartData = driverData.map((driver, index) => ({
//    name: driver.name,
//     driverName: driver.name,
//     totalCalls: driver.totalCalls,
//     totalEarnings: driver.totalEarnings
//   }));

//   // Custom label renderer for calls (yellow bars) - on top
//   const renderCallsLabel = (props) => {
//     const { x, y, width, value } = props;
//     return (
//       <text 
//         x={x + width / 2} 
//         y={y - 8} 
//         fill="#4B5563" 
//         textAnchor="middle" 
//         fontSize="13"
//         fontWeight="600"
//       >
//         {value}
//       </text>
//     );
//   };

//   // Custom label renderer for earnings (blue bars) - inside bar at middle
//   const renderEarningsLabel = (props) => {
//     const { x, y, width, height, value } = props;
//     return (
//       <text 
//         x={x + width / 2} 
//         y={y + height / 2} 
//         fill="#FFFFFF" 
//         textAnchor="middle" 
//         dominantBaseline="middle"
//         fontSize="13"
//         fontWeight="600"
//       >
//         {/* {value} */}
//       </text>
//     );
//   };

//   // Custom tooltip
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3  rounded-lg shadow-lg border border-gray-200">
//           <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.driverName}</p>
//           <p className="text-sm text-amber-600 mb-1">
//             <span className="font-medium">Total Calls:</span> {payload[0].value}
//           </p>
//           <p className="text-sm text-sky-600">
//             <span className="font-medium">Total Earnings:</span> ${payload[1].value}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="w-full bg-white p-4 md:p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-6">
//         <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
//           Driver Performance Analytics
//         </h2>
//         <p className="text-base font-semibold text-gray-700 mb-1">Earnings vs. Calls</p>
//         <p className="text-sm text-gray-500">Last 30 Days</p>
//       </div>

//       {/* Chart */}
//       <div className="w-full" style={{ height: '450px' }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             data={chartData}
//             margin={{ top: 40, right: 30, left: 20, bottom: 30 }}
//             barGap={0}
//             barCategoryGap="20%"
//           >
//             <CartesianGrid 
//               strokeDasharray="3 3" 
//               stroke="#00001A26" 
//               vertical={true}
//             />
//             <XAxis 
//               dataKey="name" 
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
//               dy={10}
//             />
//             <YAxis 
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: '#6B7280', fontSize: 13,color:"#000000B2", }}
//               tickFormatter={(value) => `$${value}`}
//               domain={[0, 'auto']}
//               dx={-5}
//             />
//             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
//             <Legend 
//               verticalAlign="bottom" 
//               height={36}
//               iconType="square"
//               iconSize={14}
//               wrapperStyle={{
//                 paddingTop: '25px',
//                 fontSize: '14px',
//                 fontWeight: 500,
//               }}
//             />
//             <Bar 
//               dataKey="totalCalls" 
//               fill="#F5AF1B" 
//               name="Total Calls"
//               radius={[0, 0, 0, 0]}
//               maxBarSize={45}
//               label={renderCallsLabel}
//             />
//             <Bar 
//               dataKey="totalEarnings" 
//               fill="#7DA7D9" 
//               name="Total Earnings"
//               radius={[0, 0, 0, 0]}
//               maxBarSize={45}
//               label={renderEarningsLabel}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default DriverPerformanceAnalytics;









import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Baseurl } from '../Config';

const DriverPerformanceAnalytics = () => {
  const [driverData, setDriverData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage; adjust as needed
        const response = await fetch(`${Baseurl}/admin/drivers-graph`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const res = await response.json();
        setDriverData(res.data || []);
      } catch (error) {
        console.error('Error fetching driver data:', error);
        setDriverData([]); // Fallback to empty array on error
      }
    };
    fetchData();
  }, []);

  // Sort by totalEarnings descending (all data)
  const sortedData = [...driverData].sort((a, b) => b.totalEarnings - a.totalEarnings);

  // Format data for the chart
  const chartData = sortedData.map((driver) => ({
    name: driver.name,
    driverName: driver.name,
    totalCalls: driver.totalCalls,
    totalEarnings: driver.totalEarnings
  }));

  // Calculate minimum width for horizontal scrolling to maintain bar width
  const categoryWidth = 115; // 45 * 2 (bars) + 25 (category gap)
  const chartMinWidth = Math.max(800, chartData.length * categoryWidth + 100);

  // Custom label renderer for calls (yellow bars) - on top
  const renderCallsLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="#4B5563" 
        textAnchor="middle" 
        fontSize="13"
        fontWeight="600"
      >
        {value}
      </text>
    );
  };

  // Custom label renderer for earnings (blue bars) - inside bar at middle
  const renderEarningsLabel = (props) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y + height / 2} 
        fill="#FFFFFF" 
        textAnchor="middle" 
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="600"
      >
        {/* {value} */}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3  rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.driverName}</p>
          <p className="text-sm text-amber-600 mb-1">
            <span className="font-medium">Total Calls:</span> {payload[0].value}
          </p>
          <p className="text-sm text-sky-600">
            <span className="font-medium">Total Earnings:</span> ${payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white p-4 ">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Driver Performance Analytics
        </h2>
        <p className="text-base font-semibold text-gray-700 mb-1">Earnings vs. Calls</p>
        <p className="text-sm text-gray-500">Last 30 Days</p>
      </div>

      {/* Chart */}
      <div 
        className="w-full scrollbar-hide" 
        style={{ 
          height: '450px',
          overflowX: 'auto',
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div style={{ minWidth: `${chartMinWidth}px`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 30 }}
              barGap={0}
              barCategoryGap={25}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#00001A26" 
                vertical={true}
              />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13,color:"#000000B2", }}
                tickFormatter={(value) => `$${value}`}
                domain={[0, 'auto']}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="square"
                iconSize={14}
                wrapperStyle={{
                  paddingTop: '25px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              />
              <Bar 
                dataKey="totalCalls" 
                fill="#F5AF1B" 
                name="Total Calls"
                radius={[0, 0, 0, 0]}
                barSize={45}
                label={renderCallsLabel}
              />
              <Bar 
                dataKey="totalEarnings" 
                fill="#7DA7D9" 
                name="Total Earnings"
                radius={[0, 0, 0, 0]}
                barSize={45}
                label={renderEarningsLabel}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DriverPerformanceAnalytics;