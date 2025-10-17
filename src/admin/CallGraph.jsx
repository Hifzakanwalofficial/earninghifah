import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CallGraph = () => {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://expensemanager-production-4513.up.railway.app/api/admin/drivers-graph', {
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
        const rawData = res.data || [];
        const sortedData = [...rawData].sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 9);
        const formattedData = sortedData.map(driver => ({
          name: "Client call",
          clientName: driver.name,
          calls: driver.totalCalls,
          earnings: driver.totalEarnings
        }));
        setClientData(formattedData);
      } catch (error) {
        console.error('Error fetching client data:', error);
        setClientData([]);
      }
    };
    fetchData();
  }, []);

  // Custom label for bars
  const renderLabel = (props) => {
    const { x, y, width, value, payload } = props;
    const displayValue = payload?.earnings || value || 8200;
    return (
      <text 
        x={x + width / 2} 
        y={y - 6} 
        fill="#1F2937" 
        textAnchor="middle" 
        fontSize="11"
        fontWeight="500"
      >
        $ {(displayValue / 1000).toFixed(1)}k
      </text>
    );
  };

  // Custom dot component
  const renderDot = (props) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#69BA6C" stroke="#FFFFFF" strokeWidth={2.5} />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">{data?.clientName || 'Client'}</p>
          <p className="text-xs text-gray-600">Calls: <span className="font-semibold">{data?.calls || 0}</span></p>
          <p className="text-xs text-gray-600">Earnings: <span className="font-semibold">${(data?.earnings || 0).toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', paddingTop: '10px' }}>
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: 12,
              height: 12,
              // 👇 change background color here
              backgroundColor: entry.value === 'earnings' ? '#0078BD' : '#69BA6C',
              borderRadius: entry.value === 'calls' ? '0%' : '0px',
            }}
          />
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
            {entry.value === 'earnings' ? 'Total Earnings' : 'Total Calls'}
          </span>
        </div>
      ))}
    </div>
  );
};


  return (
    <div className="w-full bg-white p-6 md:p-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Client Activity Analytics
        </h1>
        <p className="text-sm text-gray-600">Visualize calls and earnings per client.</p>
      </div>

      {/* Chart Container */}
  <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={clientData}
            margin={{ top: 35, right: 80, left: -5, bottom: 60 }}
          >
            <defs>
              <linearGradient id="greenBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#86EFAC" stopOpacity={0.95}/>
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#00001A26" 
              vertical={true}
            />
            
            <XAxis 
              dataKey="clientName" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              height={50}
            />
            
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              domain={[0, 75]}
              ticks={[0, 10, 25, 50, 75]}
              width={40}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={false}
              domain={[0, 15000]}
              ticks={[0, 5000, 10000, 15000]}
              width={60}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={false} />
            
            <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
            
            {/* Bars for earnings */}
            <Bar 
              yAxisId="right"
              dataKey="earnings" 
              fill="#69BA6C"
              radius={[0, 0, 0, 0]}
              barSize={50}
              label={renderLabel}
            />
            
            {/* Line for calls */}
            <Line 
              yAxisId="left"
              type="natural"
              dataKey="calls" 
              stroke="#0078BD"
              strokeWidth={1.5}
              dot={renderDot}
              activeDot={{ r: 5, fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 3 }}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallGraph;