import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"; // 👈 Added useLocation
import { Baseurl } from "../Config";
import { TbTicket } from "react-icons/tb";
import {
  FaWpforms,
  FaSignOutAlt,
  FaPlus,
  FaBars,
  FaEye,
  FaEyeSlash,
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

  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
  const location = useLocation(); // 👈 Get current route

  // Prevent page scrolling when modal is open
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

  // Add new service
  const addNewService = () => {
    setClientForm({
      ...clientForm,
      services: [...clientForm.services, { name: "", baseRate: "", freeUnits: "", unitQuantity: "", isPredefined: false, type: "fixed" }],
    });
  };

  // Remove service
  const removeService = (index) => {
    const newServices = clientForm.services.filter((_, i) => i !== index);
    setClientForm({ ...clientForm, services: newServices });
  };

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

      const response = await fetch(`${Baseurl}/admin/driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driverForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add driver. Status: ${response.status}`);
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

  // Function to get label for predefined services
  const getServiceLabel = (service, index) => {
    if (service.isPredefined) {
      return service.name.split(":")[0]; // Extract prefix (REMS, RPM, PR1)
    }
    return `Service ${index - 2}`;
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
          {location.pathname === "/admin/violationtable" ? (
            <button
              className="flex items-center robotomedium mt-7 gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base"
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
                className="flex items-center gap-2 bg-[#0078BD12] text-[#0078BD] px-3 py-2 rounded-[10px] hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                onClick={() => setIsClientModalOpen(true)}
              >
                <FaPlus /> Client
              </button>
            </>
          )}
        </div>
      </header>

      {/* Driver Modal */}
      {isDriverModalOpen && (
        <div
          className="fixed inset-0 bg-[#00000071] z-50 flex items-center justify-center p-4 sm:p-0"
          onClick={() => setIsDriverModalOpen(false)}
        >
          <div
            className="bg-white p-5 sm:p-6 rounded-lg w-full max-w-md mx-auto shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] sm:text-xl text-[#333333] robotomedium mb-4 text-center sm:text-left">
              Add Driver
            </h2>

            <form onSubmit={handleDriverSubmit} className="space-y-3">
              {/* Name Input */}
              <input
                type="text"
                placeholder="Name"
                value={driverForm.name}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, name: e.target.value })
                }
                className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                  className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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

              {/* Buttons */}
              <div className="flex flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 bg-[#F6F7F8] rounded-[6px] border border-[#DADDE2] text-sm sm:text-base w-[50%] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] rounded-[6px] text-white  text-sm sm:text-base w-[50%] sm:w-auto"
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
            className="bg-white rounded-lg w-full max-w-[800px] max-h-[85vh] flex flex-col mx-auto shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6  sticky top-0 bg-white z-10">
              <h2 className="text-[16px] sm:text-xl text-[#333333] robotomedium text-center sm:text-left">
                Add Client
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleClientSubmit}>
                <label
                  className="block text-[14px] text-[#333333] sm:text-[16px] robotomedium mb-1"
                >
                  Client Name
                </label>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientForm.name}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, name: e.target.value })
                  }
                  className="p-2 border border-[#DADDE2] rounded-[4px]  w-full mb-3 text-sm sm:text-base"
                  required
                />

                {clientForm.services.map((service, index) => (
                  <div key={index} className="mb-4  rounded-md p-3 sm:p-4">
                    <label
                      className="block  text-[14px] text-[#333333] sm:text-[16px] robotomedium mb-2"
                    >
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
                        className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                        className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                          className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                          className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                            className="p-2 border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                            className="p-2  border border-[#DADDE2] rounded-[4px] w-full text-sm sm:text-base"
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
                        className="mt-3 text-red-500 hover:text-red-700 text-sm sm:text-base"
                      >
                        Remove Service
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNewService}
                  className="flex items-center justify-center sm:justify-start gap-2 bg-[#0078BD] text-white px-3 py-2 rounded-[10px] cursor-pointer text-sm sm:text-base mb-3 w-full sm:w-auto"
                >
                  <FaPlus /> Add Service
                </button>
              </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#DADDE2] sticky bottom-0 bg-white z-10">
              <div className="flex flex-row justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 bg-[#F6F7F8] rounded-[6px] border border-[#DADDE2] text-sm sm:text-base w-[50%] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleClientSubmit}
                  className="px-4 py-2 bg-[#0078BD] rounded-[6px] text-white  text-sm sm:text-base w-[50%] sm:w-auto"
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
            className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[400px] sm:max-w-md mx-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left">
              Confirm Logout
            </h2>
            <p className="mb-4 text-sm sm:text-base text-center sm:text-left">
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
                className="px-4 py-2 bg-[#F6F7F8] border-[#DADDE2] border rounded text-sm sm:text-base w-full sm:w-auto cursor-pointer"
              >
                Cancel
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
        <h2 className=" text-[18px] sm:text-[24px] ms-5 italic font-semibold text-[#0078BD] mb-6">
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
            <NavLink
              to="/admin/calls-records"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <PhoneCall className="w-4 h-4" /> Calls records
            </NavLink>
            {/* <NavLink
              to="/admin/violationtable"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <TbTicket className="w-4 h-4" /> Parking Tickets
            </NavLink> */}
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 z-40 md:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;