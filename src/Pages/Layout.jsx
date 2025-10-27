import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaWpforms, FaSignOutAlt, FaBars } from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdWifiCalling2 } from "react-icons/md";
import logo from '../images/logo.svg'

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // Show logout confirmation modal
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // Confirm logout
  const handleLogoutConfirm = () => {
    localStorage.removeItem('authToken');
    setIsOpen(false);
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  // Cancel logout
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Top Bar for mobile screens */}
      <header className="bg-white border-b border-gray-200 p-4 fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="flex justify-between items-center max-w-full">
          <button
            className="text-2xl cursor-pointer text-gray-700 flex-shrink-0"
            onClick={() => setIsOpen(true)}
          >
            <FaBars />
          </button>
          <div className="w-8 flex-shrink-0"></div> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-[80vw] max-w-[280px] md:w-[280px] bg-white h-screen text-black p-4 z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-[18px] md:text-[24px] ms-5 italic font-semibold text-[#0078BD] mb-6">
          Earning Dashboard
        </h2>

        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
          <NavLink
            to="/driver/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <MdOutlineDashboardCustomize className="w-5 h-5 flex-shrink-0" /> Dashboard
          </NavLink>

          <NavLink
            to="/driver/overview"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <RiMoneyDollarCircleLine className="w-5 h-5 flex-shrink-0" /> Earnings
          </NavLink>

          <NavLink
            to="/driver/form"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaWpforms className="w-5 h-5 flex-shrink-0" /> Forms
          </NavLink>
          <NavLink
            to="/driver/callrecord"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <MdWifiCalling2 className="w-5 h-5 flex-shrink-0" /> Call Records
          </NavLink>

          <div className="mt-auto">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black hover:bg-gray-100 w-full text-left cursor-pointer"
            >
              <FaSignOutAlt className="w-5 h-5 flex-shrink-0" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-[#00000071]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-full overflow-y-auto">
            <div className="p-6">
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
        </div>
      )}
      

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00000071]/20 backdrop-blur-sm bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 bg-[#ffffff] pt-16 md:pt-0 overflow-y-auto overflow-x-hidden">
          <div className="w-full h-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;