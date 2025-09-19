import React from "react";
import Linechart from "./Component/Linechart";

const Overview = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Topbar */}
      <div className="bg-white shadow-md p-4 rounded-lg mb-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Overview</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Action
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-sm text-gray-500">Users</h2>
          <p className="text-2xl font-bold mt-2">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-sm text-gray-500">Orders</h2>
          <p className="text-2xl font-bold mt-2">320</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-sm text-gray-500">Revenue</h2>
          <p className="text-2xl font-bold mt-2">$12,400</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-sm text-gray-500">Pending</h2>
          <p className="text-2xl font-bold mt-2">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-sm text-gray-500">Conversions</h2>
          <p className="text-2xl font-bold mt-2">78%</p>
        </div>
      </div>

      {/* Charts / Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-[100%]">
        <Linechart/>
      </div>
    </div>
  );
};

export default Overview;