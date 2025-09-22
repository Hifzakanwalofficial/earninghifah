import React, { useEffect, useState } from "react";
import { FaPhone, FaDollarSign, FaSync, FaInfoCircle } from "react-icons/fa";
import { BiPhoneCall } from "react-icons/bi";
const StatsCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken"); // 👈 get token
        if (!token) {
          throw new Error("No token found, please login again.");
        }

        const res = await fetch(
          "https://expensemanager-production-4513.up.railway.app/api/admin/drivers/monthly-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`, // 👈 pass token
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (data?.totals) {
          setStats([
            { title: "Total Call", value: data.totals.totalCalls, icon: <BiPhoneCall /> },
            { title: "Total REMS", value: data.totals.totalRems, icon: <FaDollarSign /> },
            { title: "Total RPM", value: data.totals.totalRpm, icon: <FaSync /> },
            { title: "Total PR1", value: data.totals.totalPr1.toFixed(2), icon: <FaInfoCircle /> },
          ]);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {loading
        ? // shimmer skeleton loader
          Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white py-[24px] px-[11px] rounded-lg shadow-sm border border-gray-200 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                <div className="mt-4 w-[40px] h-[40px] rounded-full bg-gray-200"></div>
              </div>
            ))
        : stats?.map((stat, index) => (
            <div
              key={index}
              className="bg-white py-[24px] px-[11px] rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
            >
              <div>
                <h3 className="text-[16px] robotomedium text-[#333333B2]">
                  {stat.title}
                </h3>
                {/* 👇 yahan 0 bhi dikhayega, remove nahi karega */}
                <p className="text-[20px] font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-[40px] h-[40px] rounded-full"
                style={{ backgroundColor: "#778DA90A" }}
              >
                <span className="text-[#778DA9] text-lg">{stat.icon}</span>
              </div>
            </div>
          ))}
    </div>
  );
};

export default StatsCards;
