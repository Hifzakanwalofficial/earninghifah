import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaWpforms,
  FaFileAlt,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { VscBell } from "react-icons/vsc";
import { LiaUserCircleSolid } from "react-icons/lia";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 md:w-[280px] bg-white h-[100vh] text-black p-4 z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-[16px] font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-3 flex-1">
          <NavLink
            to="/admindashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <MdOutlineDashboardCustomize className="w-5 h-5" /> Dashboard
          </NavLink>

          <NavLink
            to="/overview"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaWpforms className="w-5 h-5" /> Trip Inspection
          </NavLink>

          <NavLink
            to="/form"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaWpforms className="w-5 h-5" /> Forms
          </NavLink>

          <NavLink
            to="/truckdocuments"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaFileAlt className="w-5 h-5" /> Truck Documents
          </NavLink>

          <div className="mt-auto">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <FaCog className="w-5 h-5" /> Settings
            </NavLink>

            <NavLink
              to="/logout"
              className={({ isActive }) =>
                `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                  isActive
                    ? "bg-[#0078BD] text-white"
                    : "text-black hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <FaSignOutAlt className="w-5 h-5" /> Logout
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px]">
        {/* Main Content */}
        <main className="p-6 flex-1 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;