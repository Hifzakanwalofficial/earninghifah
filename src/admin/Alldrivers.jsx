import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Alldrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});
  const [callsCount, setCallsCount] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(
      "https://expensemanager-production-4513.up.railway.app/api/admin/drivers?page=1&limit=10",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        const fetchedDrivers = data.drivers || [];
        setDrivers(fetchedDrivers);

        const callsData = {};
        await Promise.all(
          fetchedDrivers.map(async (driver) => {
            try {
              const res = await fetch(
                `https://expensemanager-production-4513.up.railway.app/api/admin/calls-for-driver-by/${driver._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const result = await res.json();
              callsData[driver._id] = result.calls ? result.calls.length : 0;
            } catch {
              callsData[driver._id] = 0;
            }
          })
        );

        setCallsCount(callsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDriverClick = (driverId) => {
    navigate(`/admin/callhistory/${driverId}`);
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      {/* Table Header */}
      <div className="bg-[#FAFAFC] px-[14px] py-[11px] grid grid-cols-5 font-semibold border-b border-[#FAFAFC]">
        <p className="w-full text-left">Driver Name</p>
        <p className="w-full text-left">Email</p>
        <p className="w-full text-left">Password</p>
        <p className="w-full text-left">Calls</p>
        <p className="w-full text-left">Total Earnings</p>
      </div>

      {/* Loading shimmer */}
      {loading ? (
        [...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white pt-5 px-[14px] pb-3 grid grid-cols-5 border-b border-[#FAFAFC]"
          >
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        ))
      ) : drivers.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-gray-500 text-[16px]">No drivers Available</p>
        </div>
      ) : (
        drivers.map((driver) => (
          <div
            key={driver._id}
            onClick={() => handleDriverClick(driver._id)}
            className="bg-[#ffffff] pt-5 px-[14px] pb-3 grid grid-cols-5 cursor-pointer hover:bg-gray-100 border-b border-[#FAFAFC]"
          >
            <p className="w-full text-left">{driver.name}</p>
            <p className="w-full text-left">{driver.email}</p>
            <div
              className="w-full flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="truncate">
                {showPassword[driver._id]
                  ? driver.password
                  : "•".repeat(driver.password.length)}
              </p>
              <button onClick={() => togglePassword(driver._id)}>
                {showPassword[driver._id] ? (
                  <FaEyeSlash className="text-gray-600" />
                ) : (
                  <FaEye className="text-gray-600" />
                )}
              </button>
            </div>
            <p className="w-full text-left">
              {callsCount[driver._id] !== undefined
                ? callsCount[driver._id]
                : "-"}
            </p>
            <p className="w-full text-left">
              {driver.totalEarnings ? Number(driver.totalEarnings).toFixed(2) : "0.00"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Alldrivers;