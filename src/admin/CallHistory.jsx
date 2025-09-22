import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const CallHistory = () => {
  const { driverId } = useParams();
  const [calls, setCalls] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(
      `https://expensemanager-production-4513.up.railway.app/api/admin/calls-for-driver-by/${driverId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        let filteredCalls = data.calls || [];
        if (fromDate || toDate) {
          filteredCalls = filteredCalls.filter((call) => {
            const callDate = new Date(call.date);
            // Normalize call date to start of the day
            const callDateStr = callDate.toISOString().split('T')[0];

            if (fromDate && toDate) {
              // Range filtering: both dates selected
              const from = new Date(fromDate);
              const to = new Date(toDate);
              const fromStr = from.toISOString().split('T')[0];
              const toStr = to.toISOString().split('T')[0];
              return callDateStr >= fromStr && callDateStr <= toStr;
            } else if (fromDate) {
              // Single date filtering: only fromDate selected
              const from = new Date(fromDate);
              const fromStr = from.toISOString().split('T')[0];
              return callDateStr === fromStr;
            } else if (toDate) {
              // Single date filtering: only toDate selected
              const to = new Date(toDate);
              const toStr = to.toISOString().split('T')[0];
              return callDateStr === toStr;
            }
            return true;
          });
        }
        setCalls(filteredCalls);
        setDriver(data.driver || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [driverId, fromDate, toDate]);

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

  // Extract service totals
  const getServiceTotal = (services, keyword) => {
    const service = services?.find(s => s.name?.toUpperCase().includes(keyword));
    return service ? service.total.toFixed(2) : "0.00";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="robotosemibold text-[24px]">
          Call History {driver ? `- ${driver.name}` : ""}
        </p>
        
        {/* Custom Date Range Picker */}
        <div className="relative" ref={datePickerRef}>
          <div
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 border border-gray-300 rounded px-4 py-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[250px]"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className={`flex-1 ${(!fromDate && !toDate) ? 'text-gray-400' : 'text-gray-700'}`}>
              {getDateRangeText()}
            </span>
            {(fromDate || toDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearDates();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {showDatePicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectingFrom ? "Select Start Date" : "Select End Date"}
                </p>
                <div className="flex space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded ${fromDate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    From: {fromDate ? formatDate(fromDate) : 'Not selected'}
                  </span>
                  <span className={`px-2 py-1 rounded ${toDate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    To: {toDate ? formatDate(toDate) : 'Not selected'}
                  </span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === new Date().getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = isDateSelected(date);
                  const isInRange = isDateInRange(date);
                  const dateStr = date.toISOString().split('T')[0];
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`
                        text-sm py-2 hover:bg-blue-50 rounded transition-colors
                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                        ${isToday ? 'font-bold text-blue-600' : ''}
                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                        ${isInRange && !isSelected ? 'bg-blue-100 text-blue-700' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  onClick={clearDates}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setShowDatePicker(false);
                    setSelectingFrom(true);
                  }}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        // Shimmer effect
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFC] text-left">
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">REMS</th>
                <th className="px-4 py-2">RPM</th>
                <th className="px-4 py-2">PR1</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-[#E5E7EB]">
                    {Array(8)
                      .fill(0)
                      .map((_, j) => (
                        <td key={j} className="px-4 pb-4 pt-10">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : calls.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <p className="text-gray-500 text-[16px]">No Call History Available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFC] text-left">
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">REMS</th>
                <th className="px-4 py-2">RPM</th>
                <th className="px-4 py-2">PR1</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call._id}
                  className="hover:bg-gray-50 border-b border-[#E5E7EB]"
                >
                  <td className="px-4 pb-4 pt-10 whitespace-nowrap">
                    {call.clientId?.name || "N/A"}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {call.phoneNumber || "N/A"}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {call.servicesUsed && call.servicesUsed.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {call.servicesUsed.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[13px] text-[#555555] bg-white border border-[#DADDE2] rounded-full px-2.5 py-0.5 whitespace-nowrap"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {getServiceTotal(call.servicesUsed, "REMS")}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {getServiceTotal(call.servicesUsed, "RPM")}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {getServiceTotal(call.servicesUsed, "PR1")}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {call.totalEarnings?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 pb-4 pt-10">
                    {new Date(call.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CallHistory;