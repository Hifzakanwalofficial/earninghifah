import React, { useEffect, useState } from "react";

const Clientlist = () => {
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
              ? client.services.map(s => s.name)
              : ["No Service"],
          }));
          setClients(formatted);
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
      <div className="animate-pulse">
        <div className="grid grid-cols-[200px_1fr] bg-[#FAFAFC] px-[14px] py-[11px] items-center gap-x-[20px]">
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[200px_1fr] bg-white px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] gap-x-[20px]"
          >
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-4 text-red-500">{error}</p>;
  }

  return (
    <div>
      {/* Table Header */}
      <div className="grid grid-cols-[200px_1fr] bg-[#FAFAFC] px-[14px] py-[11px] items-center gap-x-[20px]">
        <p className="robotosemibold text-[18px] text-[#333333CC] whitespace-nowrap">
          Clients Name
        </p>
        <p className="robotosemibold text-[18px] text-[#333333CC] whitespace-nowrap">
          Services
        </p>
      </div>

      {/* Table Rows */}
      {clients.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <p className="text-gray-500 text-[16px]">No Client List Available</p>
        </div>
      ) : (
        clients.map((client, index) => (
          <div
            key={index}
            className="grid grid-cols-[200px_1fr] bg-white px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] gap-x-[20px]"
          >
            <p className="text-[15px] text-[#333333] whitespace-nowrap">
              {client.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {client.services.map((service, serviceIndex) => (
                <span
                  key={serviceIndex}
                  className="text-[15px] text-[#555555] bg-white border border-[#DADDE2] rounded-full px-3 py-1"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Clientlist;
