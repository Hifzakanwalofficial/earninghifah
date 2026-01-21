import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaWpforms, FaSignOutAlt, FaBars, FaSun, FaMoon } from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdWifiCalling2 } from "react-icons/md";
import logo from '../images/logo.svg'
import { Baseurl } from '../Config';           // ← added this import (same as Login)

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const navigate = useNavigate();

  // Token expiry check (unchanged)
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

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // ── Updated logout with API call ──
  const handleLogoutConfirm = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        const response = await fetch(`${Baseurl}/driver/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,     // most common pattern
            // "x-auth-token": token,             // use this instead if your backend expects custom header
          },
        });

        // You can still read response if backend returns something useful
        // const data = await response.json();  // optional

        if (!response.ok) {
          console.warn("Logout API failed, still clearing token locally");
        }
      }
    } catch (err) {
      console.error("Logout API error:", err);
      // → still proceed with local logout even if API fails
    } finally {
      // Always clear token and redirect
      localStorage.removeItem("authToken");
      setIsOpen(false);
      setIsLogoutModalOpen(false);
      navigate("/login");
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const DarkModeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        darkMode ? "bg-gray-600" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        className={`absolute top-0.5 left-0.5 inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-800 shadow transform transition-transform duration-300 ease-in-out ${
          darkMode ? "translate-x-6" : "translate-x-0"
        }`}
      />
      <span className="absolute left-1.5 flex items-center">
        <FaSun
          className={`h-3 w-3 text-yellow-400 transition-opacity duration-200 ${
            darkMode ? "opacity-0" : "opacity-100"
          }`}
        />
      </span>
      <span className="absolute right-1.5 flex items-center">
        <FaMoon
          className={`h-3 w-3 text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
            darkMode ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white dark:bg-[#080F25] border-b border-gray-200 dark:border-[#263463] p-4 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <button
              className="text-2xl cursor-pointer text-gray-700 dark:text-gray-300 md:hidden flex-shrink-0"
              onClick={() => setIsOpen(true)}
            >
              <FaBars />
            </button>
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Earning Dashboard" className="h-8 w-auto" />
              <h2 className="text-[18px] md:text-[24px] italic font-semibold text-[#0078BD] dark:text-[#0078BD]">
                Earning Dashboard
              </h2>
            </div>
          </div>

          <div className="flex items-center ml-auto">
            <div className="md:hidden w-8 flex-shrink-0"></div>
            <div className="hidden md:flex items-center flex-shrink-0">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 pt-0 w-[80vw] max-w-[280px] md:w-[280px] bg-white dark:bg-[#101935] h-screen text-black dark:text-[#0078BD] p-4 z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center pt-6 justify-between mb-6 ">
          <h2 className="text-[18px] md:text-[24px] italic font-semibold text-[#0078BD] dark:text-[#0078BD]">
            Earning Dashboard
          </h2>
          <div className="md:hidden">
            <DarkModeToggle />
          </div>
        </div>

        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto pb-16 md:pb-0">
          <NavLink
            to="/driver/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium ${
                isActive
                  ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                  : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                  : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                  : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  ? "bg-[#0078BD] text-white dark:bg-[#0078BD]/50 dark:text-[#15AAFF]"
                  : "text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <MdWifiCalling2 className="w-5 h-5 flex-shrink-0" /> Call Records
          </NavLink>
        </nav>

        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 text-[14px] px-6 py-2 rounded font-medium text-black dark:text-[#4C587F] hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left cursor-pointer"
          >
            <FaSignOutAlt className="w-5 h-5 flex-shrink-0" /> Logout
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-[#00000071]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101935] rounded-lg w-full max-w-md max-h-full overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Confirm Logout</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-[#0078BD] dark:bg-[#0078BD] text-white rounded cursor-pointer hover:bg-[#005a8f]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00000071]/20 backdrop-blur-sm bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col md:ml-[280px] overflow-hidden">
        <main className="flex-1 bg-white dark:bg-[#080F25] pt-10 md:pt-12 overflow-y-auto overflow-x-hidden">
          <div className="w-full h-full overflow-x-auto pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;