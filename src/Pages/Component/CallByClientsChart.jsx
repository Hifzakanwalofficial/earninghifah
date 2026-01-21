// src/Component/CallByClientsChart.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Baseurl } from '../../Config';

// Register Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const CallByClientsChart = ({ fromDate, toDate }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // === DARK MODE DETECTION ===
  useEffect(() => {
    const updateDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // === RESIZE HANDLER ===
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

  // === FETCH DATA WITH FILTER ===
  useEffect(() => {
    if (!fromDate || !toDate) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setChartData(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token. Please login.');

        // === ADD startDate & endDate ===
        const url = new URL(`${Baseurl}/driver/call-summary`);
        url.searchParams.append('startDate', fromDate);
        url.searchParams.append('endDate', toDate);

        const response = await axios.get(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const apiData = response.data;

        if (!apiData.data || apiData.data.length === 0 || apiData.totalCalls === 0) {
          setChartData(null);
          setError('No calls found for this period');
        } else {
          const labels = apiData.data.map(item => item.clientName || 'Unknown');
          const callCounts = apiData.data.map(item => item.totalCalls || 0);

          setChartData({
            labels,
            datasets: [
              {
                label: 'Call Distribution',
                data: callCounts,
                backgroundColor: [
                  '#F97316', // Orange
                  '#3B82F6', // Blue
                  '#10B981', // Green
                  '#8B5CF6', // Purple
                  '#F43F5E', // Red
                  '#FACC15', // Yellow
                  '#06B6D4', // Cyan
                  '#EC4899', // Pink
                ],
                borderColor: '#fff',
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
        setError(errorMessage);
        setChartData(null);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          toast.error('Session expired. Redirecting to login...', { position: 'top-right' });
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else {
          toast.error(errorMessage, { position: 'top-right' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  // === CHART OPTIONS ===
 const options = useMemo(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        color: isDark ? '#FFFFFF' : '#6b7280', // <-- Set to white in dark mode
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: { size: 12 },
        generateLabels: (chart) => {
          const { data } = chart;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => ({
              text: `${label} - ${data.datasets[0].data[i]}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: '#fff',
              lineWidth: 2,
              pointStyle: 'circle',
              hidden: !chart.getDataVisibility(i),
              index: i,
              fontColor: isDark ? '#FFFFFF' : '#6b7280', // <-- Add fontColor for each label
            }));
          }
          return [];
        },
      },
    },
    tooltip: {
      backgroundColor: isDark ? '#101935' : '#fff',
      titleColor: isDark ? '#FFFFFF' : '#333',
      bodyColor: isDark ? '#FFFFFF' : '#666',
      borderColor: isDark ? '#2883F9' : '#ddd',
      borderWidth: 1,
      cornerRadius: 4,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: ${value} calls (${percentage}%)`;
        },
      },
    },
  },
}), [isDark]);


  return (
    <>
      <div
        ref={containerRef}
        className={`bg-white dark:bg-[#101935] rounded-xl shadow-lg flex flex-col items-center justify-center relative p-4`}
        style={{ width, height: isMobile ? 400 : 600 }}
      >
        <h2 className="text-lg font-semibold mb-4 absolute top-4 left-4 z-10 text-gray-800 dark:text-[#95A0C6]">
          Call By Clients
        </h2>

        <div className="relative w-full h-full flex items-center justify-center mt-10">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <p className="text-center mt-4 text-gray-500 dark:text-[#95A0C6]">Loading chart...</p>
            </div>
          ) : error || !chartData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-48 h-25 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center shadow">
                <p className={`font-medium ${isDark ? 'text-[#95A0C6]' : 'text-gray-600'}`}>
                  {error || 'No Client Data Available'}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {fromDate && toDate ? `${fromDate} to ${toDate}` : 'Select a date range'}
                </p>
              </div>
            </div>
          ) : (
            <Pie data={chartData} options={options} />
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default CallByClientsChart;