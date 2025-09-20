import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ClientsTable from '../Pages/Component/ClientsTable';
import { useNavigate } from 'react-router-dom';

const List = () => {
  const stats = [
    { title: 'Total Call', value: '1,245', icon: '📞' },
    { title: 'Total Reqs', value: '970', icon: '💰' },
    { title: 'Total RPM', value: '2.5M', icon: '🔄' },
    { title: 'Total PRRI', value: '450', icon: 'ℹ️' },
  ];

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
    navigate('/admin/drivers');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm text-gray-600">{stat.title}</h3>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
            <span className="text-2xl">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="flex flex-wrap gap-4">
        {/* Drivers Table */}
        <div className="flex-1 min-w-[300px] bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600">List of Drivers</h2>
            <button
              onClick={handleViewAllDrivers}
              className="text-sm text-[#0078BD] hover:text-blue-700 font-medium"
            >
              View All Drivers
            </button>
          </div>
          {loading ? (
            <p className="p-4 text-center text-gray-500">Loading drivers...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-700 w-[30%] text-left">Name</th>
                    <th className="p-3 text-sm font-semibold text-gray-700 w-[60%] text-left">Email</th>
                    <th className="p-3 text-sm font-semibold text-gray-700 w-[10%] text-left">Password</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver, index) => (
                    <tr key={driver._id || index} className="border-b border-gray-200">
                      <td className="p-3 text-sm text-gray-900 w-[30%] text-left bg-white">{driver.name}</td>
                      <td className="p-3 text-sm text-blue-600 w-[60%] text-left bg-white">{driver.email}</td>
                      <td className="p-3 text-sm w-[10%] text-left bg-white">
                        <div className="flex items-center">
                          <span
                            className={`w-32 truncate ${
                              passwordVisible[driver._id] ? 'text-gray-900' : 'text-gray-500'
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
                              <FaEyeSlash className="w-4 h-4" />
                            ) : (
                              <FaEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {drivers.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-3 text-center text-gray-500 bg-white">
                        No drivers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="flex-1 min-w-[300px] bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">Clients</div>
          <div className="overflow-x-auto">
            <ClientsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;