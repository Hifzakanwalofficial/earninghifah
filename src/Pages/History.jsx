import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter history based on date range
  useEffect(() => {
    if (!fromDate && !toDate) {
      setHistory(allHistory);
      return;
    }

    let filtered = allHistory;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      filtered = allHistory.filter(record => {
        if (record.date) {
          const recordDate = new Date(record.date);
          return recordDate >= from && recordDate <= to;
        }
        return true; // Include records without date
      });
    }
    setHistory(filtered);
  }, [allHistory, fromDate, toDate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      toast.error("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch("https://expensemanager-production-4513.up.railway.app/api/driver/getDriverCalls", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const formatted = data.data.map((record) => ({
            call: record.phoneNumber || "N/A",
            clientName: record.client || "Unknown",
            services: record.servicesUsed?.length > 0 
              ? record.servicesUsed
                  .filter(service => {
                    const serviceName = service.name?.trim().toUpperCase();
                    return ![
                      "REMS:KMS ENROUTE",
                      "RPM:KMS UNDER TOW",
                      "PR1:WAITING TIME"
                    ].map(name => name.toUpperCase()).includes(serviceName);
                  })
                  .map(service => service.name)
              : ["No Service"],
            rpm: record.servicesUsed?.find(s => s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW")?.unitQuantity
              ? Number(record.servicesUsed.find(s => s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW").unitQuantity).toFixed(2)
              : "N/A",
            rem: record.servicesUsed?.find(s => s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE")?.unitQuantity
              ? Number(record.servicesUsed.find(s => s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE").unitQuantity).toFixed(2)
              : "N/A",
            pr1: record.servicesUsed?.find(s => s.name?.trim().toUpperCase() === "PR1:WAITING TIME")?.unitQuantity
              ? Number(record.servicesUsed.find(s => s.name?.trim().toUpperCase() === "PR1:WAITING TIME").unitQuantity).toFixed(2)
              : "N/A",
            total: record.totalEarnings ? Number(record.totalEarnings).toFixed(2) : "0.00",
            date: record.date || record.createdAt, // Store date for filtering
          }));
          setAllHistory(formatted);
          setHistory(formatted);
        } else {
          setError(data.message || "Failed to fetch history.");
          toast.error(data.message || "Failed to fetch history.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setError("Error fetching history.");
        toast.error("Error fetching history.");
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "Select Date Range";
    if (fromDate && !toDate) return `From ${formatDate(fromDate)}`;
    if (!fromDate && toDate) return `Until ${formatDate(toDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const handleDateSelect = (selectedDate) => {
    if (selectingFrom) {
      setFromDate(selectedDate);
      setSelectingFrom(false);
    } else {
      setToDate(selectedDate);
      setShowDatePicker(false);
      setSelectingFrom(true);
    }
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
    setSelectingFrom(true);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return date >= from && date <= to;
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === fromDate || dateStr === toDate;
  };

  if (loading) {
    return (
      <div className="border border-[#F7F7F7] p-4 animate-pulse">
        {/* Skeleton Loader */}
        <div className="flex justify-between items-center px-4 py-2 bg-white">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4 bg-white">
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#F7F7F7] p-4">
        <p className="text-center py-4 text-red-500">{error}</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="border border-[#F7F7F7] p-4">
      <div className="flex justify-between items-center px-4 py-2 bg-white">
        <h2 className="robotomedium text-[20px]">Call History</h2>
        {/* Date Range Picker */}
        {/* ... your date picker code remains same */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Calls</th>
              <th className="px-6 py-3 text-left">Clients Name</th>
              <th className="px-6 py-3 text-left">Services</th>
              <th className="px-6 py-3 text-left">REMS</th>

              <th className="px-6 py-3 text-left">RPM</th>
              <th className="px-6 py-3 text-left">PR1</th>
              <th className="px-6 py-3 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500 bg-white">
                  No Call History
                </td>
              </tr>
            ) : (
              history.map((record, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  <td className="px-6 py-4 bg-white">{record.call}</td>
                  <td className="px-6 py-4 bg-white">{record.clientName}</td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex gap-2 flex-wrap">
                      {record.services.map((service, sIdx) => (
                        <span key={sIdx} className="border rounded-full px-2.5 py-0.5">
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white">{record.rem}</td>

                  <td className="px-6 py-4 bg-white">{record.rpm}</td>
                  <td className="px-6 py-4 bg-white">{record.pr1}</td>
                  <td className="px-6 py-4 bg-white">{record.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default History;
