import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import { Baseurl } from "../Config";

const Alldrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});
  const [callsCount, setCallsCount] = useState({});
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [sortBy, setSortBy] = useState("earnings"); // Default to earnings
  const [order, setOrder] = useState("desc"); // Default to descending (Max Earnings)
  const limit = 10;

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        // Fetch drivers without sorting parameters
        const res = await fetch(
          `${Baseurl}/admin/drivers?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch drivers: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("API Response for drivers:", data); // Debug: Check response

        let fetchedDrivers = data.drivers || [];
        setTotalPages(data.totalPages || 1);
        setTotalDrivers(data.totalDrivers || 0);

        // Fetch calls count for each driver
        const callsData = {};
        await Promise.all(
          fetchedDrivers.map(async (driver) => {
            try {
              const callsRes = await fetch(
                `${Baseurl}/admin/calls-for-driver-by/${driver._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (!callsRes.ok) {
                throw new Error("Failed to fetch calls");
              }
              const callsResult = await callsRes.json();
              callsData[driver._id] = callsResult.calls ? callsResult.calls.length : 0;
            } catch (err) {
              console.error(`Error fetching calls for driver ${driver._id}:`, err);
              callsData[driver._id] = 0;
            }
          })
        );
        setCallsCount(callsData);

        // Client-side sorting
        const sortedDrivers = [...fetchedDrivers].sort((a, b) => {
          let valueA, valueB;
          if (sortBy === "earnings") {
            valueA = parseFloat(a.totalEarnings) || 0;
            valueB = parseFloat(b.totalEarnings) || 0;
          } else if (sortBy === "calls") {
            valueA = callsData[a._id] || 0;
            valueB = callsData[b._id] || 0;
          } else {
            return 0; // No sort
          }
          return order === "asc" ? valueA - valueB : valueB - valueA;
        });

        setDrivers(
          sortedDrivers.map((driver) => ({
            ...driver,
            status: driver.status || "active",
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error("Error in fetchDrivers:", err);
        alert("Failed to load drivers. Check console for details.");
        setDrivers([]);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [currentPage, sortBy, order]);

  const handleSortChange = (e) => {
    const [newSortBy, newOrder] = e.target.value.split("-");
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1);
    setSelectedDrivers([]);
    setSelectAll(false);
  };

  const handleDriverClick = (driverId) => {
    navigate(`/admin/callhistory/${driverId}`);
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectDriver = (id) => {
    setSelectedDrivers((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(drivers.map((d) => d._id));
    }
    setSelectAll(!selectAll);
  };

  const handleCancelSelection = () => {
    setSelectedDrivers([]);
    setSelectAll(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${Baseurl}/admin/deleteDrivers`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverIds: selectedDrivers }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete drivers");
      }

      setDrivers((prev) => prev.filter((d) => !selectedDrivers.includes(d._id)));
      setSelectedDrivers([]);
      setSelectAll(false);
      setShowDeleteModal(false);
      setCurrentPage(1);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      name: driver.name || "",
      email: driver.email || "",
      password: driver.password || "",
      status: driver.status || "active",
    });
    setShowEditModal(true);
  };

  const handleUpdateDriver = async () => {
    setEditLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${Baseurl}/admin/updateDriver/${selectedDriver._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update driver");
      }

      const updatedDriver = await response.json();
      setDrivers((prev) =>
        prev.map((d) => (d._id === selectedDriver._id ? { ...d, ...updatedDriver.driver } : d))
      );
      setShowEditModal(false);
      setSelectedDriver(null);
      setEditFormData({ name: "", email: "", password: "", status: "active" });
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update. Try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedDrivers([]);
      setSelectAll(false);
    }
  };

  if (loading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="md:hidden animate-pulse">
          {/* Mobile Header */}
          <div className="flex justify-between items-center bg-[#FAFAFC] px-4 py-3">
            <div className="h-5 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
          </div>
          {/* Mobile Skeletons */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white border border-[#E5E7EB] rounded-lg mx-4 mt-2 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:block">
          <div className="relative flex justify-end p-3">
            <div className="relative">
              <select
                value={`${sortBy}-${order}`}
                onChange={handleSortChange}
                disabled
                className="appearance-none cursor-not-allowed bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078BD] focus:border-[#0078BD] transition duration-150 ease-in-out opacity-50"
              >
                <option value="earnings-desc">Max Earnings</option>
                <option value="earnings-asc">Min Earnings</option>
                <option value="calls-desc">Max Calls</option>
                <option value="calls-asc">Min Calls</option>
              </select>
              <svg
                className="w-4 h-4 text-[#0078BD] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse rounded-lg table-auto sm:table-fixed">
              <thead className="bg-[#FAFAFC] text-left text-sm sm:text-base">
                <tr>
                  <th className="px-4 py-3 w-[19%]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={false}
                        disabled
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-semibold">Driver Name</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Password</th>
                  <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Calls</th>
                  <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Total Earnings</th>
                  <th className="px-4 py-3 w-[5%] font-semibold whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#FAFAFC] animate-pulse">
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-5"><div className="h-4 w-full bg-gray-200 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 px-4 text-sm">
            <div className="text-center sm:text-left">
              Showing 0 of 0 drivers
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
              <button
                onClick={() => handlePageChange(1 - 1)}
                disabled
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page 1 of 1
              </span>
              <button
                onClick={() => handlePageChange(1 + 1)}
                disabled
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      {/* Action Buttons (Delete/Cancel) */}
      {selectedDrivers.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 border-b border-gray-200 justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-[10px] hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={handleCancelSelection}
            className="bg-gray-400 text-white px-4 py-2 rounded-[10px] hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Sorting Dropdown */}
        <div className="relative flex robotoregular justify-end p-3 bg-[#FAFAFC]">
          <div className="relative">
            <select
              value={`${sortBy}-${order}`}
              onChange={handleSortChange}
              className="appearance-none cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078BD] focus:border-[#0078BD] transition duration-150 ease-in-out"
            >
              <option value="earnings-desc">Max Earnings</option>
              <option value="earnings-asc">Min Earnings</option>
              <option value="calls-desc">Max Calls</option>
              <option value="calls-asc">Min Calls</option>
            </select>
            <svg
              className="w-4 h-4 text-[#0078BD] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex justify-between items-center   bg-[#FAFAFC] px-4 py-3">
          <p className="robotosemibold  text-[18px] text-[#333333CC]">Drivers</p>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </div>
        </div>

        {/* Mobile List */}
        {drivers.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500 text-[16px]">No drivers available</p>
          </div>
        ) : (
          <div className="space-y-4 px-0 pb-4">
            {drivers.map((driver) => (
              <div
                key={driver._id}
                className="bg-[#FFFFFF] border border-[#EAEFF4] shadow-sm rounded-lg p-4"
                onClick={() => handleDriverClick(driver._id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver._id)}
                      onChange={() => handleSelectDriver(driver._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-[15px] text-[#333333] robotosemibold flex-1">
                      {driver.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center  gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(driver);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                     <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.99998 15.0002H15.75M2.25 15.0002H3.50591C3.87279 15.0002 4.05624 15.0002 4.22887 14.9587C4.38192 14.922 4.52824 14.8614 4.66245 14.7791C4.81382 14.6864 4.94354 14.5567 5.20296 14.2972L14.625 4.87517C15.2463 4.25385 15.2463 3.24649 14.625 2.62517C14.0037 2.00385 12.9963 2.00385 12.375 2.62517L2.95295 12.0472C2.69352 12.3067 2.5638 12.4364 2.47104 12.5877C2.3888 12.722 2.32819 12.8683 2.29145 13.0213C2.25 13.194 2.25 13.3774 2.25 13.7443V15.0002Z" stroke="#67778E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>

                    </button>
                  
                  </div>
                </div>
                <p className="text-[14px] text-[#67778E] border-b border-[#EAEFF4] pb-1.5 robotomedium  mb-3">
                  {driver.email || "N/A"}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <p className="text-[12px] text-[#333333B2] robotomedium">Calls</p>
                    <p className="text-[16px] font-semibold text-[#67778E]">
                      {callsCount[driver._id] !== undefined ? callsCount[driver._id] : "-"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center robotomedium">
                    <p className="text-[12px] text-[#333333B2]">Total Earning</p>
                      <p className="text-[16px] font-semibold text-[#34C96E]">
                      ${driver.totalEarnings ? Number(driver.totalEarnings).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Pagination */}
        <div className="flex flex-col robotomedium items-center gap-3 mt-4 px-4 text-sm pb-4">
          <div className="text-center">
            Showing {drivers.length} of {totalDrivers} drivers
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700 px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Sorting Dropdown */}
        <div className="relative flex justify-end p-3">
          <div className="relative">
            <select
              value={`${sortBy}-${order}`}
              onChange={handleSortChange}
              className="appearance-none cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078BD] focus:border-[#0078BD] transition duration-150 ease-in-out"
            >
              <option value="earnings-desc">Max Earnings</option>
              <option value="earnings-asc">Min Earnings</option>
              <option value="calls-desc">Max Calls</option>
              <option value="calls-asc">Min Calls</option>
            </select>
            <svg
              className="w-4 h-4 text-[#0078BD] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse rounded-lg table-auto sm:table-fixed">
            <thead className="bg-[#FAFAFC] text-left text-sm sm:text-base">
              <tr>
                <th className="px-4 py-3 w-[19%]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold">Driver Name</span>
                  </div>
                </th>
                <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Email</th>
                <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Password</th>
                <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Calls</th>
                <th className="px-4 py-3 w-[19%] font-semibold whitespace-nowrap">Total Earnings</th>
                <th className="px-4 py-3 w-[5%] font-semibold whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-5 text-center text-gray-500">
                    No drivers available
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr
                    key={driver._id}
                    onClick={() => handleDriverClick(driver._id)}
                    className="border-b border-[#FAFAFC] hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                  >
                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedDrivers.includes(driver._id)}
                          onChange={() => handleSelectDriver(driver._id)}
                        />
                        <span className="truncate">{driver.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="truncate">{driver.email || "N/A"}</span>
                    </td>
                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">
                          {showPassword[driver._id] ? driver.password : "••••••••"}
                        </span>
                        <button onClick={() => togglePassword(driver._id)} className="cursor-pointer">
                          <IoEyeOffOutline className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {callsCount[driver._id] !== undefined ? callsCount[driver._id] : "-"}
                    </td>
                    <td className="px-4 py-5">
                      ${driver.totalEarnings ? Number(driver.totalEarnings).toFixed(2) : "0.00"}
                    </td>
                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditClick(driver)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 px-4 text-sm">
          <div className="text-center sm:text-left">
            Showing {drivers.length} of {totalDrivers} drivers
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{selectedDrivers.length}</span> driver(s)?
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

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-[400px]">
            <h2 className="text-lg robotosemibold mb-4">Edit Driver</h2>
            <div className="mb-4">
              <label className="block text-sm robotomedium  text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-[#DADDE2] bg-[#FAFAFC] rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm robotomedium  text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-[#DADDE2] bg-[#FAFAFC] rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm robotomedium  text-gray-700">Password</label>
              <input
                type="text"
                name="password"
                value={editFormData.password}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-[#DADDE2] bg-[#FAFAFC] rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm robotomedium  text-gray-700">Status</label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-[#DADDE2] bg-[#FAFAFC] rounded-[4px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-[#F6F7F8] border-[#DADDE2] border rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDriver}
                disabled={editLoading}
                className="px-4 py-2 bg-[#0078BD] text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {editLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alldrivers;