import React, { useState } from 'react';

const List = () => {
  const users = [
    { name: 'Guy Hawkins', email: 'guy.jennings@example.com', password: '********' },
    { name: 'Therese Webb', email: 'nathan.roberts@example.com', password: '********' },
    { name: 'Marvin McKinney', email: 'kenzie.lawson@example.com', password: '********' },
    { name: 'Savannah Nguyen', email: 'sara.cruz@example.com', password: '********' },
    { name: 'Kathryn Murphy', email: 'alma.lawson@example.com', password: '********' },
    { name: 'Ralph Edwards', email: 'bill.anders@example.com', password: '********' },
    { name: 'Eleanor Pena', email: 'felicia.reid@example.com', password: '********' },
    { name: 'Ronald Richards', email: 'jessica.hanson@example.com', password: '********' },
    { name: 'Darnell Steward', email: 'michelle.holt@example.com', password: '********' },
    { name: 'Dianne Russell', email: 'naveen.simmons@example.com', password: '********' },
    { name: 'Kristin Watson', email: 'willie.jennings@example.com', password: '********' },
  ];

  const stats = [
    { title: 'Total Call', value: '1,245', icon: '📞' },
    { title: 'Total Reqs', value: '970', icon: '💰' },
    { title: 'Total RPM', value: '2.5M', icon: '🔄' },
    { title: 'Total PRRI', value: '450', icon: 'ℹ️' },
  ];

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'driver123',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsPopupOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Driver Overview</h2>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-[#0078BD] text-white px-4 py-2 rounded-md hover:bg-[#005f94] transition-colors"
        >
          Add Driver
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600">{stat.title}</h3>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
            <span className="text-2xl">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Password</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 text-sm text-gray-900">{user.name}</td>
                <td className="p-3 text-sm text-blue-600">{user.email}</td>
                <td className="p-3 text-sm text-gray-500">{user.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Driver</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078BD] text-white rounded-md hover:bg-[#005f94]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;