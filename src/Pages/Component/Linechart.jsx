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

const Linechart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Calculate initial width and handle resize
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

  useEffect(() => {
    const fetchCycleProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found. Please login.");
        }

        const response = await fetch(
          `${Baseurl}/driver/cycle-progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cycle progress.");
        }

        const result = await response.json();
        console.log("API Response:", result); // Debug log

        // Filter data to include only dates up to today (Oct 27, 2025)
        const today = new Date();
        const chartData = result.progress
          .filter((item) => new Date(item.date) <= today)
          .map((item) => {
            // Initialize earnings for specific services
            let remsEarnings = 0;
            let rpmEarnings = 0;
            let pr1Earnings = 0;

            // Sum earnings from servicesUsed in calls
            item.calls.forEach((call) => {
              call.servicesUsed.forEach((service) => {
                if (service.name === "REMS:KMS ENROUTE") {
                  remsEarnings += service.total;
                } else if (service.name === "RPM:KMS UNDER TOW") {
                  rpmEarnings += service.total;
                } else if (service.name === "PR1:WAITING TIME") {
                  pr1Earnings += service.total;
                }
              });
            });

            return {
              date: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              totalCalls: item.totalCalls,
              rems: remsEarnings,
              rpm: rpmEarnings,
              pr1: pr1Earnings,
            };
          });

        console.log("Chart Data:", chartData); // Debug log
        setData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleProgress();
  }, []);

  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-3 rounded shadow">
          <p className="text-gray-700 text-[14px] font-semibold">{label}</p>
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

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-white p-4 rounded-xl shadow relative"
        style={{ width: size.width, height: size.height }}
      >
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-white p-4 rounded-xl shadow relative"
        style={{ width: size.width, height: size.height }}
      >
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white p-4 rounded-xl shadow outline-none focus:outline-none relative"
      style={{ width: size.width, height: size.height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: 14,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              textAlign: "center",
              marginTop: "15px",
            }}
          />

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

          {/* REMS:KMS ENROUTE Earnings */}
          <Line
            type="monotone"
            dataKey="rems"
            name="REMS Earnings"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#16A34A", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* RPM:KMS UNDER TOW Earnings */}
          <Line
            type="monotone"
            dataKey="rpm"
            name="RPM Earnings"
            stroke="#9333EA"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#9333EA", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6 }}
          />

          {/* PR1:WAITING TIME Earnings */}
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