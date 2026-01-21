import React, { useEffect, useState, useRef } from "react";
import { Baseurl } from "../Config";

const History = () => {
  const [history, setHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);

  const [visibleMonth, setVisibleMonth] = useState(new Date().getMonth());
  const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());

  const [isMobile, setIsMobile] = useState(false);
  const datePickerRef = useRef(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientRecord, setSelectedClientRecord] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSelectionMode, setDateSelectionMode] = useState("range");

  // ── New State for Driver Percentage ──────────────────────────────
  const [driverPercentage, setDriverPercentage] = useState(0);

  // ── NEW STATE: Column Drag and Drop ──────────────────────────────
  const defaultColumnOrder = [
    "checkbox",
    "call",
    "client",
    "services",
    "rem",
    "rpm",
    "pr1",
    "total",
    "date",
  ];

  const [columnOrder, setColumnOrder] = useState(() => {
    const savedOrder = localStorage.getItem("driverHistoryColumnOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        // Ensure unique keys and merge defaults in case new columns were added
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
    const savedVisibility = localStorage.getItem("driverHistoryColumnVisibility");
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (e) {
        return {
          checkbox: true,
          call: true,
          client: true,
          services: true,
          rem: true,
          rpm: true,
          pr1: true,
          total: true,
          date: true,
        };
      }
    }
    return {
      checkbox: true,
      call: true,
      client: true,
      services: true,
      rem: true,
      rpm: true,
      pr1: true,
      total: true,
      date: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("driverHistoryColumnOrder", JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem("driverHistoryColumnVisibility", JSON.stringify(visibleColumns));
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

  const getHeaderLabel = (key) => {
    const labels = {
      checkbox: "",
      call: "Call No",
      client: "Clients Name",
      services: "Services",
      rem: "REMS",
      rpm: "RPM",
      pr1: "PR1",
      total: "Total",
      date: "Date",
    };
    return labels[key] || key;
  };
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Fetch Driver Percentage from API (Same as Form) ──────────────────────────────
  useEffect(() => {
    const fetchDriverPercentage = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // Using current month range by default
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(),1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formatDate = (d) => d.toISOString().split('T')[0];

        const url = new URL(`https://expensemanager-production-303e.up.railway.app/api/driver/call-summary`);
        url.searchParams.append("startDate", formatDate(firstDay));
        url.searchParams.append("endDate", formatDate(lastDay));

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data && data.percentage !== undefined) {
          setDriverPercentage(Number(data.percentage));
        }
      } catch (err) {
        console.error("Error fetching driver percentage:", err);
      }
    };

    fetchDriverPercentage();
  }, []);

  // ── Helper to Calculate Earning based on Percentage ──────────────────────────────
  const calculatePercentageEarning = (totalValue) => {
    if (!totalValue || totalValue === 0) return "0.00";
    return (Number(totalValue) * (driverPercentage / 100)).toFixed(2);
  };

  const isValidDate = (date) => date instanceof Date && !isNaN(date);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (showClientModal && !event.target.closest(".client-modal")) {
        setShowClientModal(false);
        setSelectedServiceName(null);
      }
      if (showDeleteModal && !event.target.closest(".delete-modal")) {
        setShowDeleteModal(false);
      }
      if (showColumnVisibilityModal && !event.target.closest(".column-visibility-modal")) {
        setShowColumnVisibilityModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showClientModal, showDeleteModal, showColumnVisibilityModal]);

  const getDefaultCycle = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();
    let start, end;
    if (day >= 1 && day <= 15) {
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
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);

    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchHistory();
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    let filtered = allHistory;
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.clientName.toLowerCase().includes(query) ||
          r.call.toLowerCase().includes(query)
      );
    }
    setHistory(filtered);
  }, [allHistory, searchQuery]);

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const url = new URL(`${Baseurl}/driver/getDriverCalls`);
      url.searchParams.append("limit", "0");
      if (fromDate) url.searchParams.append("startDate", fromDate);
      if (toDate) url.searchParams.append("endDate", toDate);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const formatted = data.data
          .map((record) => {
            const recordDate = record.date || record.createdAt;
            const parsedDate = recordDate ? new Date(recordDate) : null;
            const validDate = isValidDate(parsedDate) ? recordDate : null;
            return {
              _id: record._id,
              call: record.phoneNumber || "-",
              clientName: record.client || "Unknown",
              clientId: record.clientId || record.client?._id || null,
              // Check if record was imported from Excel
              isImported: record.importedFromExcel || false,
              percentageEarning: record.percentageEarning ? Number(record.percentageEarning).toFixed(2) : "0.00",
              totalEarnings: record.totalEarnings ? Number(record.totalEarnings).toFixed(2) : "0.00",
              services: record.servicesUsed?.length > 0
                ? record.servicesUsed
                    .filter((s) => {
                      const name = s.name?.trim().toUpperCase();
                      return !["REMS:KMS ENROUTE", "RPM:KMS UNDER TOW", "PR1:WAITING TIME"]
                        .map((n) => n.toUpperCase())
                        .includes(name);
                    })
                    .map((s) => ({
                      name: s.name || "Unknown Service",
                      id: s._id || s.serviceId || s.id || null,
                    }))
                : [{ name: "No Service", id: null }],
              rpm: record.servicesUsed?.find(
                (s) => s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW"
              )?.unitQuantity
                ? Number(record.servicesUsed.find((s) => s.name?.trim().toUpperCase() === "RPM:KMS UNDER TOW").unitQuantity).toFixed(2)
                : "0.00",
              rem: record.servicesUsed?.find(
                (s) => s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE"
              )?.unitQuantity
                ? Number(record.servicesUsed.find((s) => s.name?.trim().toUpperCase() === "REMS:KMS ENROUTE").unitQuantity).toFixed(2)
                : "0.00",
              pr1: record.servicesUsed?.find(
                (s) => s.name?.trim().toUpperCase() === "PR1:WAITING TIME"
              )?.unitQuantity
                ? Number(record.servicesUsed.find((s) => s.name?.trim().toUpperCase() === "PR1:WAITING TIME").unitQuantity).toFixed(2)
                : "0.00",
              total: record.percentageEarning ? Number(record.percentageEarning).toFixed(2) : "0.00",
              date: validDate,
              createdAt: record.createdAt,
              status: record.status || (Math.random() > 0.5 ? "Approved" : "Pending"),
              servicesUsed: record.servicesUsed?.map((s) => ({
                ...s,
                baseRate: s.baseRate ? Number(s.baseRate).toFixed(2) : "0.00",
                hst: s.hst ? Number(s.hst).toFixed(2) : "0.00",
                total: s.total ? Number(s.total).toFixed(2) : "0.00",
                unitQuantity: s.unitQuantity ? Number(s.unitQuantity).toFixed(2) : "0.00",
              })) || [],
            };
          })
          .filter((r) => r.date !== null)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllHistory(formatted);
      } else {
        setError(data.message || "Failed to fetch history.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Error fetching history.");
      setLoading(false);
    }
  };

  const clearDates = () => {
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);
    setSelectingFrom(true);
    setDateSelectionMode("range");
  };

  const handleSelectRecord = (id) => {
    setSelectedRecords((prev) => {
      const newSelected = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
      setSelectAll(newSelected.length === history.length && history.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords([]);
      setSelectAll(false);
    } else {
      setSelectedRecords(history.map((r) => r._id));
      setSelectAll(true);
    }
  };

  const handleCancelSelection = () => {
    setSelectedRecords([]);
    setSelectAll(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${Baseurl}/driver/driver/calls`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callIds: selectedRecords }),
      });
      if (!response.ok) throw new Error("Failed to delete");
      setAllHistory((prev) => prev.filter((r) => !selectedRecords.includes(r._id)));
      setSelectedRecords([]);
      setSelectAll(false);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
    setDeleteLoading(false);
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

  const handleDateSelect = (day) => {
    const selected = new Date(Date.UTC(visibleYear, visibleMonth, day));
    if (!isValidDate(selected)) return;
    const selectedDateStr = selected.toISOString().split("T")[0];

    if (dateSelectionMode === "single") {
      setFromDate(selectedDateStr);
      setToDate(selectedDateStr);
      setShowDatePicker(false);
    } else {
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
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = visibleMonth === 0 ? 11 : visibleMonth - 1;
    const newYear = visibleMonth === 0 ? visibleYear - 1 : visibleYear;
    setVisibleMonth(newMonth);
    setVisibleYear(newYear);
  };

  const handleNextMonth = () => {
    const newMonth = visibleMonth === 11 ? 0 : visibleMonth + 1;
    const newYear = visibleMonth === 11 ? visibleYear + 1 : visibleYear;
    setVisibleMonth(newMonth);
    setVisibleYear(newYear);
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value);
    setVisibleYear(y);
  };

  const generateYearOptions = () => {
    const current = new Date().getUTCFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(Date.UTC(visibleYear, visibleMonth, 1));
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

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const d = date.toISOString().split("T")[0];
    return d >= fromDate && d <= toDate;
  };

  const isDateSelected = (date) => {
    const d = date.toISOString().split("T")[0];
    return d === fromDate || d === toDate;
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const formatValue = (v) => (v === "0.00" ? "-" : v);

  const currentMonthName = new Date(visibleYear, visibleMonth).toLocaleString("en-US", { month: "long" });

  // ── Imported Badge Component ──────────────────────────────
  const ImportedBadge = () => (
    <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
      Imported
    </span>
  );
  // ─────────────────────────────────────────────────────────────────────

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
        call: false,
        client: false,
        services: false,
        rem: false,
        rpm: false,
        pr1: false,
        total: false,
        date: false,
      });
    } else {
      setVisibleColumns({
        checkbox: true,
        call: true,
        client: true,
        services: true,
        rem: true,
        rpm: true,
        pr1: true,
        total: true,
        date: true,
      });
    }
  };
  // ─────────────────────────────────────────────────────────────────────

  // ── HELPER: Render Cell Content based on Key ──────────────────────────────
  const renderCellContent = (key, record) => {
    // Skip rendering if column is not visible
    if (!visibleColumns[key]) return null;

    switch (key) {
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={selectedRecords.includes(record._id)}
            onChange={() => handleSelectRecord(record._id)}
            onClick={(e) => e.stopPropagation()}
          />
        );
      case "call":
        return <span className="dark:text-[#CECFD3]">{record.call}</span>;
      case "client":
        return (
          <div className="flex items-center">
            <span className="dark:text-[#CECFD3]">{record.clientName}</span>
            {record.isImported && <ImportedBadge />}
          </div>
        );
      case "services":
        return (
          <div className="flex gap-2 flex-wrap">
            {record.services.map((service, sIdx) => (
              <span
                key={sIdx}
                className="border rounded-full dark:text-[#CECFD3] px-2.5 py-0.5 text-sm cursor-pointer hover:text-[#0078bd] dark:border-gray-600"
                onClick={() => handleServiceClick(record, service.name)}
              >
                {service.name}
              </span>
            ))}
          </div>
        );
      case "rem":
        return (
          <span
            className="dark:text-[#CECFD3] cursor-pointer hover:text-[#0078bd]"
            onClick={() => handleServiceClick(record, "REMS:KMS ENROUTE")}
          >
            {formatValue(record.rem)}
          </span>
        );
      case "rpm":
        return (
          <span
            className="dark:text-[#CECFD3] cursor-pointer hover:text-[#0078bd]"
            onClick={() => handleServiceClick(record, "RPM:KMS UNDER TOW")}
          >
            {formatValue(record.rpm)}
          </span>
        );
      case "pr1":
        return (
          <span
            className="dark:text-[#CECFD3] cursor-pointer hover:text-[#0078bd]"
            onClick={() => handleServiceClick(record, "PR1:WAITING TIME")}
          >
            {formatValue(record.pr1)}
          </span>
        );
      case "total":
        return (
          <span
            className="dark:text-[#CECFD3] cursor-pointer hover:text-[#0078bd]"
            onClick={() => handleTotalClick(record)}
          >
            ${formatValue(record.total)}
          </span>
        );
      case "date":
        return <span className="dark:text-[#CECFD3]">{formatDate(record.date)}</span>;
      default:
        return null;
    }
  };
  // ─────────────────────────────────────────────────────────────────────

  const MobileShimmer = () => (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="w-32 h-6 bg-gray-200 dark:bg-[#0078BD3D] rounded animate-pulse"></div>
        <div className="w-48 h-10 bg-gray-200 dark:bg-[#0078BD3D] rounded animate-pulse"></div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#0078BD3D] rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="flex justify-between items-center mb-2">
            <div className="w-24 h-4 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
            <div className="w-20 h-5 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <div className="w-16 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
              <div className="w-12 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
              <div className="w-8 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded ml-auto"></div>
              <div className="w-8 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded ml-2"></div>
              <div className="w-8 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded ml-2"></div>
            </div>
          </div>
          <div className="w-24 h-3 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    if (isMobile) return <MobileShimmer />;
    return (
      <div className="border border-[#F7F7F7] p-4 animate-pulse">
        <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-[#0078BD3D]">
          <div className="h-6 w-1/4 bg-gray-300 dark:bg-[#0078BD3D] rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-[#0078BD3D]">
              <tr>
                <th className="px-6 py-3">
                  <div className="h-4 w-[20px] bg-gray-300 dark:bg-[#0078BD3D] rounded"></div>
                </th>
                {[...Array(8)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-1/3 bg-gray-300 dark:bg-[#0078BD3D] rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  <td className="px-6 py-4 bg-white dark:bg-[#0078BD3D]">
                    <div className="h-4 w-[20px] bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
                  </td>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-6 py-4 bg-white dark:bg-[#0078BD3D]">
                      <div className="h-4 w-1/2 bg-gray-200 dark:bg-[#0078BD3D] rounded"></div>
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
      <div className="border border-[#F7F7F7] p-4 bg-white dark:bg-[#101935]">
        <p className="text-center py-4 text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="border border-[#F7F7F7] dark:border-[#263463] p-4 bg-white dark:bg-[#080F25]">
        {selectedRecords.length > 0 && (
          <div className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 border-b border-[#F7F7F7] dark:border-gray-700 justify-end mb-4 rounded">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
            <button
              onClick={handleCancelSelection}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex flex-col justify-between items-start mb-4 w-full">
          <h2 className="text-[18px] font-semibold text-[#1E293B] mb-2 dark:text-white">
            Call History
          </h2>

          <div className="relative w-full" ref={datePickerRef}>
            <div
              onClick={() => setShowDatePicker((prev) => !prev)}
              className="flex items-center justify-between border border-gray-300 rounded px-4 py-2.5 cursor-pointer hover:border-[#0078bd] focus:outline-none focus:ring-2 focus:ring-[#0078bd] bg-white w-full dark:bg-[#101935] dark:border-gray-700"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  className={`truncate text-[14px] ${
                    !fromDate && !toDate ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {getDateRangeText()}
                </span>
              </div>
              {(fromDate || toDate) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDates();
                  }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 dark:text-gray-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {showDatePicker && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 w-72 dark:bg-[#101935] dark:border-gray-700">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={handlePreviousMonth}
                      className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentMonthName}
                      </span>
                      <select
                        value={visibleYear}
                        onChange={handleYearChange}
                        className="text-xs font-medium text-gray-700 border rounded px-1 py-0.5 bg-white dark:bg-[#101935] dark:text-gray-300 dark:border-gray-600"
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
                      className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex mb-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <button
                      onClick={() => setDateSelectionMode("range")}
                      className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                        dateSelectionMode === "range"
                          ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Date Range
                    </button>
                    <button
                      onClick={() => setDateSelectionMode("single")}
                      className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                        dateSelectionMode === "single"
                          ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Single Date
                    </button>
                  </div>

                  <p className="text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
                    {dateSelectionMode === "single"
                      ? "Select Date"
                      : selectingFrom ? "Select Start Date" : "Select End Date"}
                  </p>

                  <div className="flex flex-col space-y-1 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        fromDate
                          ? "bg-blue-100 text-[#0078bd] dark:bg-[#0078bd] dark:text-blue-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      From: {fromDate ? formatDate(fromDate) : "Not selected"}
                    </span>
                    {dateSelectionMode === "range" && (
                      <span
                        className={`px-2 py-0.5 rounded ${
                          toDate
                            ? "bg-blue-100 text-[#0078bd] dark:bg-[#0078bd] dark:text-blue-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        To: {toDate ? formatDate(toDate) : "Not selected"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 py-1 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((date, index) => {
                    const isCurrentMonth =
                      date.getUTCMonth() === visibleMonth && date.getUTCFullYear() === visibleYear;
                    const isToday =
                      date.toISOString().split("T")[0] ===
                      new Date().toISOString().split("T")[0];
                    const isSelected = isDateSelected(date);
                    const isInRange = isDateInRange(date);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date.getUTCDate())}
                        className={`
                          text-xs py-1 hover:bg-blue-50 rounded transition-colors dark:hover:bg-[#0078bd]
                          ${!isCurrentMonth ? "text-gray-300 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}
                          ${isToday ? "font-bold text-[#0078bd] dark:text-[#0078bd]" : ""}
                          ${isSelected ? "bg-[#0078bd] text-white hover:bg-[#0078bd]" : ""}
                          ${isInRange && !isSelected ? "bg-blue-100 text-[#0078bd] dark:bg-[#0078bd] dark:text-[#0078bd]" : ""}
                        `}
                      >
                        {date.getUTCDate()}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t text-xs dark:border-gray-700">
                  <button
                    onClick={clearDates}
                    className="text-gray-500 hover:text-gray-700 px-1 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      if (dateSelectionMode === "range" && fromDate && !toDate) {
                        setToDate(fromDate);
                      }
                      setSelectingFrom(true);
                    }}
                    className="bg-[#0078bd] text-white px-2 py-0.5 rounded hover:bg-[#0078bd]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by Client Name or Call ID"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0078bd] bg-white text-sm dark:bg-[#101935] dark:border-gray-700 dark:text-gray-300 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500"
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
        </div>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm dark:text-gray-400">
              No Call History
            </div>
          ) : (
            history.map((record, idx) => {
              const serviceName = record.services.length > 0 ? record.services[0]?.name || "-" : "-";
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#101935] rounded-lg p-4 border border-[#EAEFF4] dark:border-gray-700 shadow-[0px_0px_10px_0px_#E3EBFC] dark:shadow-sm dark:shadow-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(record._id)}
                    onChange={() => handleSelectRecord(record._id)}
                    className="w-4 h-4"
                  />
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      <p className="text-[#67778E99] text-[12px] robotomedium dark:text-gray-400">Client Name</p>
                      <div className="flex items-center">
                        <p className="text-[14px] text-[#333333] robotomedium dark:text-gray-300">
                          {record.clientName || "----"}
                        </p>
                        {record.isImported && <ImportedBadge />}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[12px] robotomedium text-[#67778E99] dark:text-gray-400">Total</p>
                      <p
                        onClick={() => handleTotalClick(record)}
                        className="text-[14px] robotobold text-[#2AAC5A] cursor-pointer hover:underline dark:text-green-400"
                      >
                        ${formatValue(record.total)}
                      </p>
                    </div>
                  </div>
                  <hr className="border-[#EAEFF4] mb-3 dark:border-gray-700" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">Call No</span>
                      <span className="text-[#334155] robotomedium text-[14px] dark:text-gray-300">{record.call}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">Service</span>
                      <span
                        className="text-[#0078BD] robotomedium text-[14px] cursor-pointer hover:underline dark:text-[#0078bd]"
                        onClick={() => handleServiceClick(record, serviceName)}
                      >
                        {serviceName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">REMS</span>
                      <span
                        className="text-[#334155] robotomedium text-[14px] cursor-pointer hover:text-[#0078bd] dark:text-gray-300 dark:hover:text-[#0078bd]"
                        onClick={() => handleServiceClick(record, "REMS:KMS ENROUTE")}
                      >
                        {formatValue(record.rem)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">RPM</span>
                      <span
                        className="text-[#334155] robotomedium text-[14px] cursor-pointer hover:text-[#0078bd] dark:text-gray-300 dark:hover:text-[#0078bd]"
                        onClick={() => handleServiceClick(record, "RPM:KMS UNDER TOW")}
                      >
                        {formatValue(record.rpm)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">PR1</span>
                      <span
                        className="text-[#334155] robotomedium text-[14px] cursor-pointer hover:text-[#0078bd] dark:text-gray-300 dark:hover:text-[#0078bd]"
                        onClick={() => handleServiceClick(record, "PR1:WAITING TIME")}
                      >
                        {formatValue(record.pr1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5C5C] text-[14px] robotomedium dark:text-gray-400">Date</span>
                      <span className="text-[#334155] robotomedium text-[14px] dark:text-gray-300">
                        {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showClientModal && selectedClientRecord && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div 
              className="client-modal bg-white dark:bg-[#101935] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto dark:shadow-gray-800/50"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-[#EAEFF4] dark:border-gray-700 border">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Call Details</h2>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setSelectedServiceName(null);
                  }}
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
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2 dark:text-gray-300">
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
                            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                              <p className="text-base font-medium text-gray-700 mb-2 dark:text-gray-200">
                                {service.name}
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Unit Quantity</span>
                                  <span className="text-gray-900 dark:text-gray-200">
                                    {formatValue(Number(service.unitQuantity || 0).toFixed(2))}{" "}
                                    {service.unitType || "unit"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Base Rate</span>
                                  {/* CHANGED: Applied Percentage to Base Rate */}
                                  <span className="text-gray-900 dark:text-gray-200">
                                    ${calculatePercentageEarning(service.baseRate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">HST</span>
                                  {/* CHANGED: Applied Percentage to HST */}
                                  <span className="text-gray-900 dark:text-gray-200">
                                    ${calculatePercentageEarning(service.hst)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                                  <span className="text-[#0078bd] font-medium dark:text-blue-400">
                                    ${calculatePercentageEarning(service.total)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!selectedServiceName && (
                            <div className="flex justify-between items-center px-2 pt-2 border-t border-[#EAEFF4] dark:border-gray-700 border">
                              <label className="text-base font-medium text-gray-600 dark:text-gray-300">
                                Grand Total
                              </label>
                              <div className="flex flex-col items-end">
                                <p className="text-base font-semibold text-[#0078bd] dark:[#0078bd]">
                                  ${formatValue(Number(selectedClientRecord.percentageEarning || 0).toFixed(2))}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                          {selectedServiceName ? "Service Not Used" : "No service details available"}
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="flex justify-end p-4 border-t border-[#EAEFF4] dark:border-gray-700 border">
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setSelectedServiceName(null);
                  }}
                  className="px-6 py-2 bg-[#0078bd] text-white rounded-lg hover:bg-[#0078bd] text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div 
              className="delete-modal bg-white dark:bg-[#101935] rounded-lg p-6 shadow-lg w-full max-w-sm dark:shadow-gray-800/50"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Confirm Delete</h2>
              <p className="mb-6 text-sm dark:text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-bold">{selectedRecords.length}</span> record(s)?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="border border-[#F7F7F7] dark:border-[#263463] dark:bg-[#080F25] p-6">
      {selectedRecords.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 border-b border-[#F7F7F7] dark:border-gray-700 justify-end">
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
      <div className="flex flex-col lg:flex-row justify-between items-center px-4 py-2 bg-white dark:bg-[#101935] mb-6">
        <h2 className="robotomedium text-[20px] dark:text-white">Call History</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowColumnVisibilityModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Column Visibility
          </button>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by Client Name or Call No"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0078bd] bg-white min-w-[250px] dark:bg-[#101935] dark:border-gray-700 dark:text-gray-300 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500"
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
          <div className="relative" ref={datePickerRef}>
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 border border-gray-300 rounded px-4 py-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[250px] dark:bg-[#101935] dark:border-gray-700"
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
              <span className={`flex-1 ${!fromDate && !toDate ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                {getDateRangeText()}
              </span>
              {(fromDate || toDate) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDates();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
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
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80 dark:bg-[#101935] dark:border-gray-700">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={handlePreviousMonth}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentMonthName}
                      </span>
                      <select
                        value={visibleYear}
                        onChange={handleYearChange}
                        className="text-sm font-medium text-gray-700 border rounded px-2 py-1 bg-white dark:bg-[#101935] dark:text-gray-300 dark:border-gray-600"
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
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
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
                  <div className="flex mb-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <button
                      onClick={() => setDateSelectionMode("range")}
                      className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
                        dateSelectionMode === "range"
                          ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Date Range
                    </button>
                    <button
                      onClick={() => setDateSelectionMode("single")}
                      className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
                        dateSelectionMode === "single"
                          ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Single Date
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    {dateSelectionMode === "single"
                      ? "Select Date"
                      : selectingFrom ? "Select Start Date" : "Select End Date"}
                  </p>
                  <div className="flex space-x-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        fromDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      From: {fromDate ? formatDate(fromDate) : "Not selected"}
                    </span>
                    {dateSelectionMode === "range" && (
                      <span
                        className={`px-2 py-1 rounded ${
                          toDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        To: {toDate ? formatDate(toDate) : "Not selected"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((date, index) => {
                    const isCurrentMonth = date.getUTCMonth() === visibleMonth && date.getUTCFullYear() === visibleYear;
                    const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                    const isSelected = isDateSelected(date);
                    const isInRange = isDateInRange(date);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date.getUTCDate())}
                        className={`
                          text-sm py-2 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-800
                          ${!isCurrentMonth ? "text-gray-300 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}
                          ${isToday ? "font-bold text-blue-600 dark:text-blue-400" : ""}
                          ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                          ${isInRange && !isSelected ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                        `}
                      >
                        {date.getUTCDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                  <button
                    onClick={clearDates}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      if (dateSelectionMode === "range" && fromDate && !toDate) {
                        setToDate(fromDate);
                      }
                      setSelectingFrom(true);
                    }}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-[#0078bd]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-[#101935]">
            <tr>
              {/* CHANGED: Dynamic Headers based on Drag & Drop Order */}
              {columnOrder.map((key, index) => (
                <th
                  key={key}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter}
                  onDrop={(e) => onDrop(e, index)}
                  className={`px-6 py-3 text-left text-lg font-bold dark:text-white select-none cursor-move hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    !visibleColumns[key] ? "hidden" : ""
                  }`}
                >
                  {key === "checkbox" ? (
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  ) : (
                    getHeaderLabel(key)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500 bg-white dark:bg-[#101935] dark:text-gray-400">
                  No Call History
                </td>
              </tr>
            ) : (
              history.map((record, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6] dark:border-gray-700">
                  {/* CHANGED: Dynamic Body based on Drag & Drop Order */}
                  {columnOrder.map((key) => (
                    <td key={key} className={`px-6 py-4 bg-white dark:bg-[#101935] ${!visibleColumns[key] ? "hidden" : ""}`}>
                      {renderCellContent(key, record)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showClientModal && selectedClientRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 z-50">
          <div 
            className="client-modal bg-white dark:bg-[#101935] rounded-lg p-6 shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto dark:shadow-gray-800/50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Call Details</h2>
              <button
                onClick={() => {
                  setShowClientModal(false);
                  setSelectedServiceName(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2 dark:text-gray-300">
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
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                            <p className="text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
                              {service.name}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-600 block dark:text-gray-400">
                                  Unit Quantity
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-200">
                                  {formatValue(Number(service.unitQuantity || 0).toFixed(2))}{" "}
                                  {service.unitType || "unit"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block dark:text-gray-400">
                                  Base Rate
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-200">
                                  ${calculatePercentageEarning(service.baseRate)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block dark:text-gray-400">HST</label>
                                <p className="text-sm text-gray-900 dark:text-gray-200">
                                  ${calculatePercentageEarning(service.hst)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block dark:text-gray-400">Total</label>
                                <p className="text-sm text-[#0078bd] dark:text-[#0078bd]">
                                  ${calculatePercentageEarning(service.total)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!selectedServiceName && (
                          <div className="mt-4 flex justify-center items-center gap-[10px]">
                            <label className="text-[22px] font-medium text-gray-600 block dark:text-gray-300">
                              Grand Total
                            </label>
                            <div className="flex flex-col items-end">
                                <p className="text-[22px] font-semibold text-[#0078bd] dark:text-[#0078bd]">
                                  ${formatValue(Number(selectedClientRecord.percentageEarning || 0).toFixed(2))}
                                </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  } else {
                    return (
                      <p className="text-sm text-gray-500 text-center dark:text-gray-400">
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
                className="px-6 py-2 bg-[#0078bd] text-white rounded-lg hover:bg-[#0078bd] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000065] bg-opacity-50 z-50">
          <div 
            className="delete-modal bg-white dark:bg-[#101935] rounded-lg p-6 shadow-lg w-[400px] dark:shadow-gray-800/50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedRecords.length}</span> record(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
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

export default History;