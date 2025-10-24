import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { Baseurl } from '../Config';

const Shimmer = () => {
  return (
    <div className="w-full h-[500px] bg-gray-100 animate-pulse">
      <div className="h-full flex flex-col justify-center">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div
            key={index}
            className="h-8 bg-gray-200 rounded mx-4 mb-4"
            style={{ width: `${Math.random() * 50 + 50}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const CallGraph = () => {
  const [clientData, setClientData] = useState([]);
  const [chartWidth, setChartWidth] = useState('100%');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${Baseurl}/admin/clients-graph`, {
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
        const sortedData = [...rawData].sort((a, b) => b.totalCalls - a.totalCalls);
        const formattedData = sortedData.map(client => ({
          name: "Client call",
          clientName: client.name,
          calls: client.totalCalls,
          earnings: client.totalEarnings
        }));
        setClientData(formattedData);
      } catch (error) {
        console.error('Error fetching client data:', error);
        setClientData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (clientData.length > 0) {
      if (isMobile) {
        const barSpacing = 60;
        setChartWidth(clientData.length * barSpacing);
      } else {
        setChartWidth('100%');
      }
    }
  }, [clientData, isMobile]);

  // Custom earnings label for line
  const renderEarningsLabel = (props) => {
    const { x, y, payload } = props;
    const earnings = payload?.earnings || 0;
    if (earnings === 0) return null;
    const formatted = earnings < 1000 ? `$${Math.round(earnings)}` : `$${(earnings / 1000).toFixed(1)}k`;
    return (
      <text 
        x={x} 
        y={y - 10} 
        textAnchor="middle" 
        fill="#0078BD" 
        fontSize="11"
        fontWeight="500"
      >
        {formatted}
      </text>
    );
  };

  // Custom dot component
  const renderDot = (props) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#FFFFFF" stroke="#0078BD" strokeWidth={2} />
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

  const barSize = isMobile ? 50 : 50;

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
      <div className="w-full h-[500px] overflow-x-auto">
        {isLoading ? (
          <Shimmer />
        ) : (
          <ResponsiveContainer width={chartWidth} height="100%">
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
                domain={[0, 'dataMax']}
                width={40}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={false} />
              
              <Legend
                verticalAlign="bottom"
                height={40}
                content={() => (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '30px',
                      paddingTop: '10px',
                    }}
                  >
                    {/* Total Calls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#69BA6C',
                          borderRadius: '0px',
                        }}
                      />
                      <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                        Total Calls
                      </span>
                    </div>

                    {/* Total Earnings */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#0078BD',
                          borderRadius: '0%',
                        }}
                      />
                      <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                        Total Earnings
                      </span>
                    </div>
                  </div>
                )}
              />

              {/* Bars for calls */}
              <Bar
                yAxisId="left"
                dataKey="calls"
                fill="#69BA6C"
                radius={[0, 0, 0, 0]}
                barSize={barSize}
                shape={(props) => {
                  const { x, y, width, height, fill } = props;
                  const minHeight = 4;
                  const adjustedHeight = height > 0 ? height : minHeight;
                  const adjustedY = height > 0 ? y : y - minHeight;
                  return (
                    <rect
                      x={x}
                      y={adjustedY}
                      width={width}
                      height={adjustedHeight}
                      fill={fill}
                      rx={4}
                      ry={4}
                    />
                  );
                }}
              >
                <LabelList
                  dataKey="earnings"
                  position="top"
                  formatter={(value) => value < 1000 ? `$${Math.round(value)}` : `$${(value / 1000).toFixed(1)}k`}
                  style={{
                    fill: "#000000B2",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
              </Bar>

              {/* Line for earnings */}
              <Line 
                yAxisId="left"
                type="natural"
                dataKey="calls" 
                stroke="#0078BD"
                strokeWidth={1.5}
                dot={renderDot}
                label={renderEarningsLabel}
                activeDot={{ r: 5, fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 3 }}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CallGraph;