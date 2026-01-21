import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Baseurl } from "../Config";
import { BiEditAlt } from "react-icons/bi";

// DATE PICKER COMPONENT (unchanged)
const DateRangePicker = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClearDates,
  onApplyDates,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [y, m, d] = dateStr.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRangeText = () => {
    if (!fromDate) return "Select Range";
    if (!toDate) return `${formatDisplayDate(fromDate)} - Select End`;
    return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`;
  };

  const handleDateSelect = (dateStr) => {
    if (!fromDate || (fromDate && toDate)) {
      onFromDateChange(dateStr);
      onToDateChange(null);
    } else {
      const finalFrom = new Date(dateStr) < new Date(fromDate) ? dateStr : fromDate;
      const finalTo = new Date(dateStr) < new Date(fromDate) ? fromDate : dateStr;
      onFromDateChange(finalFrom);
      onToDateChange(finalTo);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());
    const days = [];
    const temp = new Date(start);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  };

  const handlePrevMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (currentMonth === 0) {
      setCurrentDate(new Date(currentYear, 11, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const handleNextMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (currentMonth === 11) {
      setCurrentDate(new Date(currentYear, 0, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value);
    setSelectedYear(y);
    setCurrentDate(new Date(y, currentDate.getMonth(), 1));
  };

  const generateYearOptions = () => {
    const current = new Date().getUTCFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  };

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const d = formatLocalDate(date);
    return d >= fromDate && d <= toDate;
  };

  const isDateSelected = (date) => {
    const d = formatLocalDate(date);
    return d === fromDate || d === toDate;
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <div
        onClick={() => setShowDatePicker((prev) => !prev)}
        className="flex items-center space-x-2 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 cursor-pointer hover:border-blue-500 bg-white dark:bg-[#101935] text-sm w-45 sm:w-60 dark:text-gray-300"
      >
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`flex-1 text-gray-700 dark:text-gray-300 truncate`}>
          {getDateRangeText()}
        </span>
        {(fromDate || toDate) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearDates();
            }}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDatePicker && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#101935] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 w-80">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handlePrevMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {currentDate.toLocaleString("default", { month: "long" })}
                </span>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 border rounded px-2 py-0.5 bg-white dark:bg-[#101935] dark:border-gray-600"
                >
                  {generateYearOptions().map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleNextMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              {!fromDate || (fromDate && toDate) ? "Start Date" : "End Date"}
            </p>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className={`px-2 py-1 rounded text-xs ${fromDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                From: {fromDate ? formatDisplayDate(fromDate) : "—"}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${toDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                To: {toDate ? formatDisplayDate(toDate) : "—"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-center font-medium text-gray-500 py-1 text-xs dark:text-gray-400">
                {d}
              </div>
            ))}
            {generateCalendarDays().map((date, i) => {
              const isCurrentMonth = date.getUTCMonth() === currentDate.getMonth() && date.getUTCFullYear() === currentDate.getFullYear();
              const isToday = formatLocalDate(date) === formatLocalDate(new Date());
              const isSelected = isDateSelected(date);
              const isInRange = isDateInRange(date);
              const dateStr = formatLocalDate(date);

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(dateStr)}
                  className={`
                    text-xs py-1.5 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-800
                    ${!isCurrentMonth ? "text-gray-300 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}
                    ${isToday ? "font-bold text-blue-600 dark:text-blue-400" : ""}
                    ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                    ${isInRange && !isSelected ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 border-t text-xs dark:border-gray-700">
            <button onClick={onClearDates} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Clear
            </button>
            <button
              onClick={() => {
                onApplyDates();
                setShowDatePicker(false);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Alldrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // *** STATE UPDATED: Added 'caaDriverId' to Create Form ***
  const [driverForm, setDriverForm] = useState({
    caaDriverId: "",
    name: "",
    email: "",
    password: "",
    percentage: "",
  });

  // *** STATE UPDATED: Added 'caaDriverId' to Edit Form ***
  const [editFormData, setEditFormData] = useState({ 
    caaDriverId: "", 
    name: "", 
    email: "", 
    password: "", 
    status: "active",
    percentage: 0
  });

  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);

  const [maxEarnings, setMaxEarnings] = useState(true);
  const [minEarnings, setMinEarnings] = useState(false);
  const [maxCalls, setMaxCalls] = useState(false);
  const [minCalls, setMinCalls] = useState(false);

  const limit = 10;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  // ── NEW STATE: Column Drag and Drop ──────────────────────────────
  const defaultColumnOrder = [
    "checkbox",
    "caaDriverId", 
    "name",
    "email",
    "password",
    "calls",
    "todayEarnings",
    "percentageEarning",
    "totalEarnings",
    "action",
  ];

  const [columnOrder, setColumnOrder] = useState(() => {
    const savedOrder = localStorage.getItem("adminDriverTableColumnOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        const uniqueKeys = Array.from(new Set([...parsed, ...defaultColumnOrder]));
        return uniqueKeys;
      } catch (e) {
        return defaultColumnOrder;
      }
    }
    return defaultColumnOrder;
  });

  // ── NEW STATE: Column Visibility ──────────────────────────────
  const [showColumnVisibilityModal, setShowColumnVisibilityModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedVisibility = localStorage.getItem("adminDriverTableColumnVisibility");
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (e) {
        return {
          checkbox: true,
          caaDriverId: true,
          name: true,
          email: true,
          password: true,
          calls: true,
          todayEarnings: true,
          percentageEarning: true,
          totalEarnings: true,
          action: true,
        };
      }
    }
    return {
      checkbox: true,
      caaDriverId: true,
      name: true,
      email: true,
      password: true,
      calls: true,
      todayEarnings: true,
      percentageEarning: true,
      totalEarnings: true,
      action: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("adminDriverTableColumnOrder", JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem("adminDriverTableColumnVisibility", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Drag Handlers
  const onDragStart = (e, index) => {
    e.dataTransfer.setData("columnIndex", index);
    e.target.style.opacity = "0.4";
  };

  const onDragOver = (e) => e.preventDefault();
  const onDragEnter = (e) => e.preventDefault();

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("columnIndex"));
    if (dragIndex === dropIndex) return;

    const newOrder = [...columnOrder];
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setColumnOrder(newOrder);
  };

  // ── Column Visibility Handlers ──────────────────────────────
  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleSelectAllColumns = () => {
    const allVisible = Object.values(visibleColumns).every((v) => v);
    if (allVisible) {
      setVisibleColumns({
        checkbox: false,
        caaDriverId: false,
        name: false,
        email: false,
        password: false,
        calls: false,
        todayEarnings: false,
        percentageEarning: false,
        totalEarnings: false,
        action: false,
      });
    } else {
      setVisibleColumns({
        checkbox: true,
        caaDriverId: true,
        name: true,
        email: true,
        password: true,
        calls: true,
        todayEarnings: true,
        percentageEarning: true,
        totalEarnings: true,
        action: true,
      });
    }
  };
  // ─────────────────────────────────────────────────────────────────────

  // Helper to render cell content based on key
  const getHeaderLabel = (key) => {
    const labels = {
      checkbox: "",
      caaDriverId: "CAA Driver ID", // <--- Changed from 'ID' to 'CAA Driver ID'
      name: "Driver Name",
      email: "Email",
      password: "Password",
      calls: "Calls",
      todayEarnings: "Today Earnings",
      percentageEarning: "Percentage Earning",
      totalEarnings: "Total Earning",
      action: "Action",
    };
    return labels[key] || key;
  };
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentCycle = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();
    let start, end;
    if (day <= 15) {
      start = new Date(year, month, 1);
      end = new Date(year, month, 15);
    } else {
      start = new Date(year, month, 16);
      end = new Date(year, month + 1, 0);
    }
    const f = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { start: f(start), end: f(end) };
  };

  useEffect(() => {
    const { start, end } = getCurrentCycle();
    setStartDate(start);
    setEndDate(end);
    setTempStartDate(start);
    setTempEndDate(end);
  }, []);

  const resetToCurrentCycle = () => {
    const { start, end } = getCurrentCycle();
    setStartDate(start);
    setEndDate(end);
    setTempStartDate(start);
    setTempEndDate(end);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!startDate || !endDate) return;
    const fetchData = async () => {
      if (loading) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        setFilterLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${Baseurl}/admin/drivers?page=${currentPage}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&maxEarnings=${maxEarnings}&minEarnings=${minEarnings}&maxCalls=${maxCalls}&minCalls=${minCalls}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setDrivers(data.drivers || []);
        setTotalPages(data.totalPages || 1);
        setTotalDrivers(data.totalDrivers || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    };
    fetchData();
  }, [currentPage, startDate, endDate, maxEarnings, minEarnings, maxCalls, minCalls]);

  const handleSortSelect = (type) => {
    setMaxEarnings(type === "maxEarnings");
    setMinEarnings(type === "minEarnings");
    setMaxCalls(type === "maxCalls");
    setMinCalls(type === "minCalls");
    setCurrentPage(1);
    setShowSortDropdown(false);
  };

  const handleDriverClick = (id) => navigate(`/admin/callhistory/${id}`);
  const togglePassword = (id) => setShowPassword((p) => ({ ...p, [id]: !p[id] }));

  const handleSelectDriver = (id) => setSelectedDrivers((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedDrivers(selectAll ? [] : drivers.map((d) => d._id));
  };

  const handleCancelSelection = () => {
    setSelectedDrivers([]);
    setSelectAll(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      await fetch(`${Baseurl}/admin/deleteDrivers`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ driverIds: selectedDrivers }),
      });
      setDrivers((p) => p.filter((d) => !selectedDrivers.includes(d._id)));
      setSelectedDrivers([]);
      setSelectAll(false);
      setShowDeleteModal(false);
    } catch (e) {
      alert("Delete failed");
    }
    setDeleteLoading(false);
  };

  // *** UPDATED: Reset Create Form with caaDriverId ***
  const openDriverModal = () => {
    setDriverForm({ caaDriverId: "", name: "", email: "", password: "", percentage: "" });
    setShowPassword(false);
    setIsDriverModalOpen(true);
  };

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // *** UPDATED: Populate Edit Form with caaDriverId ***
  const handleEditClick = (d) => {
    setSelectedDriver(d);
    setEditFormData({
      caaDriverId: d.caaDriverId || "",
      name: d.name || "",
      email: d.email || "",
      password: "",
      status: d.status || "active",
      percentage: d.percentage || 0,
    });
    setShowEditModal(true);
  };

  const handleUpdateDriver = async () => {
    setEditLoading(true);
    const token = localStorage.getItem("authToken");

    const payload = {
      ...editFormData,
      percentage: Number(editFormData.percentage) || 0
    };

    try {
      const res = await fetch(`${Baseurl}/admin/updateDriver/${selectedDriver._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update driver");
      }

      const upd = await res.json();

      setDrivers((prev) =>
        prev.map((driver) =>
          driver._id === selectedDriver._id ? { ...driver, ...upd.driver } : driver
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error("Update driver error:", error);
      alert(error.message || "Update failed. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();

    if (driverForm.password.length < 8 || driverForm.password.length > 8) {
      alert("Password must be exactly 8 characters long.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("No token found. Please login again.");
        navigate("/login");
        return;
      }

      // *** UPDATED: Map driverForm to API expected format ***
      const apiPayload = {
        caaDriverId: driverForm.caaDriverId,
        name: driverForm.name,
        email: driverForm.email,
        password: driverForm.password,
        percentage: parseInt(driverForm.percentage, 10) // Convert to number
      };

      const response = await fetch(`${Baseurl}/admin/driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add driver. Status: ${response.status}`);
      }

      const data = await response.json();
      alert("Driver added successfully!");
      setDriverForm({ caaDriverId: "", name: "", email: "", password: "", percentage: "" });
      setIsDriverModalOpen(false);
      
      // Refresh drivers list
      const { start, end } = getCurrentCycle();
      setStartDate(start);
      setEndDate(end);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditInputChange = (e) => setEditFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const applyDateFilter = () => {
    if (tempStartDate) {
      const start = tempStartDate;
      const end = tempEndDate || tempStartDate;
      setStartDate(start);
      setEndDate(end);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedDrivers([]);
      setSelectAll(false);
    }
  };

  // Outside click detection for column visibility modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColumnVisibilityModal && !e.target.closest(".column-visibility-modal")) {
        setShowColumnVisibilityModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnVisibilityModal]);

  /* Unified Shimmer Effect */
  const ShimmerCard = () => (
    <div className="animate-pulse">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        .shimmer {
          background: linear-gradient(to right, #f3f4f6 8%, #e5e7eb 18%, #f3f4f6 33%);
          background-size: 800px 104px;
          animation: shimmer 1.5s infinite linear;
        }
        .dark .shimmer {
          background: linear-gradient(to right, #1f2937 8%, #374151 18%, #1f2937 33%);
        }
      `}</style>

      {/* Mobile Shimmer */}
      <div className="md:hidden space-y-4 px-4 pb-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#FAFAFC] dark:bg-[#101935] px-4 py-3">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
        </div>

        {/* 8 skeleton cards */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#101935] border border-[#EAEFF4] dark:border-[#263463] rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              </div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            </div>
            <div className="h-4 w-20 mb-1 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            <div className="h-4 w-56 mb-4 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="flex flex-col items-center">
                <div className="h-3 w-12 mb-1 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-3 w-20 mb-1 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-3 w-20 mb-1 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-3 w-20 mb-1 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Shimmer */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-[#00000000] shadow-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-100 dark:bg-[#101935]">
              <tr>
                <th className="p-6"><div className="w-5 h-5 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-left"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th> {/* CAA Driver ID Shimmer */}
                <th className="p-6 text-left"><div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-left"><div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-left"><div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-center"><div className="h-6 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-right"><div className="h-6 w-28 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-right"><div className="h-6 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-right"><div className="h-6 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
                <th className="p-6 text-center"><div className="h-6 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b dark:border-gray-700">
                  <td className="p-6"><div className="w-5 h-5 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td> {/* CAA Driver ID Shimmer */}
                  <td className="p-6"><div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6"><div className="h-5 w-60 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6"><div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6 text-center"><div className="h-5 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6 text-right"><div className="h-5 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6 text-right"><div className="h-5 w-28 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6 text-right"><div className="h-5 w-28 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                  <td className="p-6 text-center"><div className="w-8 h-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded shimmer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading || filterLoading) {
    return <ShimmerCard />;
  }

  return (
    <div className="relative">
      {selectedDrivers.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 border-b border-[#E6E6E6] dark:border-gray-700 justify-end">
          <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 text-white px-4 py-2 cursor-pointer rounded-[10px] hover:bg-red-600">
            Delete
          </button>
          <button onClick={handleCancelSelection} className="bg-gray-400 text-white px-4 py-2 cursor-pointer rounded-[10px] hover:bg-gray-500">
            Cancel
          </button>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        <div className="flex justify-end items-center gap-2 p-3 bg-[#FAFAFC] dark:bg-[#101935]">
          <div className="relative">
            <select
              value={
                maxEarnings ? "maxEarnings" :
                minEarnings ? "minEarnings" :
                maxCalls ? "maxCalls" :
                minCalls ? "minCalls" : "maxEarnings"
              }
              onChange={(e) => handleSortSelect(e.target.value)}
              className="appearance-none cursor-pointer bg-white dark:bg-[#101935] h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-md px-3 py-1 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078BD] focus:border-[#0078BD] transition duration-150 ease-in-out"
            >
              <option value="maxEarnings">Max Earnings</option>
              <option value="minEarnings">Min Earnings</option>
              <option value="maxCalls">Max Calls</option>
              <option value="minCalls">Min Calls</option>
            </select>
            <svg className="w-3 h-3 text-[#0078BD] absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <DateRangePicker
            fromDate={tempStartDate}
            toDate={tempEndDate}
            onFromDateChange={setTempStartDate}
            onToDateChange={setTempEndDate}
            onClearDates={resetToCurrentCycle}
            onApplyDates={applyDateFilter}
          />
        </div>

        <div className="flex justify-between items-center bg-[#FAFAFC] dark:bg-[#101935] px-4 py-3">
          <p className="robotosemibold text-[18px] text-[#333333CC] dark:text-[#95A0C6]">Drivers</p>
          <div className="flex items-center justify-center">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
          </div>
        </div>

        {drivers.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-[16px]">No drivers available</p>
          </div>
        ) : (
          <div className="space-y-4 px-0 pb-4">
            {drivers.map((driver) => (
              <div key={driver._id} className="bg-[#FFFFFF] dark:bg-[#101935] border border-[#EAEFF4] dark:border-[#263463] shadow-sm p-4" onClick={() => handleDriverClick(driver._id)}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <input type="checkbox" checked={selectedDrivers.includes(driver._id)} onChange={() => handleSelectDriver(driver._id)} onClick={(e) => e.stopPropagation()} />
                    <p className="text-[15px] text-[#333333] dark:text-white robotosemibold flex-1">{driver.name || "N/A"}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(driver); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.99998 15.0002H15.75M2.25 15.0002H3.50591C3.87279 15.0002 4.05624 15.0002 4.22887 14.9587C4.38192 14.922 4.52824 14.8614 4.66245 14.7791C4.81382 14.6864 4.94354 14.5567 5.20296 14.2972L14.625 4.87517C15.2463 4.25385 15.2463 3.24649 14.625 2.62517C14.0037 2.00385 12.9963 2.00385 12.375 2.62517L2.95295 12.0472C2.69352 12.3067 2.5638 12.4364 2.47104 12.5877C2.3888 12.722 2.32819 12.8683 2.29145 13.0213C2.25 13.194 2.25 13.3774 2.25 13.7443V15.0002Z" stroke="#67778E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {/* Added CAA Driver ID Display for Mobile */}
                <p className="text-[12px] text-[#67778E] dark:text-gray-400 robotomedium mb-1">
                  CAA Driver ID: {driver.caaDriverId || "N/A"}
                </p>
                <p className="text-[14px] text-[#67778E] dark:text-gray-400 border-b border-[#EAEFF4] dark:border-gray-700 pb-1.5 robotomedium mb-3">{driver.email || "N/A"}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <p className="text-[12px] text-[#333333B2] dark:text-[#95A0C6] robotomedium">Calls</p>
                    <p className="text-[16px] font-semibold text-[#67778E] dark:text-gray-300">{driver.callsCount || 0}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-[12px] text-[#333333B2] dark:text-[#95A0C6] robotomedium">Today Earnings</p>
                    <p className="text-[16px] font-semibold dark:text-[#ffffff]">${Number(driver.todayEarnings || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-[12px] text-[#333333B2] dark:text-[#95A0C6] robotomedium">
                      Percentage Earning
                    </p>
                    <p className="text-[16px] font-semibold text-[#0078BD] dark:text-blue-400">
                      ${((Number(driver.adminEditsTotalEarnings ?? driver.totalEarnings ?? 0) * (Number(driver.percentage) || 0)) / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <p className="text-[12px] text-[#333333B2] dark:text-[#95A0C6] robotomedium">Total Earning</p>
                    <p className="text-[16px] font-semibold text-green-600 dark:text-green-400">
                      ${((Number(driver.adminEditsTotalEarnings ?? driver.totalEarnings ?? 0) * (Number(driver.percentage) || 0)) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{showPassword[driver._id] ? driver.password : "•••••••••••••"}</span>
                  <button onClick={(e) => { e.stopPropagation(); togglePassword(driver._id); }}>
                    {showPassword[driver._id] ? <IoEyeOutline /> : <IoEyeOffOutline />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col robotomedium items-center gap-3 mt-4 px-4 text-sm pb-4">
          <div className="text-center text-gray-700 dark:text-gray-300">Showing {drivers.length} of {totalDrivers} drivers</div>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300 px-3 py-1">Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <div className="relative flex justify-end items-center p-3 gap-3 bg-[#FAFAFC] dark:bg-[#10193500]">
          <button
            onClick={() => setShowColumnVisibilityModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Column Visibility
          </button>
          
          <DateRangePicker
            fromDate={tempStartDate}
            toDate={tempEndDate}
            onFromDateChange={setTempStartDate}
            onToDateChange={setTempEndDate}
            onClearDates={resetToCurrentCycle}
            onApplyDates={applyDateFilter}
          />

          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0078bd] to-[#0078bd] hover:from-[0078bd] hover:bg-[#0078bd] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all duration-200"
            >
              <span>
                {maxEarnings && "Max Earnings ↑"}
                {minEarnings && "Min Earnings ↓"}
                {maxCalls && "Max Calls ↑"}
                {minCalls && "Min Calls ↓"}
              </span>
            </button>

            {showSortDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl w-56 z-50 overflow-hidden">
                {[
                  { label: "Max Earnings", value: "maxEarnings" },
                  { label: "Min Earnings", value: "minEarnings" },
                  { label: "Max Calls", value: "maxCalls" },
                  { label: "Min Calls", value: "minCalls" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortSelect(opt.value)}
                    className="w-full text-left px-5 py-3.5 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center justify-between transition-all font-medium text-gray-800 dark:text-gray-200"
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#00000000] shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-[#101935]">
              <tr>
                {columnOrder.map((key, index) => (
                  <th
                    key={key}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDrop={(e) => onDrop(e, index)}
                    className={`p-6 text-left text-lg font-bold dark:text-white select-none cursor-move hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      !visibleColumns[key] ? "hidden" : ""
                    }`}
                  >
                   
                    {key === "checkbox" ? (
                       <input
                         type="checkbox"
                         checked={selectAll}
                         onChange={handleSelectAll}
                         onClick={(e) => e.stopPropagation()}
                         className="w-5 h-5 cursor-pointer"
                       />
                    ) : (
                       getHeaderLabel(key)
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
  {drivers.map((d) => (
    <tr 
      key={d._id} 
      className="divide-y divide-gray-200 dark:divide-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      onClick={() => handleDriverClick(d._id)}
    >
      {columnOrder.map((key) => {
        // Skip rendering if column is not visible
        if (!visibleColumns[key]) return null;
        
        let cellContent = null;
        let cellClassName = "p-6 text-lg dark:text-white";

        if (key === "checkbox") {
          cellContent = (
            <input
              type="checkbox"
              checked={selectedDrivers.includes(d._id)}
              onChange={() => handleSelectDriver(d._id)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 cursor-pointer"
            />
          );
        } 
        else if (key === "caaDriverId") {
          cellContent = <span className="robotoregular">{d.caaDriverId || "N/A"}</span>;
        }
        else if (key === "name") {
          cellContent = <span className="robotoregular">{d.name || "N/A"}</span>;
        } 
        else if (key === "email") {
          cellContent = <span className="robotoregular">{d.email || "N/A"}</span>;
        } 
        else if (key === "password") {
          cellContent = (
            <div className="flex items-center gap-3">
              <span>{showPassword[d._id] ? d.password : "•••••••"}</span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  togglePassword(d._id); 
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <IoEyeOffOutline className="text-xl" />
              </button>
            </div>
          );
        } 
        else if (key === "calls") {
          cellContent = (
            <span className="robotoregular text-center block">
              {d.callsCount || 0}
            </span>
          );
        } 
        else if (key === "todayEarnings") {
          cellContent = (
            <span className="robotoregular text-right block">
              ${Number(d.todayEarnings || 0).toFixed(2)}
            </span>
          );
        } 
        else if (key === "percentageEarning") {
          const total = Number(d.adminEditsTotalEarnings ?? d.totalEarnings ?? 0);
          const perc = Number(d.percentage) || 0;
          const value = (total * perc) / 100;

          cellContent = (
            <span className="robotoregular text-right block font-bold text-[#0078BD] dark:text-blue-400">
              ${value.toFixed(2)}
            </span>
          );
        } 
        else if (key === "totalEarnings") {
          const total = Number(d.adminEditsTotalEarnings ?? d.totalEarnings ?? 0);
          cellContent = (
            <span className="robotoregular text-right block text-green-600 dark:text-green-400">
              ${total.toFixed(2)}
            </span>
          );
        } 
        else if (key === "action") {
          cellContent = (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleEditClick(d); 
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-2xl cursor-pointer"
            >
              <BiEditAlt />
            </button>
          );
        }

        return (
         <td 
  key={key} 
  className={`${cellClassName} border-b border-gray-200 dark:border-gray-700 ${
    !visibleColumns[key] ? "hidden" : ""
  }`}
>
  {cellContent}
</td>
        );
      })}
    </tr>
  ))}
</tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-center px-6">
          <p className="text-lg dark:text-white">Showing {drivers.length} of {totalDrivers} drivers</p>
          <div className="flex gap-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-8 py-3 cursor-pointer bg-gray-300 rounded-lg disabled:opacity-50">
              Previous
            </button>
            <span className="text-xl dark:text-white">Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-8 py-3 cursor-pointer bg-gray-300 rounded-lg disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE DRIVER MODAL */}
      {isDriverModalOpen && (
        <div
          className="fixed inset-0 bg-[#00000071] z-50 flex items-center justify-center p-4 sm:p-0"
          onClick={() => setIsDriverModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#101935] p-5 sm:p-6 rounded-lg w-full max-w-md mx-auto shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] sm:text-xl text-[#333333] robotomedium mb-4 text-center sm:text-left dark:text-white">
              Add Driver
            </h2>

            <form onSubmit={handleDriverSubmit} className="space-y-3">
              {/* CAA Driver ID Input */}
              <input
                type="text"
                placeholder="CAA Driver ID"
                value={driverForm.caaDriverId}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, caaDriverId: e.target.value })
                }
                className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                required
              />

              {/* Name Input */}
              <input
                type="text"
                placeholder="Name"
                value={driverForm.name}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, name: e.target.value })
                }
                className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                required
              />

              {/* Email Input */}
              <input
                type="email"
                placeholder="Email"
                value={driverForm.email}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, email: e.target.value })
                }
                className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                required
              />

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (8 characters)"
                  value={driverForm.password}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, password: e.target.value })
                  }
                  className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                  required
                  minLength="8"
                  maxLength="8"
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-600 dark:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>

              {/* Percentage Input */}
              <input
                type="number"
                placeholder="Percentage (e.g. 10)"
                value={driverForm.percentage}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, percentage: e.target.value })
                }
                className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                required
                min="0"
                max="100"
              />

              {/* Buttons */}
              <div className="flex flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 bg-[#F6F7F8] dark:bg-gray-700 rounded-[6px] border border-[#DADDE2] dark:border-gray-600 text-sm sm:text-base w-[50%] sm:w-auto dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] rounded-[6px] text-white text-sm sm:text-base w-[50%] sm:w-auto"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL - UPDATED WITH CAA DRIVER ID */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-50 dark:bg-black/30 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-[90%] max-w-[400px] border dark:border-gray-700">
            <h2 className="text-lg robotosemibold mb-4 text-gray-900 dark:text-white">Edit Driver</h2>

            {/* CAA Driver ID Input Added */}
            <div className="mb-4">
              <label className="block text-sm robotomedium text-gray-700 dark:text-white">CAA Driver ID</label>
              <input 
                type="text" 
                name="caaDriverId" 
                value={editFormData.caaDriverId} 
                onChange={handleEditInputChange} 
                className="mt-1 block w-full dark:text-white border border-[#DADDE2] dark:border-gray-600 bg-[#FAFAFC] dark:bg-gray-700 rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 " 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm robotomedium text-gray-700 dark:text-white">Name</label>
              <input 
                type="text" 
                name="name" 
                value={editFormData.name} 
                onChange={handleEditInputChange} 
                className="mt-1 block w-full dark:text-white border border-[#DADDE2] dark:border-gray-600 bg-[#FAFAFC] dark:bg-gray-700 rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 " 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm robotomedium text-gray-700 dark:text-gray-300">Email</label>
              <input 
                type="email" 
                name="email" 
                value={editFormData.email} 
                onChange={handleEditInputChange} 
                className="mt-1 block w-full border border-[#DADDE2] dark:border-gray-600 bg-[#FAFAFC] dark:bg-gray-700 rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm robotomedium text-gray-700 dark:text-white">Password</label>
              <input 
                type="text" 
                name="password" 
                value={editFormData.password} 
                onChange={handleEditInputChange} 
                className="mt-1 block w-full border border-[#DADDE2] dark:border-gray-600 bg-[#FAFAFC] dark:bg-gray-700 rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm robotomedium text-gray-700 dark:text-white">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                name="percentage"
                value={editFormData.percentage}
                onChange={handleEditInputChange}
                min="0"
                max="100"
                step="1"
                className="mt-1 block w-full border border-[#DADDE2] dark:border-gray-600 bg-[#FAFAFC] dark:bg-gray-700 rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2 bg-[#F6F7F8] cursor-pointer dark:bg-gray-700 border-[#DADDE2] dark:border-gray-600 border rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateDriver} 
                disabled={editLoading} 
                className="px-4 cursor-pointer py-2 bg-[#0078BD] text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {editLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-[90%] max-w-[400px] border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-bold">{selectedDrivers.length}</span> driver(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Visibility Modal */}
      {showColumnVisibilityModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 z-50">
          <div 
            className="column-visibility-modal bg-white dark:bg-[#101935] rounded-lg p-6 shadow-lg w-[400px] dark:shadow-gray-800/50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Column Visibility</h2>
              <button
                onClick={() => setShowColumnVisibilityModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                <input
                  type="checkbox"
                  checked={Object.values(visibleColumns).every((v) => v)}
                  onChange={handleSelectAllColumns}
                  className="w-4 h-4"
                />
              </div>
              {Object.keys(visibleColumns).map((key) => (
                <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{getHeaderLabel(key)}</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns[key]}
                    onChange={() => handleColumnVisibilityChange(key)}
                    className="w-4 h-4"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowColumnVisibilityModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowColumnVisibilityModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alldrivers;