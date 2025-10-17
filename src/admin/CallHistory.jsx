import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { Baseurl } from "../Config";

const CallHistory = () => {
  const { driverId } = useParams();
  const [calls, setCalls] = useState([]);
  const [allCalls, setAllCalls] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date("2025-10-06T13:01:00Z"));
  const [selectedYear, setSelectedYear] = useState(new Date("2025-10-06T13:01:00Z").getUTCFullYear());
  const datePickerRef = useRef(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientRecord, setSelectedClientRecord] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState("All"); // New state for active tab

  // Helper function to check if a date is valid
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Close date picker and status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (!event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter calls based on date range, search query, and active tab
  useEffect(() => {
    let filtered = allCalls;

    // Apply tab filter
    if (activeTab === "Verified") {
      filtered = filtered.filter((call) => call.status.toLowerCase() === "verified");
    } else if (activeTab === "Unverified") {
      filtered = filtered.filter((call) =>
        call.status.toLowerCase() === "unverified" || call.status.toLowerCase() === "pending"
      );
    }

    // Apply date range filter
    if (fromDate || toDate) {
      if (fromDate && toDate) {
        // Range filter
        const from = new Date(fromDate + "T00:00:00Z");
        const to = new Date(toDate + "T23:59:59.999Z");
        filtered = filtered.filter((call) => {
          if (call.date) {
            const callDate = new Date(call.date);
            return isValidDate(callDate) && callDate >= from && callDate <= to;
          }
          return false;
        });
      } else if (fromDate) {
        // Single date filter
        const from = new Date(fromDate + "T00:00:00Z");
        const to = new Date(fromDate + "T23:59:59.999Z");
        filtered = filtered.filter((call) => {
          if (call.date) {
            const callDate = new Date(call.date);
            return isValidDate(callDate) && callDate >= from && callDate <= to;
          }
          return false;
        });
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((call) =>
        call.clientName.toLowerCase().includes(query) ||
        call.call.toLowerCase().includes(query)
      );
    }

    // Set calls to filtered records
    setCalls(filtered);
    setSelectAll(selectedCalls.length === filtered.length && filtered.length > 0);
  }, [allCalls, fromDate, toDate, searchQuery, activeTab, selectedCalls]);

  // Fetch call history data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(
      `${Baseurl}/admin/calls-for-driver-by/${driverId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Full API response:", data);
        if (data.calls) {
          const formatted = data.calls.map((call, index) => ({
            _id: call._id,
            call: call.phoneNumber || "N/A",
            clientName: call.clientId?.name || "N/A",
            clientId: call.clientId?._id || null,
            services: call.servicesUsed?.length > 0
              ? call.servicesUsed
                  .filter((service) => {
                    const serviceName = service.name?.trim().toUpperCase();
                    return ![
                      "REMS:KMS ENROUTE",
                      "RPM:KMS UNDER TOW",
                      "PR1:WAITING TIME",
                    ].map((name) => name.toUpperCase()).includes(serviceName);
                  })
                  .map((service) => ({
                    name: service.name || "Unknown Service",
                    id: service._id || service.serviceId || service.id || null,
                  }))
              : [{ name: "No Service", id: null }],
            rem: call.servicesUsed?.find((s) =>
              s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE"
            )?.unitQuantity
              ? Number(
                  call.servicesUsed.find((s) =>
                    s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE"
                  ).unitQuantity
                ).toFixed(2)
              : "0.00",
            rpm: call.servicesUsed?.find((s) =>
              s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW"
            )?.unitQuantity
              ? Number(
                  call.servicesUsed.find((s) =>
                    s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW"
                  ).unitQuantity
                ).toFixed(2)
              : "0.00",
            pr1: call.servicesUsed?.find((s) =>
              s.name?.trim().toUpperCase() === "PR1:WAITING TIME"
            )?.unitQuantity
              ? Number(
                  call.servicesUsed.find((s) =>
                    s.name?.trim().toUpperCase() === "PR1:WAITING TIME"
                  ).unitQuantity
                ).toFixed(2)
              : "0.00",
            total: call.totalEarnings ? Number(call.totalEarnings).toFixed(2) : "0.00",
            date: call.date || call.createdAt,
            status: call.status || (index % 2 === 0 ? "Approved" : "Pending"),
            servicesUsed: call.servicesUsed?.map((service) => ({
              ...service,
              baseRate: service.baseRate ? Number(service.baseRate).toFixed(2) : "0.00",
              hst: service.hst ? Number(service.hst).toFixed(2) : "0.00",
              total: service.total ? Number(service.total).toFixed(2) : "0.00",
              unitQuantity: service.unitQuantity ? Number(service.unitQuantity).toFixed(2) : "0.00",
            })) || [],
          }));
          console.log("Formatted calls:", formatted);
          setAllCalls(formatted);
          setCalls(formatted);
          setDriver(data.driver || null);
        } else {
          setError(data.message || "Failed to fetch call history.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching call history:", err);
        setError("Error fetching call history.");
        setLoading(false);
      });
  }, [driverId]);

  // Update call status
  const handleUpdateStatus = async (callId, newStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await fetch(
        `${Baseurl}/admin/update-call-status/${callId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      // Update local state
      setAllCalls((prev) =>
        prev.map((call) =>
          call._id === callId ? { ...call, status: newStatus } : call
        )
      );
      setShowStatusDropdown(null); // Close dropdown after update
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Checkbox handling
  const handleSelectCall = (id) => {
    setSelectedCalls((prev) => {
      const newSelected = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
      setSelectAll(newSelected.length === calls.length && calls.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCalls([]);
      setSelectAll(false);
    } else {
      setSelectedCalls(calls.map((c) => c._id));
      setSelectAll(true);
    }
  };

  const handleCancelSelection = () => {
    setSelectedCalls([]);
    setSelectAll(false);
  };

  // Delete handling
  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      setDeleteLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${Baseurl}/admin/deleteCalls/${driverId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ callIds: selectedCalls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete calls");
      }

      setAllCalls((prev) => prev.filter((c) => !selectedCalls.includes(c._id)));
      setSelectedCalls([]);
      setSelectAll(false);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting calls:", err);
    }
    setDeleteLoading(false);
  };

  // Handle service click to show modal with specific service
  const handleServiceClick = (record, serviceName) => {
    setSelectedClientRecord(record);
    setSelectedServiceName(serviceName);
    setShowClientModal(true);
  };

  // Handle total click to show modal with all services
  const handleTotalClick = (record) => {
    setSelectedClientRecord(record);
    setSelectedServiceName(null);
    setShowClientModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (!isValidDate(date)) return "N/A";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
  };

  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "Select Date Range";
    if (fromDate && !toDate) return `${formatDate(fromDate)}`;
    if (!fromDate && toDate) return `${formatDate(toDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const handleDateSelect = (selectedDate) => {
    const selected = new Date(selectedDate + "T00:00:00Z");
    if (!isValidDate(selected)) return;

    const selectedDateStr = selected.toISOString().split("T")[0];

    if (selectingFrom) {
      setFromDate(selectedDateStr);
      setToDate("");
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
    const currentYear = new Date("2025-10-06T13:01:00Z").getUTCFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 1; year--) {
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Helper function to format values (replace 0.00 with -)
  const formatValue = (value) => {
    return value === "0.00" ? "-" : value;
  };

  // Calculate counts for tabs
  const allCount = allCalls.length;
  const verifiedCount = allCalls.filter((call) => call.status.toLowerCase() === "verified").length;
  const unverifiedCount = allCalls.filter((call) =>
    call.status.toLowerCase() === "unverified" || call.status.toLowerCase() === "pending"
  ).length;

  if (loading) {
    return (
      <div className="border border-[#F7F7F7]  animate-pulse">
        <div className="flex justify-between items-center px-4 py-2 bg-white">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <div className="h-4 w-[20px] bg-gray-300 rounded"></div>
                </th>
                {[...Array(9)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  <td className="px-6 py-4 bg-white">
                    <div className="h-4 w-[20px] bg-gray-200 rounded"></div>
                  </td>
                  {[...Array(9)].map((_, j) => (
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
      </div>
    );
  }

  return (
    <div className="border border-[#F7F7F7] p-0 sm:p-6">
      {selectedCalls.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100  justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={handleCancelSelection}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-col px-4 py-2 bg-white">
        <h2 className="robotomedium text-[20px] mb-4">
          Call History {driver ? `- ${driver.name}` : ""}
        </h2>
        {/* Tabs */}
        <div className="flex items-center justify-between py-5">
          {/* <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab("All")}
              className={`text-[16px] robotomedium pb-2 ${
                activeTab === "All"
                  ? "text-gray-700 border-b-2 border-gray-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All ({allCount})
            </button>
            <button
              onClick={() => setActiveTab("Verified")}
              className={`text-[16px] robotomedium pb-2 ${
                activeTab === "Verified"
                  ? "text-[#18CC6C] border-b-2 border-[#18CC6C]"
                  : "text-[#18CC6C] hover:text-[#16a34a]"
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setActiveTab("Unverified")}
              className={`text-[16px] robotomedium pb-2 ${
                activeTab === "Unverified"
                  ? "text-[#FFA500] border-b-2 border-[#FFA500]"
                  : "text-[#FFA500] hover:text-[#e69500]"
              }`}
            >
              Unverified ({unverifiedCount})
            </button>
          </div> */}
          <div></div>
          <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by Client Name or Call No"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <div className="relative w-full sm:w-auto sm:min-w-[250px]" ref={datePickerRef}>
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center space-x-2 border border-gray-300 rounded px-4 py-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
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
                <span className={`flex-1 ${!fromDate && !toDate ? "text-gray-400" : "text-gray-700"}`}>
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
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-full sm:w-80 max-w-[90vw]">
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
                          {currentDate.toLocaleString("en-US", { month: "long" })}
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          fromDate ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        From: {fromDate ? formatDate(fromDate) : "Not selected"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          toDate ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        To: {toDate ? formatDate(toDate) : "Not selected"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((date, index) => {
                      const isCurrentMonth = date.getUTCMonth() === currentDate.getUTCMonth();
                      const isToday = date.toISOString().split("T")[0] === new Date("2025-10-06T13:01:00Z").toISOString().split("T")[0];
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
                        if (fromDate && !toDate) {
                          setToDate(fromDate);
                        }
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
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Call No</th>
              <th className="px-6 py-3 text-left">Services</th>
              <th className="px-6 py-3 text-left">REMS</th>
              <th className="px-6 py-3 text-left">RPM</th>
              <th className="px-6 py-3 text-left">PR1</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Date</th>
              {/* <th className="px-6 py-3 text-left">Status</th> */}
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-4 text-center text-gray-500 bg-white"
                >
                  No Call History Available
                </td>
              </tr>
            ) : (
              calls.map((call, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#E6E6E6] hover:bg-gray-50"
                >
                  <td className="px-6 py-4 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedCalls.includes(call._id)}
                      onChange={() => handleSelectCall(call._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4 bg-white whitespace-nowrap ">{call.clientName}</td>
                  <td className="px-6 py-4 bg-white">{call.call}</td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex gap-2 flex-wrap">
                      {call.services.map((service, sIdx) => (
                        <span
                          key={sIdx}
                          className="border rounded-full px-2.5 py-0.5 text-sm cursor-pointer hover:text-blue-600"
                          onClick={() => handleServiceClick(call, service.name)}
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 bg-white cursor-pointer hover:text-blue-600"
                    onClick={() => handleServiceClick(call, "REMS:KMS ENROUTE")}
                  >
                    {formatValue(call.rem)}
                  </td>
                  <td
                    className="px-6 py-4 bg-white cursor-pointer hover:text-blue-600"
                    onClick={() => handleServiceClick(call, "RPM:KMS UNDER TOW")}
                  >
                    {formatValue(call.rpm)}
                  </td>
                  <td
                    className="px-6 py-4 bg-white cursor-pointer hover:text-blue-600"
                    onClick={() => handleServiceClick(call, "PR1:WAITING TIME")}
                  >
                    {formatValue(call.pr1)}
                  </td>
                  <td
                    className="px-6 py-4 bg-white cursor-pointer hover:text-blue-600"
                    onClick={() => handleTotalClick(call)}
                  >
                    ${formatValue(call.total)}
                  </td>
                  <td className="px-6 py-4 bg-white">{formatDate(call.date)}</td>
                  {/* <td className="px-6 py-4 bg-white relative status-dropdown">
                    <span
                      style={{
                        color: call.status.toLowerCase() === "pending" || call.status.toLowerCase() === "unverified" ? "#FFA500" : "#18CC6C",
                      }}
                      className="cursor-pointer flex items-center"
                      onClick={() => setShowStatusDropdown(showStatusDropdown === call._id ? null : call._id)}
                    >
                      {capitalizeFirstLetter(call.status.toLowerCase() === "pending" ? "Unverified" : call.status)}
                      <FaChevronDown className="inline-block ml-1 w-3 h-3" />
                    </span>
                    {showStatusDropdown === call._id && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-32">
                        {["verified", "unverified"].map((status) => (
                          <div
                            key={status}
                            className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleUpdateStatus(call._id, status)}
                          >
                            {capitalizeFirstLetter(status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedClientRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Call Details</h2>
              <button
                onClick={() => {
                  setShowClientModal(false);
                  setSelectedServiceName(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Service Details
                </label>
                {(() => {
                  const filteredServices = selectedServiceName
                    ? selectedClientRecord.servicesUsed.filter((service) =>
                        service.name?.trim().toUpperCase() === selectedServiceName?.toUpperCase()
                      )
                    : [...selectedClientRecord.servicesUsed].sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );
                  if (filteredServices.length > 0) {
                    return (
                      <>
                        {filteredServices.map((service, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg mb-3"
                          >
                            <p className="text-lg font-medium text-gray-700 mb-2">
                              {service.name}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-600 block">
                                  Unit Quantity
                                </label>
                                <p className="text-sm text-gray-900">
                                  {formatValue(Number(service.unitQuantity || 0).toFixed(2))}{" "}
                                  {service.unitType || "unit"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block">
                                  Base Rate
                                </label>
                                <p className="text-sm text-gray-900">
                                  ${formatValue(Number(service.baseRate || 0).toFixed(2))}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block">
                                  HST
                                </label>
                                <p className="text-sm text-gray-900">
                                  ${formatValue(Number(service.hst || 0).toFixed(2))}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block">
                                  Total
                                </label>
                                <p className="text-sm text-[#0078bd]">
                                  ${formatValue(Number(service.total || 0).toFixed(2))}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!selectedServiceName && (
                          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-[10px]">
                            <label className="text-[22px] font-medium text-gray-600 block">
                              Grand Total
                            </label>
                            <p className="text-[22px] font-semibold text-[#0078bd]">
                              ${formatValue(Number(selectedClientRecord.total || 0).toFixed(2))}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  } else {
                    return (
                      <p className="text-sm text-gray-500 text-center">
                        {selectedServiceName ? "Service Not Used" : "No service details available"}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowClientModal(false);
                  setSelectedServiceName(null);
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[400px] max-w-[90vw]">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedCalls.length}</span> call(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;