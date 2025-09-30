import React, { useState, useEffect, useRef } from "react";

const Earninghistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date("2025-09-23T00:00:00Z")); // Initialize in UTC
  const [selectedYear, setSelectedYear] = useState(new Date("2025-09-23T00:00:00Z").getUTCFullYear());
  const [expandedRows, setExpandedRows] = useState({});
  const datePickerRef = useRef(null);

  // Helper function to check if a date is valid
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

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

  // Function to format date for API (YYYY-MM-DD in UTC)
  const formatDateForAPI = (date) => {
    if (!date || !isValidDate(date)) return null;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to fetch cycle progress data
  const fetchCycleProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Determine date range in UTC
      let apiStartDate, apiEndDate;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Normalize to start of day in UTC
      if (fromDate && toDate) {
        apiStartDate = fromDate;
        apiEndDate = toDate;
      } else {
        apiEndDate = formatDateForAPI(today);
        const startDate = new Date(today);
        startDate.setUTCDate(today.getUTCDate() - 9); // 10 days including end date
        apiStartDate = formatDateForAPI(startDate);
      }

      console.log("API Date Range:", { apiStartDate, apiEndDate });

      const response = await fetch(
        `https://expensemanager-production-4513.up.railway.app/api/driver/cycle-progress?startDate=${apiStartDate}&endDate=${apiEndDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const apiData = await response.json();
      console.log("API Response:", apiData);

      if (!apiData.progress || !Array.isArray(apiData.progress)) {
        throw new Error("Invalid API response format");
      }

      // Transform data
      const transformedData = apiData.progress
        .filter((item) => {
          const itemDate = new Date(item.date);
          if (!isValidDate(itemDate)) return false;
          const start = fromDate ? new Date(fromDate + "T00:00:00Z") : new Date(apiStartDate + "T00:00:00Z");
          const end = toDate ? new Date(toDate + "T23:59:59.999Z") : new Date(apiEndDate + "T23:59:59.999Z");
          return itemDate >= start && itemDate <= end;
        })
        .map((item) => ({
          rawDate: new Date(item.date),
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          }),
          amount: `$${Number(item.totalEarnings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          earnings: Number(item.totalEarnings),
          calls: item.calls.map((call) => ({
            id: call._id,
            client: call.client || "Unknown",
            totalEarnings: Number(call.totalEarnings || 0),
            servicesUsed: call.servicesUsed.map((service) => ({
              name: service.name || "Unknown Service",
              subtotal: Number(service.subtotal || 0).toFixed(2),
              hst: Number(service.hst || 0).toFixed(2),
              total: Number(service.total || 0).toFixed(2),
              unitQuantity: Number(service.unitQuantity || 0).toFixed(2),
              unitType: service.unitType || null,
            })),
          })),
        }))
        .sort((a, b) => b.rawDate - a.rawDate);

      console.log("Transformed Data:", transformedData);
      setData(transformedData);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "An error occurred while fetching data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchCycleProgress();
  }, [fromDate, toDate]);

  // Date formatting for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString + "T00:00:00Z");
    if (!isValidDate(date)) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "Select Date Range";
    if (fromDate && !toDate) return `From ${formatDate(fromDate)}`;
    if (!fromDate && toDate) return `Until ${formatDate(toDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  // Date selection handler
  const handleDateSelect = (selectedDate) => {
    const selected = new Date(selectedDate + "T00:00:00Z");
    if (!isValidDate(selected)) return;

    const selectedDateStr = selectedDate;

    if (selectingFrom) {
      if (toDate && selectedDateStr > toDate) {
        setFromDate(toDate);
        setToDate(selectedDateStr);
      } else {
        setFromDate(selectedDateStr);
      }
      setSelectingFrom(false);
    } else {
      if (fromDate && selectedDateStr < fromDate) {
        setToDate(fromDate);
        setFromDate(selectedDateStr);
      } else {
        setToDate(selectedDateStr);
      }
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
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();

    const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
    const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
    const startDate = new Date(firstDay);
    startDate.setUTCDate(startDate.getUTCDate() - firstDay.getUTCDay());

    const days = [];
    const tempDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(tempDate));
      tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)));
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    setSelectedYear(newYear);
    setCurrentDate(new Date(Date.UTC(newYear, currentDate.getUTCMonth(), 1)));
  };

  const generateYearOptions = () => {
    const currentYear = new Date("2025-09-23T00:00:00Z").getUTCFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const dateStr = date.toISOString().split("T")[0];
    return dateStr >= fromDate && dateStr <= toDate;
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return dateStr === fromDate || dateStr === toDate;
  };

  const toggleRow = (date) => {
    setExpandedRows((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Shimmer Loader
  const TableShimmer = () => (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-56 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-3 border-b border-[#E2E8F0] pb-2">
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
        </div>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="grid grid-cols-3 py-2 border-b border-[#E2E8F0]">
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <TableShimmer />;

  return (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[#1E293B] text-[16px] font-semibold">Earning History</h2>
          <p className="text-[#64748B] text-[14px] mt-1">
            Daily earnings and transactions for the selected date range or last 10 days.
          </p>
        </div>

        {/* Date Range Picker */}
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
            <span
              className={`flex-1 ${
                !fromDate && !toDate ? "text-gray-400" : "text-gray-700"
              }`}
            >
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {showDatePicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {currentDate.toLocaleString("en-US", { month: "long", timeZone: "UTC" })}
                    </span>
                    <select
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="text-sm font-medium text-gray-700 border rounded px-2 py-1"
                    >
                      {generateYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectingFrom ? "Select Start Date" : "Select End Date"}
                </p>
                <div className="flex space-x-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded ${
                      fromDate
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    From: {fromDate ? formatDate(fromDate) : "Not selected"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      toDate
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    To: {toDate ? formatDate(toDate) : "Not selected"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getUTCMonth() === currentDate.getUTCMonth();
                  const isToday = date.toISOString().split("T")[0] === new Date("2025-09-23T00:00:00Z").toISOString().split("T")[0];
                  const isSelected = isDateSelected(date);
                  const isInRange = isDateInRange(date);
                  const dateStr = date.toISOString().split("T")[0];

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`
                        text-sm py-2 hover:bg-blue-50 rounded transition-colors
                        ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                        ${isToday ? "font-bold text-blue-600" : ""}
                        ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                        ${isInRange && !isSelected ? "bg-blue-100 text-blue-700" : ""}
                      `}
                    >
                      {date.getUTCDate()}
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

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-[14px]">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="mt-4">
        <div className="grid grid-cols-3 text-[14px] font-semibold text-[#475569] border-b border-[#E2E8F0] pb-2">
          <p>Date</p>
          <p className="text-center">Transactions</p>
          <p className="text-right">Total Earnings</p>
        </div>

        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={`${item.rawDate.getTime()}-${index}`}>
              <div className="grid grid-cols-3 text-[14px] text-[#334155] py-2 border-b border-[#E2E8F0] last:border-b-0">
                <p>{item.date}</p>
                <p className="text-center">
                  {item.calls.length > 0 ? (
                    <button
                      onClick={() => toggleRow(item.date)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {item.calls.length} {item.calls.length === 1 ? "Transaction" : "Transactions"}
                    </button>
                  ) : (
                    "No Transactions"
                  )}
                </p>
                <p className="text-right font-medium">{item.amount}</p>
              </div>
              {expandedRows[item.date] && item.calls.length > 0 && (
                <div className="pl-4 bg-gray-50 border-b border-[#E2E8F0]">
                  {item.calls.map((call) => (
                    <div
                      key={call.id}
                      className="py-2 px-4 border-t border-gray-200"
                    >
                      <p className="text-[14px] font-semibold text-[#1E293B]">
                        Client: {call.client}
                      </p>
                      <p className="text-[12px] text-[#475569]">
                        Total: ${Number(call.totalEarnings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="mt-2">
                        <p className="text-[12px] font-medium text-[#475569]">
                          Services Used:
                        </p>
                        {call.servicesUsed.map((service, idx) => (
                          <div key={idx} className="text-[12px] text-[#334155] ml-2">
                            <p>
                              {service.name}: ${Number(service.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (HST: $
                              {Number(service.hst).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) = $
                              {Number(service.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {service.unitQuantity > 0 && (
                              <p className="text-gray-500">
                                {service.unitQuantity} {service.unitType || "units"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-[14px] text-[#334155] py-4 text-center">
            {error
              ? "Unable to load data. Please try again."
              : "No earnings data available for the selected date range."}
          </div>
        )}
      </div>

      {/* Total Earnings */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <div className="flex justify-between text-[14px] font-semibold text-[#1E293B]">
            <p>Total Earnings:</p>
            <p>${data.reduce((sum, item) => sum + item.earnings, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earninghistory;