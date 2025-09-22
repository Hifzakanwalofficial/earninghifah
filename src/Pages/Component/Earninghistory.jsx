import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Earninghistory = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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

  // Function to format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to fetch calendar earnings
  const fetchCalendarEarnings = async (startDateParam = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Use provided startDate or default to current month's first date
      const apiStartDate =
        startDateParam ||
        formatDateForAPI(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

      const response = await fetch(
        `https://expensemanager-production-4513.up.railway.app/api/driver/calendar-earnings?startDate=${apiStartDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch calendar earnings data");
      }

      const apiData = await response.json();

      // Transform API data
      const transformedData = apiData.calendarData
        .filter((item) => item.earnings > 0) // Only show days with earnings
        .map((item) => ({
          rawDate: new Date(item.date), // raw date for filtering
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          amount: `₨${item.earnings.toLocaleString()}`,
          earnings: item.earnings, // Keep original earnings value
        }));

      setData(transformedData);
      setFilteredData(transformedData);
      setLoading(false);
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCalendarEarnings();
  }, []);

  // Filter by date range when dates change
  useEffect(() => {
    if (!fromDate && !toDate) {
      setFilteredData(data);
      return;
    }

    let filtered = data;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      filtered = data.filter((item) => item.rawDate >= from && item.rawDate <= to);
    } else if (fromDate) {
      const from = new Date(fromDate);
      filtered = data.filter((item) => item.rawDate >= from);
    }
    setFilteredData(filtered);
  }, [fromDate, toDate, data]);

  // Handle date picker changes
  const handleDateSelect = (selectedDate) => {
    const dateStr = formatDateForAPI(selectedDate);
    if (selectingFrom) {
      setFromDate(dateStr);
      setSelectingFrom(false);
      // Fetch new data based on selected start date
      fetchCalendarEarnings(dateStr);
    } else {
      setToDate(dateStr);
      setShowDatePicker(false);
      setSelectingFrom(true);
    }
  };

  // Clear filters
  const clearDates = () => {
    setFromDate("");
    setToDate("");
    setSelectingFrom(true);
    fetchCalendarEarnings(); // Refetch default data
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get date range text for display
  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "Select Date Range";
    if (fromDate && !toDate) return `From ${formatDate(fromDate)}`;
    if (!fromDate && toDate) return `Until ${formatDate(toDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  // Shimmer Loader
  const TableShimmer = () => (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="w-56 h-3 bg-gray-200 rounded animate-pulse"></div>
      <div className="mt-4">
        <div className="grid grid-cols-2 border-b border-[#E2E8F0] pb-2">
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
        </div>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="grid grid-cols-2 py-2 border-b border-[#E2E8F0]">
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <TableShimmer />;

  if (error) {
    return (
      <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[#1E293B] text-[16px] font-semibold">Earning History</h2>
          <p className="text-[#64748B] text-[14px] mt-1">
            Daily earnings based on calendar data.
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="relative mt-3 md:mt-0" ref={datePickerRef}>
          <div
            className="border border-[#E2E8F0] rounded px-2 py-1 text-sm cursor-pointer"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            {getDateRangeText()}
          </div>
          {showDatePicker && (
            <div className="absolute z-10 bg-white border border-[#E2E8F0] rounded shadow-lg">
              <DatePicker
                selected={selectingFrom ? (fromDate ? new Date(fromDate) : null) : (toDate ? new Date(toDate) : null)}
                onChange={handleDateSelect}
                inline
                minDate={selectingFrom ? null : new Date(fromDate)}
                placeholderText={selectingFrom ? "Select From Date" : "Select To Date"}
              />
            </div>
          )}
          {(fromDate || toDate) && (
            <button
              onClick={clearDates}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 mt-2 md:mt-0 md:ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <div className="grid grid-cols-2 text-[14px] font-semibold text-[#475569] border-b border-[#E2E8F0] pb-2">
          <p>Date</p>
          <p className="text-right">Amounts</p>
        </div>

        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 text-[14px] text-[#334155] py-2 border-b border-[#E2E8F0]"
            >
              <p>{item.date}</p>
              <p className="text-right font-medium">{item.amount}</p>
            </div>
          ))
        ) : (
          <div className="text-[14px] text-[#334155] py-4 text-center">
            {fromDate || toDate
              ? "No earnings data available for selected dates."
              : "No earnings data available."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earninghistory;