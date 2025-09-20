import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaWpforms, FaSignOutAlt, FaPlus } from "react-icons/fa";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({ email: "", password: "" });
  const [clientForm, setClientForm] = useState({ name: "", services: "" });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
    setIsOpen(false);
  };

  const handleDriverSubmit = (e) => {
    e.preventDefault();
    console.log("Driver Form Submitted:", driverForm);
    setDriverForm({ email: "", password: "" });
    setIsDriverModalOpen(false);
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    console.log("Client Form Submitted:", clientForm);
    setClientForm({ name: "", services: "" });
    setIsClientModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Bar */}
      <header className="bg-[#0078BD] text-white p-4 flex justify-between items-center md:ml-[280px]">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-white text-[#0078BD] px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => setIsDriverModalOpen(true)}
          >
            <FaPlus /> +Driver
          </button>
          <button
            className="flex items-center gap-2 bg-white text-[#0078BD] px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => setIsClientModalOpen(true)}
          >
            <FaPlus /> +Client
          </button>
        </div>
      </header>

      {/* Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Driver</h2>
            <form onSubmit={handleDriverSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-[#0078BD]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={driverForm.password}
                  onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-[#0078BD]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setIsDriverModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] text-white rounded hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Client</h2>
            <form onSubmit={handleClientSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-[#0078BD]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Services</label>
                <input
                  type="text"
                  value={clientForm.services}
                  onChange={(e) => setClientForm({ ...clientForm, services: e.target.value })}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-[#0078BD]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setIsClientModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] text-white rounded hover:bg-blue-700"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 md:w-[280px] bg-white h-[100vh] text-black p-4 z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-[16px] font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-3 flex-1">
          <NavLink
            to="/admin/list"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white"
                  : "text-black hover:bg-gray-100"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaWpforms className="w-5 h-5" /> Overview
          </NavLink>

          <button
            className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black hover:bg-gray-100 w-full text-left"
            onClick={() => setIsOpen(false)}
          >
            <FaWpforms className="w-5 h-5" /> Report
          </button>

          <div className="mt-auto">
            <button
              className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black hover:bg-gray-100 w-full text-left"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-5 h-5" /> Logout
            </button>
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
      <div className="flex-1 flex flex-col md:ml-[280px] mt-16">
        {/* Main Content */}
        <main className="p-6 flex-1 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;