import React, { useEffect, useState } from "react";
import { Baseurl } from "../Config";

const ViolationTable = () => {
  const [violations, setViolations] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${Baseurl}/admin/tickets?status=unpaid`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.tickets) {
          setViolations(data.tickets);
        } else {
          console.error("Error fetching tickets:", data.message);
        }
      } catch (error) {
        console.error("Error fetching violations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, [token]);

  const filteredViolations = violations.filter((item) => {
    if (filter === "All") return true;
    return item.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="mx-auto bg-white mt-10 p-6">
      <p className="robotosemibold text-[24px] mb-[24px]">Violation Forms</p>

      {/* Filter Dropdown */}
      <select
        className="mb-[24px] border border-[#616161c5] p-1 rounded-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Paid">Paid</option>
        <option value="Unpaid">Unpaid</option>
      </select>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <table className="w-full border-collapse text-sm text-gray-700 animate-pulse">
            <thead>
              <tr className="text-left text-gray-500 border-b border-[#FAFAFC] bg-[#FAFAFC]">
                {[
                  "Driver",
                  "Violation ID",
                  "Truck Plate",
                  "Admin Fee",
                  "Address",
                  "Amount",
                  "Date",
                  "Status",
                ].map((head, i) => (
                  <th
                    key={i}
                    className="py-3 px-4 robotosemibold text-[16px] text-[black]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array(8)
                    .fill("")
                    .map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text-sm text-gray-700">
            <thead>
              <tr className="text-left text-gray-500 border-b border-[#FAFAFC] bg-[#FAFAFC]">
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Driver
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Violation ID
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Truck Plate
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Admin Fee
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Address
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Amount
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Date
                </th>
                <th className="py-3 px-4 robotosemibold text-[16px] text-[black]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 font-medium"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredViolations.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium robotosemibold text-[#333333]">
                      {item.driverId?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333]">
                      {item.violationNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333]">
                      {item.plateNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333]">
                      {item.administrationFee > 0
                        ? `$${item.administrationFee}`
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333]">
                      {item.address || "N/A"}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333] font-medium">
                      ${item.amount || 0}
                    </td>
                    <td className="py-3 px-4 robotosemibold text-[#333333]">
                      {new Date(item.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td
                      className={`py-3 px-4 robotosemibold font-semibold ${
                        item.status === "paid"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViolationTable;
