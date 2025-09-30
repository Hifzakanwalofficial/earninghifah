import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaWpforms,
  FaSignOutAlt,
  FaPlus,
  FaBars,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegUser } from "react-icons/fa";
import { BiTaxi } from "react-icons/bi";
import { MdOutlineSpaceDashboard } from "react-icons/md";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [clientForm, setClientForm] = useState({
    name: "",
    services: [
      { name: "", type: "fixed", baseRate: "", hst: "", total: "", freeUnits: "" },
    ],
  });

  const navigate = useNavigate();

  // Show logout confirmation modal
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // Confirm logout
  const handleLogoutConfirm = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully!");
    navigate("/login");
    setIsOpen(false);
    setIsLogoutModalOpen(false);
  };

  // Cancel logout
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  // Open driver modal with cleared fields
  const openDriverModal = () => {
    setDriverForm({ name: "", email: "", password: "" });
    setShowPassword(false);
    setIsDriverModalOpen(true);
  };

  // Driver Submit
  const handleDriverSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (driverForm.password.length < 8 || driverForm.password.length > 8) {
      toast.error("Password must be exactly 8 characters long.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://expensemanager-production-4513.up.railway.app/api/admin/driver",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(driverForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to add driver. Status: ${response.status}`
        );
      }

      const data = await response.json();
      toast.success("Driver added successfully!");
      setDriverForm({ name: "", email: "", password: "" });
      setIsDriverModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Client Submit
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please login again.");
        navigate("/login");
        return;
      }

      const servicesWithNumbers = clientForm.services.map((s) => {
        const baseRate = parseFloat(s.baseRate);
        const hst = parseFloat(s.hst);
        const total = parseFloat(s.total);
        const freeUnits = s.freeUnits === "" ? 0 : parseInt(s.freeUnits);

        // Validate non-negative values
        if (baseRate < 0 || hst < 0 || total < 0 || freeUnits < 0) {
          throw new Error(
            "Service fields (baseRate, hst, total, freeUnits) cannot be negative."
          );
        }

        if (isNaN(baseRate) || isNaN(hst) || isNaN(total)) {
          throw new Error(
            "Service fields (baseRate, hst, total) must be valid numbers."
          );
        }

        return { name: s.name, type: "fixed", baseRate, hst, total, freeUnits };
      });

      const payload = { name: clientForm.name, services: servicesWithNumbers };

      const response = await fetch(
        "https://expensemanager-production-4513.up.railway.app/api/admin/createClient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message || `Failed to add client. Status: ${response.status}`
        );
      }

      toast.success("Client added successfully!");
      setClientForm({
        name: "",
        services: [
          { name: "", type: "fixed", baseRate: "", hst: "", total: "", freeUnits: "" },
        ],
      });
      setIsClientModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const addService = () => {
    setClientForm({
      ...clientForm,
      services: [
        ...clientForm.services,
        { name: "", type: "fixed", baseRate: "", hst: "", total: "", freeUnits: "" },
      ],
    });
  };

  const removeService = (index) => {
    const newServices = [...clientForm.services];
    newServices.splice(index, 1);
    setClientForm({ ...clientForm, services: newServices });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...clientForm.services];
    newServices[index][field] = value;
    setClientForm({ ...clientForm, services: newServices });
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Top Bar */}
      <header className="bg-[#ffffff] p-4 flex justify-between items-center md:ml-[280px] sticky top-0 z-50">
        <button
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <FaBars />
        </button>
        <div className="flex gap-2 justify-end w-full flex-wrap">
          <button
            className="flex items-center gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base"
            onClick={openDriverModal} // Updated to use new function
          >
            <FaPlus /> Driver
          </button>
          <button
            className="flex items-center gap-2 bg-[#0078BD12] text-[#0078BD] px-3 py-2 rounded-[10px] hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
            onClick={() => setIsClientModalOpen(true)}
          >
            <FaPlus /> Client
          </button>
        </div>
      </header>

      {/* Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-[#00000071] z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Driver</h2>
            <form onSubmit={handleDriverSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={driverForm.name}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, name: e.target.value })
                }
                className="p-2 border rounded w-full mb-3"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={driverForm.email}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, email: e.target.value })
                }
                className="p-2 border rounded w-full mb-3"
                required
              />
              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (8 characters)"
                  value={driverForm.password}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, password: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                  minLength="8"
                  maxLength="8"
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] text-white rounded cursor-pointer"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-[#00000067] z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Add Client</h2>
            <form onSubmit={handleClientSubmit}>
              <input
                type="text"
                placeholder="Client Name"
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm({ ...clientForm, name: e.target.value })
                }
                className="p-2 border rounded w-full mb-3"
                required
              />

              {clientForm.services.map((service, index) => (
                <div key={index} className="mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={service.name}
                      onChange={(e) =>
                        handleServiceChange(index, "name", e.target.value)
                      }
                      className="p-2 border rounded w-full"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Base Rate"
                      value={service.baseRate}
                      onChange={(e) =>
                        handleServiceChange(index, "baseRate", e.target.value)
                      }
                      className="p-2 border rounded w-full"
                      required
                      step="0.01"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="HST"
                      value={service.hst}
                      onChange={(e) =>
                        handleServiceChange(index, "hst", e.target.value)
                      }
                      className="p-2 border rounded w-full"
                      required
                      step="0.01"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Total"
                      value={service.total}
                      onChange={(e) =>
                        handleServiceChange(index, "total", e.target.value)
                      }
                      className="p-2 border rounded w-full"
                      required
                      step="0.01"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Free Units/Km"
                      value={service.freeUnits}
                      onChange={(e) =>
                        handleServiceChange(index, "freeUnits", e.target.value)
                      }
                      className="p-2 border rounded w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  {clientForm.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-500 mt-2 cursor-pointer"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="px-4 py-2 bg-[#0078BD] text-white rounded mb-4 cursor-pointer"
              >
                + Another Service
              </button>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] text-white rounded cursor-pointer"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-[#00000071] z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-[#0078BD] text-white rounded cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 md:w-[280px] bg-white h-[100vh] p-4 border-r border-[#E6E6E6] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-[24px] ms-5 italic font-semibold text-[#0078BD] mb-6">
          Earning Dashboard
        </h2>

        <nav className="flex flex-col h-[90vh]">
          <div className="flex-grow">
            <NavLink
              to="/admin/list"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <MdOutlineSpaceDashboard className="w-5 h-5" /> Overview
            </NavLink>
            <NavLink
              to="/admin/clientlist"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <FaRegUser className="w-5 h-5" /> Clients
            </NavLink>
            <NavLink
              to="/admin/alldrivers"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <BiTaxi className="w-5 h-5" /> Drivers
            </NavLink>
          </div>
          <div className="mt-auto fixed bottom-10">
            <button
              className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black hover:bg-gray-100 w-full text-left cursor-pointer"
              onClick={handleLogoutClick}
            >
              <FaSignOutAlt className="w-5 h-5" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;