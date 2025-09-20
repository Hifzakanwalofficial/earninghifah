import React from "react";

const ClientsTable = () => {
  const clients = [
    {
      name: "Eleanor Pena",
      services: ["Seo", "UI/UX Design", "Web Development", "Consulting"],
    },
    {
      name: "Eleanor Pena",
      services: ["Seo", "UI/UX Design", "Web Development", "Consulting"],
    },
    {
      name: "Eleanor Pena",
      services: ["Seo", "UI/UX Design", "Web Development", "Consulting"],
    },
    {
      name: "Eleanor Pena",
      services: ["Seo", "UI/UX Design", "Web Development", "Consulting"],
    },
    {
      name: "Eleanor Pena",
      services: ["Seo", "UI/UX Design", "Web Development", "Consulting"],
    },
  ];

  const serviceColors = {
    Seo: "bg-orange-100 text-orange-500",
    "UI/UX Design": "bg-red-100 text-red-500",
    "Web Development": "bg-blue-100 text-blue-500",
    Consulting: "bg-green-100 text-green-500",
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">List of Clients</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-700 font-medium">Clients Name</th>
              <th className="px-6 py-3 text-gray-700 font-medium">Services</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-6 py-4 text-gray-800">{client.name}</td>
                <td className="px-6 py-4 flex gap-2 flex-wrap">
                  {client.services.map((service, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${serviceColors[service]}`}
                    >
                      {service}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
