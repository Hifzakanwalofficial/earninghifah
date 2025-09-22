import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No token found. Please log in first.");
      setLoading(false);
      return;
    }

    fetch("https://expensemanager-production-4513.up.railway.app/api/common/getAllClients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const formatted = data.data.map((client) => ({
            name: client.name,
            services: client.services.length > 0 
              ? client.services.map((s) => s.name)
              : ["No Service"],
          }));
          setClients(formatted.slice(0, 5)); // Limit to 5 clients for table
        } else {
          setError(data.message || "Failed to fetch clients.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching clients:", err);
        setError("Error fetching clients.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="border border-[#F7F7F7] p-4 animate-pulse">
        <div className="flex justify-between items-center px-4 py-2 bg-white">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-[23%]">
                  <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                </th>
                <th className="px-6 py-3 w-[77%]">
                  <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  <td className="px-6 py-4 bg-white w-[20%]">
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 bg-white w-[80%]">
                    <div className="flex gap-2 flex-wrap">
                      {[...Array(5)].map((_, sIdx) => (
                        <div key={sIdx} className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#F7F7F7] p-4">
        <p className="text-center py-4 text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="border border-[#F7F7F7] p-4">
      <div className="flex justify-between items-center px-4 py-2 bg-white">
        <h2 className="robotomedium text-[20px]">List of Clients</h2>
       <Link
  to="/admin/clientlist"
  className="text-[14px] text-[#0078BD] hover:text-blue-700 robotomedium cursor-pointer"
>
  View All
</Link>

      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-[#333333CC] robotomedium w-[23%] text-left">
                Clients Name
              </th>
              <th className="px-6 py-3 text-[#333333CC] robotomedium w-[77%] text-left">
                Services
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-6 text-gray-500">
                  No Clients Found
                </td>
              </tr>
            ) : (
              clients.map((client, idx) => (
                <tr key={idx} className="border-b border-[#E6E6E6]">
                  <td className="px-6 py-4 text-gray-800 robotomedium text-[14px] text-left bg-white w-[20%] whitespace-nowrap">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-gray-800 robotomedium text-[14px] text-left bg-white w-[80%]">
                    <div className="flex gap-2 flex-wrap">
                      {client.services.map((service, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[13px] text-[#555555] bg-white border border-[#DADDE2] rounded-full px-2.5 py-0.5 whitespace-nowrap"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
