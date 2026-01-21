// src/Component/Linechart.jsx
import React, { useEffect, useState, useRef } from "react";
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
import { Baseurl } from "../../Config";

const Linechart = ({ fromDate, toDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef(null);

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
        const newWidth = mobile ? parentWidth : parentWidth * 0.49;
        setSize({ width: newWidth, height: mobile ? 400 : 600 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // === FETCH DATA WITH FILTER ===
  useEffect(() => {
    if (!fromDate || !toDate) {
      setLoading(false);
      return;
    }

    const fetchCycleProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found. Please login.");

        // === ADD startDate & endDate ===
        const url = new URL(`${Baseurl}/driver/cycle-progress`);
        url.searchParams.append('startDate', fromDate);
        url.searchParams.append('endDate', toDate);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cycle progress.");
        }

        const result = await response.json();
        console.log("LineChart API Response:", result);

        // === FILTER & MAP DATA ===
        const chartData = (result.progress || [])
          .filter((item) => {
            const itemDate = new Date(item.date);
            const start = new Date(fromDate);
            const end = new Date(toDate);
            return itemDate >= start && itemDate <= end;
          })
          .map((item) => {
            let remsEarnings = 0;
            let rpmEarnings = 0;
            let pr1Earnings = 0;

            // === Percentage Applied from API ===
            const percentage = result.percentage || 100;  // percentage to be applied to all earnings

            // Calculate earnings based on services used
            (item.calls || []).forEach((call) => {
              (call.servicesUsed || []).forEach((service) => {
                if (service.name === "REMS:KMS ENROUTE") {
                  remsEarnings += (service.total || 0) * (percentage / 100);  // Apply percentage
                } else if (service.name === "RPM:KMS UNDER TOW") {
                  rpmEarnings += (service.total || 0) * (percentage / 100);  // Apply percentage
                } else if (service.name === "PR1:WAITING TIME") {
                  pr1Earnings += (service.total || 0) * (percentage / 100);  // Apply percentage
                }
              });
            });

            return {
              date: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              totalCalls: item.totalCalls || 0,
              rems: remsEarnings,
              rpm: rpmEarnings,
              pr1: pr1Earnings,
            };
          });

        console.log("LineChart Data with Percentage Applied:", chartData);
        setData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleProgress();
  }, [fromDate, toDate]);

  // === CUSTOM TOOLTIP ===
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#101935] border border-gray-300 p-3 rounded shadow">
          <p className={`text-[14px] font-semibold ${isDark ? 'text-[#95A0C6]' : 'text-gray-700'}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.stroke }}>
              {entry.name}:{" "}
              {entry.name === "Total Calls"
                ? entry.value
                : `$${Number(entry.value).toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // === CUSTOM LEGEND ===
  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px",
        textAlign: "center",
        marginTop: "15px",
        listStyle: "none",
        padding: 0,
        margin: 0,
        fontSize: 14,
        color: isDark ? "#95A0C6" : "#374151",
      }}>
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: 14,
                height: 2,
                backgroundColor: entry.color,
              }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-white dark:bg-[#101935] p-4 rounded-xl shadow"
        style={{ width: size.width, height: size.height }}
      >
        <p className={`${isDark ? 'text-[#95A0C6]' : 'text-gray-600'}`}>Loading chart...</p>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-white dark:bg-[#101935] p-4 rounded-xl shadow"
        style={{ width: size.width, height: size.height }}
      >
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // === NO DATA ===
  if (data.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-white dark:bg-[#101935] p-4 rounded-xl shadow"
        style={{ width: size.width, height: size.height }}
      >
        <p className={`${isDark ? 'text-[#95A0C6]' : 'text-gray-500'}`}>No data available for selected range.</p>
      </div>
    );
  }

  // === MAIN CHART ===
  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#101935] p-4 rounded-xl shadow outline-none focus:outline-none"
      style={{ width: size.width, height: size.height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2883F9' : '#e5e5e5'} />
          <XAxis dataKey="date" tick={{ fill: isDark ? '#95A0C6' : '#334155' }} />
          <YAxis tick={{ fill: isDark ? '#95A0C6' : '#334155' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={CustomLegend} />

          {/* Total Calls */}
          <Line
            type="monotone"
            dataKey="totalCalls"
            name="Total Calls"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#2563EB", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* REMS Earnings */}
          <Line
            type="monotone"
            dataKey="rems"
            name="REMS Earnings"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#16A34A", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* RPM Earnings */}
          <Line
            type="monotone"
            dataKey="rpm"
            name="RPM Earnings"
            stroke="#9333EA"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#9333EA", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* PR1 Earnings */}
          <Line
            type="monotone"
            dataKey="pr1"
            name="PR1 Earnings"
            stroke="#DC2626"
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
