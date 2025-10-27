import React, { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Baseurl } from '../../Config';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const CallByClientsChart = () => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await axios.get(`${Baseurl}/driver/call-summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const apiData = response.data;

        if (apiData.totalCalls === 0 || !apiData.data || apiData.data.length === 0) {
          setError('No calls found for this driver');
          setChartData(null);
        } else {
          const labels = apiData.data.map(item => item.clientName);
          const callCounts = apiData.data.map(item => item.totalCalls);

          setChartData({
            labels,
            datasets: [
              {
                label: 'Call Distribution',
                data: callCounts,
                backgroundColor: [
                  '#F97316',
                  '#3B82F6',
                  '#10B981',
                  '#8B5CF6',
                  '#F43F5E',
                  '#FACC15',
                ],
                borderWidth: 1,
              },
            ],
          });
          setError(null);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data from the API';
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          toast.error('Session expired. Please log in again.', { position: 'top-right' });
          window.location.href = '/login';
        } else {
          setError(errorMessage);
          toast.error(errorMessage, { position: 'top-right' });
        }
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set chart width and handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement.offsetWidth || 1000;
        setWidth(parentWidth * (mobile ? 1 : 0.49));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20, // Increased padding to bring legend closer to chart
          generateLabels: (chart) => {
            const { data } = chart;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label} - ${data.datasets[0].data[i]} `,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor?.[i] || '#fff',
                lineWidth: data.datasets[0].borderWidth,
                pointStyle: 'circle',
                hidden: !chart.getDataVisibility(i),
                index: i,
              }));
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = context.dataset.data.reduce((a, b) => a + b, 0) > 0
              ? ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(2)
              : 0;
            return `${label}: ${value} calls (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <>            <div
      ref={containerRef}
      className={`bg-white rounded-md shadow flex flex-col items-center justify-center relative  ${isMobile ? 'p-4' : ''}`}
      style={{ width, height:isMobile? 400 : 600 }}
    >
  <h2 className="text-lg font-semibold mb-4 absolute top-4 left-4 z-10">
    Call By Clients
  </h2>

      <div className="relative flex items-center justify-center w-full h-full" style={{ height: '0px' }}>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-black flex items-center justify-center">
                <p className="text-white text-center px-4">No Client Data Available</p>
              </div>
            </div>
          </div>
        ) : chartData ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-black flex items-center justify-center">
                <p className="text-white text-center px-4">No Client Data Available</p>
              </div>
            </div>
          </div>

          
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>

    </>
  
  );
};

export default CallByClientsChart;