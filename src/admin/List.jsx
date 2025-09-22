import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ClientsTable from '../Pages/Component/ClientsTable';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';

const List = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState({});
  const navigate = useNavigate();

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        'https://expensemanager-production-4513.up.railway.app/api/admin/drivers?page=1&limit=10',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data.drivers || []);
      setTotalDrivers(data.totalDrivers || 0);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.message || 'Failed to fetch drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDriverPassword = (driverId) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  const handleViewAllDrivers = () => {
    navigate('/admin/alldrivers');
  };

  return (
    <div className="min-h-screen bg-[#ffffff] ">
      <p className="text-[24px] robotosemibold pt-[30px] pb-[20px]">Dashboard Overview</p>
      <StatsCards />
      {/* Tables Section */}
      <div className="flex flex-wrap gap-4 w-[100%] mx-auto ">
        {/* Drivers Table */}
        <div className="flex-1 min-w-[300px] bg-white rounded-lg overflow-hidden p-4 border border-[#F7F7F7]">
          <div className="flex justify-between items-center px-4 py-2 bg-white ">
            <h2 className=" robotomedium text-[20px]">List of Drivers</h2>
            <button
  onClick={handleViewAllDrivers}
  className="text-[14px] text-[#0078BD] hover:text-blue-700 robotomedium cursor-pointer"
>
  View All
</button>

          </div>
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              </div>
            </div>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-[#333333CC] robotomedium w-[30%] text-left sm:w-[33.33%]">Name</th>
                      <th className="px-6 py-3 text-[#333333CC] robotomedium w-[60%] text-left sm:w-[33.33%]">Email</th>
                      <th className="px-6 py-3 text-[#333333CC] robotomedium w-[10%] text-left sm:w-[20%]">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500 bg-white">
                          No drivers found.
                        </td>
                      </tr>
                    ) : (
                      drivers.slice(0, 5).map((driver, index) => (
                        <tr key={driver._id || index} className="border-b border-[#E6E6E6]">
                          <td className="px-6 py-4 text-gray-800 robotomediun w-[30%] text-[14px] text-left bg-white sm:w-[33.33%]">{driver.name}</td>
                          <td className="px-6 py-4 text-[#0078BD] robotomediun w-[60%] text-[14px] text-left bg-white sm:w-[33.33%]">{driver.email}</td>
                          <td className="px-6 py-4 text-gray-800 robotomediun w-[10%] text-[14px] text-left bg-white sm:w-[20%]">
                            <div className="flex items-center gap-0">
                              <span
                                className={`${
                                  passwordVisible[driver._id] ? 'text-gray-800' : 'text-gray-500'
                                }`}
                              >
                                {passwordVisible[driver._id] ? driver.password : '********'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleDriverPassword(driver._id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={passwordVisible[driver._id] ? 'Hide Password' : 'Show Password'}
                              >
                                {passwordVisible[driver._id] ? (
                                  <FaEye className="w-4 h-4" />
                                ) : (
                                  <FaEyeSlash className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="flex-1 min-w-[300px] bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <ClientsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;