import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { Baseurl } from "../Config";
import EditCallModal from "./EditCallModal";
import { CiEdit } from "react-icons/ci";
import { BiEditAlt } from "react-icons/bi";
// DATE PICKER COMPONENT
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
  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleYearChange = (e) => {
    const y = parseInt(e.target.value);
    setSelectedYear(y);
    setCurrentDate(new Date(y, currentDate.getMonth(), 1));
  };
  const generateYearOptions = () => {
    const current = new Date().getFullYear();
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
        className="flex items-center gap-3 px-5 py-2.5 border rounded-lg dark:text-white bg-white dark:bg-gray-800 hover:border-blue-500 transition"
      >
        <span className="text-sm font-medium">{getDateRangeText()}</span>
        <FaChevronDown className="text-gray-500" />
      </div>
      {showDatePicker && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border rounded-lg shadow-xl p-4 z-50 w-80">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <button onClick={handlePrevMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 border rounded px-2 py-0.5 bg-white dark:bg-gray-800 dark:border-gray-600"
                >
                  {generateYearOptions().map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleNextMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              {!fromDate || (fromDate && toDate) ? "Start Date" : "End Date"}
            </p>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className={`px-2 py-1 rounded ${fromDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                From: {fromDate ? formatDisplayDate(fromDate) : "—"}
              </span>
              <span className={`px-2 py-1 rounded ${toDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                To: {toDate ? formatDisplayDate(toDate) : "—"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-center font-medium text-gray-500 py-1 text-xs dark:text-gray-400">
                {d}
              </div>
            ))}
            {generateCalendarDays().map((date, i) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
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
          <div className="flex justify-between items-center pt-2 border-t mt-2 text-xs dark:border-gray-700">
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
const CallHistory = () => {
  const { driverId } = useParams();
  const [allCalls, setAllCalls] = useState([]);
  const [calls, setCalls] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // State for actual filter dates sent to API
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // Temporary state for new DateRangePicker component
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  // Selection & Delete
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
 
  // Add near showEditModal, showDeleteModal etc.
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedCommentText, setSelectedCommentText] = useState("");
 
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCallForEdit, setSelectedCallForEdit] = useState(null);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);
 
  // Client Modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientRecord, setSelectedClientRecord] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  // Search & Tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  // DRAG AND DROP STATE
  const defaultColumnOrder = [
    "checkbox",
    "date",
    "call",
    "client",
    "services",
    "rem",
    "rpm",
    "pr1",
    "total",
    "vehicleYear",
    "vehicleMake",
    "vehicleModel",
    "vehicleVin",
    "comments",
    "status",
    "action",
  ];
  const [columnOrder, setColumnOrder] = useState(() => {
    const savedOrder = localStorage.getItem("driverTableColumnOrder");
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
    const savedVisibility = localStorage.getItem("driverTableColumnVisibility");
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (e) {
        return {
          checkbox: true,
          date: true,
          call: true,
          client: true,
          services: true,
          rem: true,
          rpm: true,
          pr1: true,
          total: true,
          vehicleYear: true,
          vehicleMake: true,
          vehicleModel: true,
          vehicleVin: true,
          comments: true,
          status: true,
          action: true,
        };
      }
    }
    return {
      checkbox: true,
      date: true,
      call: true,
      client: true,
      services: true,
      rem: true,
      rpm: true,
      pr1: true,
      total: true,
      vehicleYear: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleVin: true,
      comments: true,
      status: true,
      action: true,
    };
  });
  useEffect(() => {
    localStorage.setItem("driverTableColumnOrder", JSON.stringify(columnOrder));
  }, [columnOrder]);
  useEffect(() => {
    localStorage.setItem("driverTableColumnVisibility", JSON.stringify(visibleColumns));
  }, [visibleColumns]);
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
        date: false,
        call: false,
        client: false,
        services: false,
        rem: false,
        rpm: false,
        pr1: false,
        total: false,
        vehicleYear: false,
        vehicleMake: false,
        vehicleModel: false,
        vehicleVin: false,
        comments: false,
        status: false,
        action: false,
      });
    } else {
      setVisibleColumns({
        checkbox: true,
        date: true,
        call: true,
        client: true,
        services: true,
        rem: true,
        rpm: true,
        pr1: true,
        total: true,
        vehicleYear: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleVin: true,
        comments: true,
        status: true,
        action: true,
      });
    }
  };
  // ─────────────────────────────────────────────────────────────────────
  const getHeaderLabel = (key) => {
    const labels = {
      checkbox: "",
      date: "Date",
      call: "Call",
      client: "Client",
      services: "Services",
      rem: "REM",
      rpm: "RPM",
      pr1: "PR1",
      total: "Total",
      vehicleYear: "Year",
      vehicleMake: "Make",
      vehicleModel: "Model",
      vehicleVin: "VIN",
      comments: "Comments",
      status: "Status",
      action: "Actions",
    };
    return labels[key] || key;
  };
  const getDisplayStatus = (status) => {
    if (!status) return "Unverified";
    const lower = status.toLowerCase();
    if (lower === "pending" || lower === "unverified") return "Unverified";
    if (lower === "verified") return "Verified";
    return "Unverified";
  };
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
    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { from: format(start), to: format(end) };
  };
  useEffect(() => {
    const { from, to } = getCurrentCycle();
    setFromDate(from);
    setToDate(to);
    setTempFromDate(from);
    setTempToDate(to);
  }, []);
  const resetToCurrentCycle = () => {
    const { from, to } = getCurrentCycle();
    setFromDate(from);
    setToDate(to);
    setTempFromDate(from);
    setTempToDate(to);
  };
  const applyDateFilter = () => {
    if (tempFromDate) {
      const start = tempFromDate;
      const end = tempToDate || tempFromDate;
      setFromDate(start);
      setToDate(end);
    }
  };
  const handleShowComment = (comment) => {
    setSelectedCommentText(comment === "-" ? "" : comment);
    setShowCommentModal(true);
  };
  const handleServiceClick = (record, serviceName) => {
    setSelectedClientRecord(record);
    setSelectedServiceName(serviceName);
    setShowClientModal(true);
  };
  const handleTotalClick = (record) => {
    setSelectedClientRecord(record);
    setSelectedServiceName(null);
    setShowClientModal(true);
  };
  const formatValue = (v) => (v === "0.00" || v == null ? "-" : Number(v).toFixed(2));
  const filteredCalls = useMemo(() => {
    let filtered = [...allCalls];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          (c.clientName || "").toLowerCase().includes(q) ||
          (c.call || "").toLowerCase().includes(q)
      );
    }
    if (activeTab === "Verified") {
      filtered = filtered.filter((c) => c.status.toLowerCase() === "verified");
    } else if (activeTab === "Unverified") {
      filtered = filtered.filter((c) =>
        ["unverified", "pending"].includes(c.status.toLowerCase())
      );
    }
    return filtered;
  }, [allCalls, searchQuery, activeTab]);
  const counts = useMemo(() => ({
    all: allCalls.length,
    verified: allCalls.filter((c) => c.status.toLowerCase() === "verified").length,
    unverified: allCalls.filter((c) =>
      ["unverified", "pending"].includes(c.status.toLowerCase())
    ).length,
  }), [allCalls]);
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }
    let url = `${Baseurl}/admin/calls-for-driver-by/${driverId}`;
    const params = new URLSearchParams();
    if (fromDate) params.append("startDate", fromDate);
   
    if (toDate) {
      const nextDay = new Date(toDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const endParam = nextDay.toISOString().split("T")[0];
      params.append("endDate", endParam);
    }
    if (params.toString()) url += `?${params.toString()}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.calls) throw new Error("No calls data");
        const formatted = data.calls.map((call) => {
          const adminEdits = call.adminEdits || {};
          const servicesUsed = adminEdits.servicesUsed || call.servicesUsed || [];
          const totalEarnings = adminEdits.totalEarnings ?? call.totalEarnings ?? 0;
         
          const vehicle = call.vehicle || {};
          const commentsList = call.comments || [];
          const commentsString = commentsList.length > 0
            ? commentsList.map(c => c.note).join(", ")
            : "-";
          // Client Name Extraction - Handle both imported and regular calls
          let clientName = "-";
          if (call.importMeta?.excelClient) {
            // For imported calls, use excelClient
            clientName = call.importMeta.excelClient;
          } else if (call.clientId?.name) {
            // For regular calls, use clientId.name
            clientName = call.clientId.name;
          }
          return {
            _id: call._id,
            call: adminEdits.phoneNumber || call.phoneNumber || "-",
            clientName: clientName,
            clientId: call.clientId?._id || null,
            date: adminEdits.date || call.date || call.createdAt,
            status: call.status || "Pending",
            importedFromExcel: call.importedFromExcel || false,
            importMeta: call.importMeta || null,
           services: servicesUsed
  .filter((s) => {
    const n = s.name?.trim().toUpperCase();
    // For imported calls, exclude REMS, RPMS, and PR1 from services display
    if (call.importedFromExcel) {
      return !["REMS", "RPMS", "PR1"].includes(n);
    }
    // For regular calls, exclude the full service names
    return !["REMS:KMS ENROUTE", "RPM:KMS UNDER TOW", "PR1:WAITING TIME"].includes(n);
  })
  .map((s) => ({
    name: s.name || "Unknown",
    id: s._id || s.serviceId,
  })),
            rem: servicesUsed.find((s) => {
              const n = s.name?.trim().toUpperCase();
              // For imported calls, match just "REMS"
              if (call.importedFromExcel) {
                return n === "REMS";
              }
              // For regular calls, match the full service name
              return n.includes("REMS");
            })?.unitQuantity || "0.00",
          rpm: servicesUsed.find((s) => {
  const n = s.name?.trim().toUpperCase();
  // For imported calls, match "RPMS" instead of "RPM"
  if (call.importedFromExcel) {
    return n === "RPMS";
  }
  // For regular calls, match the full service name
  return n.includes("RPM");
})?.unitQuantity || "0.00",
            pr1: servicesUsed.find((s) => {
              const n = s.name?.trim().toUpperCase();
              // For imported calls, match just "PR1"
              if (call.importedFromExcel) {
                return n === "PR1";
              }
              // For regular calls, match the full service name
              return n.includes("PR1");
            })?.unitQuantity || "0.00",
            total: Number(totalEarnings).toFixed(2),
            // Vehicle Data
            vehicleYear: vehicle.year || "-",
            vehicleMake: vehicle.make || "-",
            vehicleModel: vehicle.model || "-",
            vehicleVin: vehicle.vin || "-",
            comments: commentsString,
            servicesUsed: servicesUsed.map((s) => ({
              ...s,
              baseRate: Number(s.baseRate || 0).toFixed(2),
              hst: Number(s.hst || 0).toFixed(2),
              total: Number(s.total || 0).toFixed(2),
              unitQuantity: Number(s.unitQuantity || 0).toFixed(2),
            })),
          };
        });
        setAllCalls(formatted);
        setCalls(formatted);
        setDriver(data.driver || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load calls");
        setLoading(false);
      });
  }, [driverId, fromDate, toDate]);
  const handleCallUpdate = (updatedCall) => {
    setAllCalls((prev) =>
      prev.map((c) =>
        c._id === updatedCall._id
          ? {
              ...c,
              call: updatedCall.phoneNumber || c.call,
              date: updatedCall.date || c.date,
              total: Number(updatedCall.totalEarnings || 0).toFixed(2),
              servicesUsed: (updatedCall.adminEdits?.servicesUsed || []).map((s) => ({
                ...s,
                baseRate: Number(s.baseRate || 0).toFixed(2),
                hst: Number(s.hst || 0).toFixed(2),
                total: Number(s.total || 0).toFixed(2),
                unitQuantity: Number(s.unitQuantity || 0).toFixed(2),
              })),
              rem: updatedCall.adminEdits?.servicesUsed?.find((s) => s.name?.includes("REMS"))?.unitQuantity || "0.00",
             rpm: updatedCall.adminEdits?.servicesUsed?.find((s) => s.name?.includes("RPMS") || s.name?.includes("RPM"))?.unitQuantity || "0.00",
              pr1: updatedCall.adminEdits?.servicesUsed?.find((s) => s.name?.includes("PR1"))?.unitQuantity || "0.00",
            }
          : c
      )
    );
  };
  const handleEditClick = (call) => {
    const index = filteredCalls.findIndex((c) => c._id === call._id);
    setCurrentEditIndex(index);
    setSelectedCallForEdit(call);
    setShowEditModal(true);
  };
  const handlePrevCall = () => {
    if (currentEditIndex > 0) {
      setCurrentEditIndex(currentEditIndex - 1);
      setSelectedCallForEdit(filteredCalls[currentEditIndex - 1]);
    }
  };
  const handleNextCall = () => {
    if (currentEditIndex < filteredCalls.length - 1) {
      setCurrentEditIndex(currentEditIndex + 1);
      setSelectedCallForEdit(filteredCalls[currentEditIndex + 1]);
    }
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedCallForEdit(null);
    setCurrentEditIndex(-1);
  };
  const handleUpdateStatus = async (callId, newStatus) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${Baseurl}/admin/update-call-status/${callId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setAllCalls((prev) =>
        prev.map((c) => (c._id === callId ? { ...c, status: newStatus } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setShowStatusDropdown(null);
    }
  };
  const handleSelectCall = (id) => {
    setSelectedCalls((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCalls([]);
    } else {
      setSelectedCalls(filteredCalls.map((c) => c._id));
    }
    setSelectAll(!selectAll);
  };
  const handleCancelSelection = () => {
    setSelectedCalls([]);
    setSelectAll(false);
  };
  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      await fetch(`${Baseurl}/admin/deleteCalls/${driverId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callIds: selectedCalls }),
      });
      setAllCalls((prev) => prev.filter((c) => !selectedCalls.includes(c._id)));
      setSelectedCalls([]);
      setSelectAll(false);
      setShowDeleteModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".status-dropdown")) {
        setShowStatusDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  // Cell Content Renderer
  const renderCellContent = (columnKey, call) => {
    // Skip rendering if column is not visible
    if (!visibleColumns[columnKey]) return null;
    switch (columnKey) {
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={selectedCalls.includes(call._id)}
            onChange={() => handleSelectCall(call._id)}
            className="cursor-pointer"
          />
        );
      case "date":
        return <span className="whitespace-nowrap dark:text-white">{formatDate(call.date)}</span>;
      case "call":
        return <span className="whitespace-nowrap dark:text-white">{call.call}</span>;
      case "client":
        return (
          <span className="whitespace-nowrap dark:text-white font-medium">
            {call.clientName}
            {call.importedFromExcel && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                Imported
              </span>
            )}
          </span>
        );
     case "services":
  return (
    <div className="flex flex-wrap gap-2 max-w-xs">
      {call.services && call.services.length > 0 ? (
        call.services.map((s, i) => (
          <span
            key={i}
            onClick={() => handleServiceClick(call, s.name)}
            className="inline-block border dark:text-white border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
          >
            {s.name}
          </span>
        ))
      ) : (
        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
          -
        </span>
      )}
    </div>
  );
      case "rem":
        return (
          <span
            className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 font-medium"
            onClick={() => handleServiceClick(call, call.importedFromExcel ? "REMS" : "REMS:KMS ENROUTE")}
          >
            {formatValue(call.rem)}
          </span>
        );
      case "rpm":
        return (
          <span
            className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 font-medium"
            onClick={() => handleServiceClick(call, call.importedFromExcel ? "RPM" : "RPM:KMS UNDER TOW")}
          >
            {formatValue(call.rpm)}
          </span>
        );
      case "pr1":
        return (
          <span
            className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 font-medium"
            onClick={() => handleServiceClick(call, call.importedFromExcel ? "PR1" : "PR1:WAITING TIME")}
          >
            {formatValue(call.pr1)}
          </span>
        );
      case "total":
        return (
          <span
            className="font-bold text-[#0078BD] dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300"
            onClick={() => handleTotalClick(call)}
          >
            ${formatValue(call.total)}
          </span>
        );
      case "vehicleYear":
        return <span className="whitespace-nowrap dark:text-white">{call.vehicleYear}</span>;
      case "vehicleMake":
        return <span className="whitespace-nowrap dark:text-white">{call.vehicleMake}</span>;
      case "vehicleModel":
        return <span className="whitespace-nowrap dark:text-white">{call.vehicleModel}</span>;
      case "vehicleVin":
        return <span className="whitespace-nowrap font-mono text-xs uppercase dark:text-white">{call.vehicleVin}</span>;
      case "comments":
        return (
          <div
            className="text-xs dark:text-gray-300 max-w-[180px] truncate cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => handleShowComment(call.comments)}
            title="Click to view full comment"
          >
            {call.comments && call.comments !== "-" ? (call.comments.length > 65 ? call.comments.substring(0, 62) + "..." : call.comments) : "—"}
          </div>
        );
      case "status":
        return (
          <div className="status-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(showStatusDropdown === call._id ? null : call._id);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                getDisplayStatus(call.status) === "Verified"
                  ? "bg-[#18CC6C]/10 text-[#18CC6C] hover:bg-[#18CC6C]/20"
                  : "bg-[#FFA500]/10 text-[#FFA500] hover:bg-[#FFA500]/20"
              }`}
            >
              <span>{getDisplayStatus(call.status)}</span>
              <FaChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showStatusDropdown === call._id ? "rotate-180" : ""
                }`}
              />
            </button>
            {showStatusDropdown === call._id && (
              <div className="status-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[140px] overflow-visible">
                {["verified", "unverified"].map((st) => (
                  <button
                    key={st}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(call._id, st);
                    }}
                    className="block w-full text-left px-4 py-2.5 dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-300"
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case "action":
        return call.status.toLowerCase() === "verified" ? (
          <span className="text-gray-400">—</span>
        ) : (
          <button onClick={() => handleEditClick(call)} className="text-[#0078bd] hover:underline text-[20px]">
            <BiEditAlt />
          </button>
        );
      default:
        return null;
    }
  };
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-white dark:bg-[#101935] min-h-screen">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mb-8 animate-pulse"></div>
        <div className="flex gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full md:w-96 animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                {[...Array(11)].map((_, i) => (
                  <th key={i} className="p-3 text-left">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b dark:border-gray-700">
                  <td className="p-3"><div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded mx-auto animate-pulse"></div></td>
                  <td className="p-3"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="p-3"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="p-3"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="p-3"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="p-3 text-center"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                  <td className="p-3 text-center"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                  <td className="p-3 text-center"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                  <td className="p-3 text-right"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div></td>
                  <td className="p-3 text-center"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div></td>
                  <td className="p-3 text-center"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (error) return <div className="p-10 text-center text-red-500 text-xl">{error}</div>;
  return (
    <div className="border border-[#F7F7F7] dark:border-[#263463] p-0 sm:p-6">
      {/* Delete Bar */}
      {selectedCalls.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-100 dark:bg-gray-800 justify-end md:justify-between items-center rounded-md shadow-sm">
          <p className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
            {selectedCalls.length} call{selectedCalls.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="flex flex-wrap justify-end w-full sm:w-auto gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none bg-red-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium transition-all"
            >
              Delete
            </button>
            <button
              onClick={handleCancelSelection}
              className="flex-1 sm:flex-none bg-gray-400 dark:bg-gray-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col px-4 py-2 bg-white dark:bg-[#101935]">
        <h2 className="robotomedium text-[20px] mb-4 text-gray-900 dark:text-white">
          Call History {driver ? `- ${driver.name}` : ""}
        </h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 md:gap-0">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setActiveTab("All");
              }}
              className={`text-[16px] robotomedium pb-2 cursor-pointer ${
                activeTab === "All"
                  ? "text-gray-700 dark:text-gray-300 cursor-pointer border-b-2 border-gray-700 dark:border-gray-300"
                  : "text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => {
                setActiveTab("Verified");
              }}
              className={`text-[16px] robotomedium pb-2 cursor-pointer ${
                activeTab === "Verified"
                  ? "text-[#18CC6C] border-b-2 border-[#18CC6C]"
                  : "text-[#18CC6C] hover:text-[#16a34a]"
              }`}
            >
              Verified ({counts.verified})
            </button>
            <button
              onClick={() => {
                setActiveTab("Unverified");
              }}
              className={`text-[16px] robotomedium pb-2 cursor-pointer ${
                activeTab === "Unverified"
                  ? "text-[#FFA500] border-b-2 border-[#FFA500]"
                  : "text-[#FFA500] hover:text-[#e69500]"
              }`}
            >
              Unverified ({counts.unverified})
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto ">
            <button
              onClick={() => setShowColumnVisibilityModal(true)}
              className="bg-blue-500 text-white px-2 w-full py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Column Visibility
            </button>
           
            <div className="relative w-full md:min-w-[250px] ">
              <DateRangePicker
                fromDate={tempFromDate}
                toDate={tempToDate}
                onFromDateChange={setTempFromDate}
                onToDateChange={setTempToDate}
                onClearDates={resetToCurrentCycle}
                onApplyDates={applyDateFilter}
              />
            </div>
            <div className="flex items-center gap-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by client or call no."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-gray-300 dark:focus:border-gray-700 bg-white dark:bg-[#101935] text-gray-900 dark:text-gray-300"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    <svg
                      className="w-4 h-4"
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile View */}
      <div className="md:hidden space-y-4 px-0 pb-4">
        {filteredCalls.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-[16px]">No Call History Available</p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call._id}
              className="bg-white dark:bg-[#101935] border border-[#E5E7EB] dark:border-gray-700 shadow-sm rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCalls.includes(call._id)}
                    onChange={() => handleSelectCall(call._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="text-[15px] text-[#333333] dark:text-gray-300 robotomedium">
                      {call.clientName}
                      {call.importedFromExcel && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                          Imported
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-[#555555] dark:text-gray-400 robotomedium">
                      {formatDate(call.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.status.toLowerCase() !== "verified" && (
                    <button
                      onClick={() => handleEditClick(call)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <BiEditAlt />
                    </button>
                  )}
                  <div className="relative status-dropdown">
                    <span
                      style={{
                        color:
                          call.status.toLowerCase() === "pending" ||
                          call.status.toLowerCase() === "unverified"
                            ? "#FFA500"
                            : "#18CC6C",
                      }}
                      className="cursor-pointer flex items-center robotomedium text-sm"
                      onClick={() =>
                        setShowStatusDropdown(
                          showStatusDropdown === call._id ? null : call._id
                        )
                      }
                    >
                      {getDisplayStatus(call.status)}
                      <FaChevronDown className="inline-block ml-1 w-3 h-3" />
                    </span>
                    {showStatusDropdown === call._id && (
                      <div className="absolute z-10 bg-white dark:bg-[#101935] dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg mt-1 w-32 right-0">
                        {["verified", "unverified"].map((st) => (
                          <div
                            key={st}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:text-white dark:hover:bg-blue-800 text-gray-900 dark:text-gray-300`}
                            onClick={() => handleUpdateStatus(call._id, st)}
                          >
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[14px] text-[#555555] dark:text-gray-400 robotomedium mb-3">
                Call No: {call.call}
              </p>
            <div className="mb-3">
  <p className="text-[14px] text-[#555555] dark:text-gray-400 robotomedium mb-2">
    Services
  </p>
  <div className="flex flex-wrap gap-2">
    {call.services && call.services.length > 0 ? (
      call.services.map((s, i) => (
        <span
          key={i}
          className="robotomedium text-[#67778E] dark:text-gray-400 bg-[#67778E0A] dark:bg-gray-800 rounded-full px-3 py-1 text-[12px] cursor-pointer hover:text-blue-600"
          onClick={() => handleServiceClick(call, s.name)}
        >
          {s.name}
        </span>
      ))
    ) : (
      <span className="text-gray-500 dark:text-gray-600 text-[13px] italic">
        -
      </span>
    )}
  </div>
</div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex flex-col items-start">
                  <p className="text-[12px] text-[#555555] dark:text-gray-400 robotomedium">REMS</p>
                  <p
                    className="text-[14px] robotomedium cursor-pointer dark:text-gray-400 hover:text-blue-600"
                    onClick={() => handleServiceClick(call, call.importedFromExcel ? "REMS" : "REMS:KMS ENROUTE")}
                  >
                    {formatValue(call.rem)}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[12px] text-[#555555] dark:text-gray-400 robotomedium">RPM</p>
                  <p
                    className="text-[14px] robotomedium dark:text-gray-400 cursor-pointer hover:text-blue-600"
                    onClick={() => handleServiceClick(call, call.importedFromExcel ? "RPM" : "RPM:KMS UNDER TOW")}
                  >
                    {formatValue(call.rpm)}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[12px] text-[#555555] dark:text-gray-400 robotomedium">PR1</p>
                  <p
                    className="text-[14px] robotomedium dark:text-gray-400 cursor-pointer hover:text-blue-600"
                    onClick={() => handleServiceClick(call, call.importedFromExcel ? "PR1" : "PR1:WAITING TIME")}
                  >
                    {formatValue(call.pr1)}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[12px] text-[#555555] dark:text-gray-400 robotomedium">Total</p>
                  <p
                    className="text-[14px] robotosemibold text-[#0078BD] cursor-pointer hover:text-blue-700"
                    onClick={() => handleTotalClick(call)}
                  >
                    ${formatValue(call.total)}
                  </p>
                </div>
              </div>
             
              {/* NEW MOBILE SECTION: Vehicle Details */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                 <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-500 uppercase">Year</span>
                       <span className="text-xs font-medium dark:text-gray-400">{call.vehicleYear}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-500 uppercase">Make</span>
                       <span className="text-xs font-medium dark:text-gray-400">{call.vehicleMake}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-500 uppercase">Model</span>
                       <span className="text-xs font-medium dark:text-gray-400">{call.vehicleModel}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-500 uppercase">VIN</span>
                       <span className="text-xs font-mono truncate dark:text-gray-400">{call.vehicleVin}</span>
                    </div>
                 </div>
                 {call.comments && call.comments !== "-" && (
    <div className="mt-3">
      <span className="text-[10px] text-gray-500 block uppercase font-medium">
        Comments
      </span>
      <div
        className="text-xs dark:text-gray-300 mt-1 cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => handleShowComment(call.comments)}
        title="Click to view full comment"
      >
        {call.comments.length > 85
          ? call.comments.substring(0, 82) + "..."
          : call.comments}
      </div>
    </div>
  )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Desktop Table with Drag and Drop */}
      <div className="hidden md:block overflow-x-auto -mx-4 px-4">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-[1200px] w-full border-collapse rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                {columnOrder.map((key, index) => (
                  <th
                    key={key}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDrop={(e) => onDrop(e, index)}
                    className={`px-6 py-3 text-left text-gray-900 dark:text-gray-300 select-none cursor-move hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      !visibleColumns[key] ? "hidden" : ""
                    }`}
                    style={{ width: key === "checkbox" ? "50px" : "auto" }}
                  >
                    {key === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    ) : (
                      getHeaderLabel(key)
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#101935] divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnOrder.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Call History Available
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr
                    key={call._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {columnOrder.map((key) => (
                      <td key={key} className={`px-6 py-4 relative ${!visibleColumns[key] ? "hidden" : ""}`}>
                        {renderCellContent(key, call)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && selectedCallForEdit && (
        <EditCallModal
          call={selectedCallForEdit}
          filteredCalls={filteredCalls}
          currentEditIndex={currentEditIndex}
          isOpen={showEditModal}
          onUpdate={handleCallUpdate}
          onClose={handleCloseEdit}
          onPrev={handlePrevCall}
          onNext={handleNextCall}
          hasPrev={currentEditIndex > 0}
          hasNext={currentEditIndex < filteredCalls.length - 1}
        />
      )}
      {showClientModal && selectedClientRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 z-50 p-4">
          <div
            className="bg-white dark:bg-[#101935] rounded-lg p-6 shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Call Details
              </h2>
              <button
                onClick={() => {
                  setShowClientModal(false);
                  setSelectedServiceName(null);
                }}
                className="text-gray-400 cursor-pointer dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
              {(() => {
                const services = selectedServiceName
                  ? selectedClientRecord.servicesUsed.filter(
                      (s) =>
                        s.name?.trim().toUpperCase() ===
                        selectedServiceName.toUpperCase()
                    )
                  : [...selectedClientRecord.servicesUsed].sort((a, b) =>
                      a.name.localeCompare(b.name)
                    );
                if (services.length === 0)
                  return (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {selectedServiceName
                        ? "Service Not Used"
                        : "No service details available"}
                    </p>
                  );
                return (
                  <>
                    {services.map((s, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-lg font-medium text-gray-700 dark:text-white mb-2">
                          {s.name}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 block">
                              Unit Quantity
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-300">
                              {formatValue(
                                Number(s.unitQuantity || 0).toFixed(2)
                              )}{" "}
                              {s.unitType || "unit"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 block">
                              Base Rate
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-300">
                              ${formatValue(
                                Number(s.baseRate || 0).toFixed(2)
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 block">
                              HST
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-300">
                              ${formatValue(Number(s.hst || 0).toFixed(2))}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 block">
                              Total
                            </label>
                            <p className="text-sm text-[#0078bd]">
                              ${formatValue(Number(s.total || 0).toFixed(2))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!selectedServiceName && (
                      <div className="mt-4 flex justify-center items-center gap-[10px]">
                        <label className="text-[22px] font-medium text-gray-600 dark:text-gray-400">
                          Grand Total
                        </label>
                        <p className="text-[22px] font-semibold text-[#0078bd]">
                          ${formatValue(
                            Number(selectedClientRecord.total || 0).toFixed(2)
                          )}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowClientModal(false);
                  setSelectedServiceName(null);
                }}
                className="px-6 py-2 bg-blue-500 cursor-pointer text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showCommentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white dark:bg-[#101935] rounded-lg p-6 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-gray-300 dark:border-gray-700 relative">
           
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Call Comment
              </h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {selectedCommentText || "No comment available"}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 p-4 z-50">
          <div
            className="bg-white dark:bg-[#101935] rounded-lg p-4 sm:p-6 shadow-lg w-full max-w-[400px] border border-gray-300 dark:border-gray-700 delete-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedCalls.length}</span> call
              {selectedCalls.length > 1 ? "s" : ""}?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 cursor-pointer dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded hover:bg-red-600 disabled:opacity-50 w-full sm:w-auto"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
export default CallHistory;