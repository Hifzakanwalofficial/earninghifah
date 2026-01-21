import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Baseurl } from "../Config";
import { TbTicket } from "react-icons/tb";
import {
  FaWpforms,
  FaSignOutAlt,
  FaPlus,
  FaBars,
  FaEye,
  FaEyeSlash,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegUser } from "react-icons/fa";
import { BiTaxi } from "react-icons/bi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { PhoneCall } from "lucide-react";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // check if window is defined for SSR safety
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // *** CHANGE START: Added caaDriverId and percentage to driverForm state ***
  const [driverForm, setDriverForm] = useState({
    caaDriverId: "", // Changed from id to caaDriverId
    name: "",
    email: "",
    password: "",
    percentage: "",
  });
  // *** CHANGE END ***

  const [clientForm, setClientForm] = useState({
    name: "",
    hstPercent: "13",
    services: [
      { name: "REMS:KMS ENROUTE", baseRate: "", freeUnits: "", isPredefined: true, type: "distance" },
      { name: "RPM:KMS UNDER TOW", baseRate: "", freeUnits: "", isPredefined: true, type: "distance" },
      { name: "PR1:WAITING TIME", baseRate: "", unitQuantity: "", isPredefined: true, type: "time" },
    ],
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Token Expiry Check
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;
        if (Date.now() >= exp) {
          localStorage.removeItem("authToken");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("authToken");
        navigate('/login');
      }
    };

    checkTokenExpiry();
    const intervalId = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Dark Mode Logic
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const DarkModeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className={` cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        className={`absolute top-0.5 left-0.5 inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-800 shadow transform transition-transform duration-300 ease-in-out ${
          darkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
      <span className="absolute left-1.5 flex items-center">
        <FaSun className={`h-3 w-3 text-yellow-400 transition-opacity duration-200 ${darkMode ? 'opacity-0' : 'opacity-100'}`} />
      </span>
      <span className="absolute right-1.5 flex items-center">
        <FaMoon className={`h-3 w-3 text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${darkMode ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </button>
  );

  useEffect(() => {
    if (isClientModalOpen || isDriverModalOpen || isLogoutModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isClientModalOpen, isDriverModalOpen, isLogoutModalOpen]);

  const addNewService = () => {
    setClientForm({
      ...clientForm,
      services: [...clientForm.services, { name: "", baseRate: "", freeUnits: "", unitQuantity: "", isPredefined: false, type: "fixed" }],
    });
  };

  const removeService = (index) => {
    const newServices = clientForm.services.filter((_, i) => i !== index);
    setClientForm({ ...clientForm, services: newServices });
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully!");
    navigate("/login");
    setIsOpen(false);
    setIsLogoutModalOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const openDriverModal = () => {
    // *** CHANGE START: Reset form with caaDriverId and percentage field ***
    setDriverForm({ caaDriverId: "", name: "", email: "", password: "", percentage: "" });
    // *** CHANGE END ***
    setShowPassword(false);
    setIsDriverModalOpen(true);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();

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

      // *** CHANGE START: Map driverForm to API expected format ***
      const apiPayload = {
        caaDriverId: driverForm.caaDriverId,
        name: driverForm.name,
        email: driverForm.email,
        password: driverForm.password,
        percentage: parseInt(driverForm.percentage, 10) // Convert to number
      };
      // *** CHANGE END ***

      const response = await fetch(`${Baseurl}/admin/driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload), // Use the mapped payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add driver. Status: ${response.status}`);
      }

      const data = await response.json();
      toast.success("Driver added successfully!");
      // Reset form
      setDriverForm({ caaDriverId: "", name: "", email: "", password: "", percentage: "" });
      setIsDriverModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // ... (Client logic remains same) ...
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please login again.");
        navigate("/login");
        return;
      }

      const hstPercent = parseFloat(clientForm.hstPercent);
      if (isNaN(hstPercent) || hstPercent < 0) {
        throw new Error("HST Percent must be a valid non-negative number.");
      }

      const servicesWithNumbers = clientForm.services.map((s) => {
        const baseRate = parseFloat(s.baseRate);
        if (isNaN(baseRate) || baseRate < 0) {
          throw new Error("Base Rate must be a valid non-negative number.");
        }

        const service = {
          name: s.name,
          type: s.type,
          baseRate,
          freeUnits: 0,
          unitQuantity: null,
        };

        if (s.type === "distance") {
          const freeUnits = parseInt(s.freeUnits);
          if (isNaN(freeUnits) || freeUnits < 0) {
            throw new Error("Free Units must be a valid non-negative number.");
          }
          service.freeUnits = freeUnits;
          service.unitType = "km";
        } else if (s.type === "time") {
          const unitQuantity = parseInt(s.unitQuantity);
          if (isNaN(unitQuantity) || unitQuantity < 0) {
            throw new Error("Unit Quantity must be a valid non-negative number.");
          }
          service.unitQuantity = unitQuantity;
          service.unitType = "unit";
        } else if (s.type === "fixed") {
          const freeUnits = parseInt(s.freeUnits) || 0;
          const unitQuantity = parseInt(s.unitQuantity) || null;
          service.freeUnits = freeUnits;
          service.unitQuantity = unitQuantity;
        }

        return service;
      });

      const payload = {
        name: clientForm.name,
        hstPercent,
        services: servicesWithNumbers,
      };

      const response = await fetch(`${Baseurl}/admin/createClient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to add client. Status: ${response.status}`);
      }

      toast.success("Client added successfully!");
      setClientForm({
        name: "",
        hstPercent: "13",
        services: [
          { name: "REMS:KMS ENROUTE", baseRate: "", freeUnits: "", isPredefined: true, type: "distance" },
          { name: "RPM:KMS UNDER TOW", baseRate: "", freeUnits: "", isPredefined: true, type: "distance" },
          { name: "PR1:WAITING TIME", baseRate: "", unitQuantity: "", isPredefined: true, type: "time" },
        ],
      });
      setIsClientModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...clientForm.services];
    newServices[index][field] = value;
    setClientForm({ ...clientForm, services: newServices });
  };

  const getServiceLabel = (service, index) => {
    if (service.isPredefined) {
      return service.name.split(":")[0];
    }
    return `Service ${index - 2}`;
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Top Bar */}
      <header className="bg-[#ffffff] dark:bg-[#080F25] p-4 flex items-center md:ml-[280px] sticky top-0 z-50">
        <button
          className="md:hidden text-2xl cursor-pointer text-gray-700 dark:text-gray-300"
          onClick={() => setIsOpen(true)}
        >
          <FaBars />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {location.pathname === "/admin/violationtable" ? (
            <button
              className="flex items-center robotomedium gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base"
              onClick={() => navigate("/admin/violationform")}
            >
              <FaPlus /> Parking Ticket
            </button>
          ) : (
            <>
              <button
                className="flex items-center gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base"
                onClick={openDriverModal}
              >
                <FaPlus /> Driver
              </button>
              <button
                className="flex items-center gap-2 bg-[#0078BD12] text-[#0078BD] px-3 py-2 rounded-[10px] hover:bg-gray-100 cursor-pointer text-sm sm:text-base dark:bg-[#0078BD]/20 dark:text-blue-300"
                onClick={() => setIsClientModalOpen(true)}
              >
                <FaPlus /> Client
              </button>
            </>
          )}

          <div className="hidden md:block">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Driver Modal */}
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
              
              {/* *** CHANGE START: CAA Driver ID Input Field Added *** */}
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
              {/* *** CHANGE END *** */}

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
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
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
                  className="px-4 py-2 bg-[#F6F7F8] cursor-pointer dark:bg-gray-700 rounded-[6px] border border-[#DADDE2] dark:border-gray-600 text-sm sm:text-base w-[50%] sm:w-auto dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] cursor-pointer rounded-[6px] text-white text-sm sm:text-base w-[50%] sm:w-auto"
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
        <div
          className="fixed inset-0 bg-[#00000067] z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsClientModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#101935] rounded-lg w-full max-w-[800px] max-h-[85vh] flex flex-col mx-auto shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 sticky top-0 bg-white dark:bg-[#101935] z-10">
              <h2 className="text-[16px] sm:text-xl cursor-pointer text-[#333333] robotomedium text-center sm:text-left dark:text-white">
                Add Client
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleClientSubmit}>
                <label className="block text-[14px] text-[#333333] sm:text-[16px] robotomedium mb-1 dark:text-gray-300">
                  Client Name
                </label>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientForm.name}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, name: e.target.value })
                  }
                  className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full mb-3 text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                  required
                />

                {clientForm.services.map((service, index) => (
                  <div key={index} className="mb-4 rounded-md p-3 sm:p-4 bg-gray-50 dark:bg-gray-800">
                    <label className="block text-[14px] text-[#333333] sm:text-[16px] robotomedium mb-2 dark:text-gray-300">
                      {getServiceLabel(service, index)}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Service Name"
                        value={service.name}
                        onChange={(e) =>
                          handleServiceChange(index, "name", e.target.value)
                        }
                        className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                        required
                        readOnly={service.isPredefined}
                      />

                      <input
                        type="number"
                        placeholder="Base Rate"
                        value={service.baseRate}
                        onChange={(e) =>
                          handleServiceChange(index, "baseRate", e.target.value)
                        }
                        className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                        required
                        step="0.01"
                        min="0"
                      />

                      {service.type === "distance" && (
                        <input
                          type="number"
                          placeholder="Free Units/Km"
                          value={service.freeUnits}
                          onChange={(e) =>
                            handleServiceChange(index, "freeUnits", e.target.value)
                          }
                          className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                          required
                          step="1"
                          min="0"
                        />
                      )}

                      {service.type === "time" && (
                        <input
                          type="number"
                          placeholder="Unit Quantity"
                          value={service.unitQuantity}
                          onChange={(e) =>
                            handleServiceChange(index, "unitQuantity", e.target.value)
                          }
                          className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                          required
                          step="1"
                          min="0"
                        />
                      )}

                      {service.type === "fixed" && (
                        <>
                          <input
                            type="number"
                            placeholder="Free Units"
                            value={service.freeUnits}
                            onChange={(e) =>
                              handleServiceChange(index, "freeUnits", e.target.value)
                            }
                            className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                            step="1"
                            min="0"
                          />
                          <input
                            type="number"
                            placeholder="Unit Quantity"
                            value={service.unitQuantity}
                            onChange={(e) =>
                              handleServiceChange(index, "unitQuantity", e.target.value)
                            }
                            className="p-2 border border-[#DADDE2] dark:border-gray-600 rounded-[4px] w-full text-sm sm:text-base dark:bg-gray-800 dark:text-white"
                            step="1"
                            min="0"
                          />
                        </>
                      )}
                    </div>

                    {!service.isPredefined && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="mt-3 text-red-500 cursor-pointer hover:text-red-700 text-sm sm:text-base"
                      >
                        Remove Service
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNewService}
                  className="flex items-center cursor-pointer justify-center sm:justify-start gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base mb-3 w-full sm:w-auto"
                >
                  <FaPlus /> Add Service
                </button>
              </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#DADDE2] dark:border-gray-600 sticky bottom-0 bg-white dark:bg-[#101935] z-10">
              <div className="flex flex-row justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 bg-[#F6F7F8] cursor-pointer dark:bg-gray-700 rounded-[6px] border border-[#DADDE2] dark:border-gray-600 text-sm sm:text-base w-[50%] sm:w-auto dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleClientSubmit}
                  className="px-4 py-2 bg-[#0078BD] cursor-pointer rounded-[6px] text-white text-sm sm:text-base w-[50%] sm:w-auto"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 bg-[#00000071] backdrop-blur-sm z-100 flex items-center justify-center p-4 sm:p-0"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#101935] p-4 sm:p-6 rounded-lg w-full max-w-[400px] sm:max-w-md mx-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left text-black dark:text-white">
              Confirm Logout
            </h2>
            <p className="mb-4 text-sm sm:text-base text-center sm:text-left text-gray-700 dark:text-gray-300">
              Are you sure you want to logout?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-[#0078BD] text-white rounded text-sm sm:text-base w-full sm:w-auto cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-[#F6F7F8] border-[#DADDE2] border rounded text-sm sm:text-base w-full sm:w-auto cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 md:w-[280px] bg-white dark:bg-[#101935] h-[100vh] p-4 border-r border-[#E6E6E6] dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] sm:text-[24px] italic font-semibold text-[#0078BD] dark:text-[#0078BD]">
            Earning Dashboard
          </h2>
          <div className="md:hidden">
            <DarkModeToggle />
          </div>
        </div>

        <nav className="flex flex-col h-[90vh]">
          <div className="flex-grow">
            <NavLink
              to="/admin/list"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer ${
                  isActive
                    ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                    : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                    : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                    : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <BiTaxi className="w-5 h-5" /> Drivers
            </NavLink>
            <NavLink
              to="/admin/calls-records"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                    : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <PhoneCall className="w-4 h-4" /> Calls records
            </NavLink>
            <NavLink
              to="/admin/callslist"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                    : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <PhoneCall className="w-4 h-4" /> Calls List
            </NavLink>
          </div>
          <div className="mt-auto fixed bottom-10">
            <button
              className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left cursor-pointer"
              onClick={handleLogoutClick}
            >
              <FaSignOutAlt className="w-5 h-5" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 z-40 md:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <main className="p-4 sm:p-6 flex-1 dark:bg-[#080F25]">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;