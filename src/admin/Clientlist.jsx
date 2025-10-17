import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Baseurl } from "../Config";

const Clientlist = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientName, setClientName] = useState('');
  const [services, setServices] = useState([{ name: '', type: 'fixed', baseRate: 0, hst: 0, total: 0, freeUnits: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No token found. Please log in first.");
      setLoading(false);
      return;
    }

    fetch(`${Baseurl}/common/getAllClients`, {
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
            _id: client._id,
            name: client.name,
            services: client.services.length > 0 
              ? client.services.map(s => s.name)
              : ["No Service"],
            fullServices: client.services.map(s => ({
              name: s.name,
              type: s.type,
              baseRate: s.baseRate,
              hst: s.hst,
              total: s.total,
              freeUnits: s.freeUnits || 0,
              unitType: s.unitType || null,
              unitQuantity: s.unitQuantity || null,
              _id: s._id
            })),
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

  const openModal = (client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setServices(client.fullServices.length > 0 
      ? client.fullServices.map(s => ({
          name: s.name,
          type: s.type,
          baseRate: s.baseRate || 0,
          hst: s.hst || 0,
          total: s.total || 0,
          freeUnits: s.freeUnits || 0,
          unitType: s.unitType || null,
          unitQuantity: s.unitQuantity || null
        }))
      : [{ name: '', type: 'fixed', baseRate: 0, hst: 0, total: 0, freeUnits: 0, unitType: null, unitQuantity: null }]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setClientName('');
    setServices([{ name: '', type: 'fixed', baseRate: 0, hst: 0, total: 0, freeUnits: 0 }]);
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === 'baseRate' || field === 'hst') {
      const base = parseFloat(updatedServices[index].baseRate) || 0;
      const hst = parseFloat(updatedServices[index].hst) || 0;
      updatedServices[index].total = base + hst;
    }

    setServices(updatedServices);
  };

  const addService = () => {
    setServices([...services, { name: '', type: 'fixed', baseRate: 0, hst: 0, total: 0, freeUnits: 0 }]);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleUpdateClient = async () => {
    if (!clientName || services.some(s => !s.name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate freeUnits
    if (services.some(s => parseFloat(s.freeUnits) < 0 || isNaN(parseFloat(s.freeUnits)))) {
      toast.error('Free Units must be a non-negative number');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    const body = {
      name: clientName,
      services: services.map(s => ({
        name: s.name,
        type: s.type,
        baseRate: parseFloat(s.baseRate) || 0,
        hst: parseFloat(s.hst) || 0,
        total: parseFloat(s.total) || 0,
        freeUnits: parseFloat(s.freeUnits) || 0,
        unitType: s.unitType || null,
        unitQuantity: s.unitQuantity ? parseFloat(s.unitQuantity) : null
      })),
    };

    try {
      const res = await fetch(`${Baseurl}/admin/updateClient/${selectedClient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Client updated successfully!');
        setClients(clients.map(client => 
          client._id === selectedClient._id 
            ? { 
                ...client, 
                name: clientName, 
                services: services.map(s => s.name), 
                fullServices: services.map(s => ({
                  name: s.name,
                  type: s.type,
                  baseRate: parseFloat(s.baseRate) || 0,
                  hst: parseFloat(s.hst) || 0,
                  total: parseFloat(s.total) || 0,
                  freeUnits: parseFloat(s.freeUnits) || 0,
                  unitType: s.unitType || null,
                  unitQuantity: s.unitQuantity ? parseFloat(s.unitQuantity) : null
                }))
              }
            : client
        ));
        closeModal();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Error updating client');
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkbox handling
  const handleSelectClient = (id) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleCancelSelection = () => {
    setSelectedClients([]);
    setSelectAll(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${Baseurl}/admin/deleteClients`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientIds: selectedClients }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete clients");
      }

      setClients((prev) => prev.filter((c) => !selectedClients.includes(c._id)));
      setSelectedClients([]);
      setSelectAll(false);
      setShowDeleteModal(false);
      toast.success('Client(s) deleted successfully!');
    } catch (err) {
      console.error('Error deleting clients:', err);
      toast.error('Error deleting clients. Please try again.');
    }
    setDeleteLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-[30px_200px_1fr_100px] bg-[#FAFAFC] px-[14px] py-[11px] items-center gap-x-[20px]">
          <div className="h-4 w-[20px] bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[30px_200px_1fr_100px] bg-white px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] gap-x-[20px]"
          >
            <div className="h-4 w-[20px] bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-4 text-red-500">{error}</p>;
  }

  return (
    <>
      {/* Action Buttons (Delete/Cancel) */}
      {selectedClients.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 border-b justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={handleCancelSelection}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      <div>
        {/* Table Header */}
        <div className="grid grid-cols-[30px_200px_1fr_100px] bg-[#FAFAFC] px-[14px] py-[11px] items-center gap-x-[20px]">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </div>
          <p className="robotosemibold text-[18px] text-[#333333CC] whitespace-nowrap">
            Clients Name
          </p>
          <p className="robotosemibold text-[18px] text-[#333333CC] whitespace-nowrap">
            Services
          </p>
          <p className="robotosemibold text-[18px] text-[#333333CC] whitespace-nowrap">
            Actions
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
              className="grid grid-cols-[30px_200px_1fr_100px] bg-white px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] gap-x-[20px]"
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client._id)}
                  onChange={() => handleSelectClient(client._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
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
              <button
                onClick={() => openModal(client)}
                className="text-[14px] text-[#0078BD] robotosemibold hover:text-[#005BB5] cursor-pointer"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000088] bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedClients.length}</span>{" "}
              client(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0000009f] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[8px] p-6 w-[90%] max-w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-[#1E293B] text-[20px] font-semibold mb-4">Update Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#1E293B] text-[14px] mb-2 roboto-medium">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[#1E293B] text-[14px] mb-2 roboto-medium">
                  Services
                </label>
                {services.map((service, index) => (
                  <div key={index} className="mb-4 border border-[#E2E8F0] p-3 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          placeholder="Enter service name"
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">Type</label>
                        <select
                          value={service.type}
                          onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        >
                          <option value="fixed">Fixed</option>
                          <option value="distance">Distance</option>
                          <option value="time">Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">Base Rate</label>
                        <input
                          type="number"
                          value={service.baseRate}
                          onChange={(e) => handleServiceChange(index, 'baseRate', e.target.value)}
                          placeholder="Enter base rate"
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">HST</label>
                        <input
                          type="number"
                          value={service.hst}
                          onChange={(e) => handleServiceChange(index, 'hst', e.target.value)}
                          placeholder="Enter HST"
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">Total</label>
                        <input
                          type="number"
                          value={service.total}
                          readOnly
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[#1E293B] text-[12px] mb-1">Free Units</label>
                        <input
                          type="number"
                          value={service.freeUnits}
                          onChange={(e) => handleServiceChange(index, 'freeUnits', e.target.value)}
                          placeholder="Enter free units"
                          className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      {service.name.startsWith('PR1') && (
                        <>
                          <div>
                            <label className="block text-[#1E293B] text-[12px] mb-1">Unit Type</label>
                            <input
                              type="text"
                              value={service.unitType || ''}
                              onChange={(e) => handleServiceChange(index, 'unitType', e.target.value || null)}
                              placeholder="Enter unit type"
                              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-[#1E293B] text-[12px] mb-1">Unit Quantity</label>
                            <input
                              type="number"
                              value={service.unitQuantity || ''}
                              onChange={(e) => handleServiceChange(index, 'unitQuantity', e.target.value || null)}
                              placeholder="Enter unit quantity"
                              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(index)}
                        className="mt-2 text-red-500 text-[12px] hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        Remove Service
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addService}
                  className="text-[#0077CC] text-[14px] hover:text-[#005BB5]"
                  disabled={isSubmitting}
                >
                  + Add Service
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-md border border-[#CBD5E1] text-[#475569] text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClient}
                className="px-5 py-2 rounded-md bg-[#0077CC] text-white text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Clientlist;