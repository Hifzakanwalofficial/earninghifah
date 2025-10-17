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
  const [sortBy, setSortBy] = useState("earnings");
  const [order, setOrder] = useState("desc");
  const limit = 10;

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const res = await fetch(
          `${Baseurl}/admin/drivers?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&order=${order}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        
        const fetchedDrivers = data.drivers || [];
        setDrivers(
          fetchedDrivers.map((driver) => ({
            ...driver,
            status: driver.status || "active",
          }))
        );
        setTotalPages(data.totalPages || 1);
        setTotalDrivers(data.totalDrivers || 0);

        const callsData = {};
        await Promise.all(
          fetchedDrivers.map(async (driver) => {
            try {
              const res = await fetch(
                `${Baseurl}/admin/calls-for-driver-by/${driver._id}`,
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
      } catch (err) {
        console.error(err);
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
      const response = await fetch(
        `${Baseurl}/admin/deleteDrivers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ driverIds: selectedDrivers }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete drivers");
      }

      setDrivers((prev) => prev.filter((d) => !selectedDrivers.includes(d._id)));
      setSelectedDrivers([]);
      setSelectAll(false);
      setShowDeleteModal(false);
      // Refresh data after deletion
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
    setDeleteLoading(false);
  };

  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      name: driver.name,
      email: driver.email,
      password: driver.password,
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
          body: JSON.stringify({
            name: editFormData.name,
            email: editFormData.email,
            password: editFormData.password,
            status: editFormData.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update driver");
      }

      setDrivers(
        drivers.map((driver) =>
          driver._id === selectedDriver._id
            ? { ...driver, ...editFormData }
            : driver
        )
      );
      setShowEditModal(false);
      setSelectedDriver(null);
      setEditFormData({ name: "", email: "", password: "", status: "active" });
    } catch (err) {
      console.error(err);
      alert("Failed to update driver. Please try again.");
    }
    setEditLoading(false);
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

  return (
    <div className="relative">
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

    {/* Custom dropdown arrow */}
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


      {/* Action Buttons (Delete/Cancel) */}
      {selectedDrivers.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 border-b justify-end">
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
              <th className="px-4 py-3 w-[19%] font-semibold">Email</th>
              <th className="px-4 py-3 w-[19%] font-semibold">Password</th>
              <th className="px-4 py-3 w-[19%] font-semibold">Calls</th>
              <th className="px-4 py-3 w-[19%] font-semibold">Total Earnings</th>
              <th className="px-4 py-3 w-[5%] font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#FAFAFC] animate-pulse">
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-5 text-center text-gray-500">
                  No drivers Available
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr
                  key={driver._id}
                  onClick={() => handleDriverClick(driver._id)}
                  className="border-b border-[#FAFAFC] hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                >
                  <td className="px-4 py-5">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDrivers.includes(driver._id)}
                        onChange={() => handleSelectDriver(driver._id)}
                      />
                      <span className="truncate">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="truncate">{driver.email}</span>
                  </td>
                  <td
                    className="px-4 py-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">
                        {showPassword[driver._id]
                          ? driver.password
                          : "•".repeat(8)}
                      </span>
                      <button
                        onClick={() => togglePassword(driver._id)}
                        className="cursor-pointer"
                      >
                        <IoEyeOffOutline className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    {callsCount[driver._id] !== undefined
                      ? callsCount[driver._id]
                      : "-"}
                  </td>
                  <td className="px-4 py-5">
                    ${driver.totalEarnings
                      ? Number(driver.totalEarnings).toFixed(2)
                      : "0.00"}
                  </td>
                  <td
                    className="px-4 py-5"
                    onClick={(e) => e.stopPropagation()}
                  >
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
      <div className="flex justify-between items-center mt-4 px-4">
        <div>
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
          <span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000075] bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedDrivers.length}</span>{" "}
              driver(s)?
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
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000075] bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Edit Driver</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="text"
                name="password"
                value={editFormData.password}
                onChange={handleEditInputChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDriver}
                disabled={editLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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