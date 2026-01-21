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
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));





  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

          // Sort clients alphabetically by name (A-Z)
          const sortedClients = formatted.sort((a, b) => a.name.localeCompare(b.name));

          setClients(sortedClients);
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
        setClients(prevClients => {
          const updated = prevClients.map(client => 
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
          );
          // Re-sort after update
          return updated.sort((a, b) => a.name.localeCompare(b.name));
        });
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

      setClients((prev) => {
        const filtered = prev.filter((c) => !selectedClients.includes(c._id));
        // Re-sort after deletion
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      });
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
      <>
        <div className="md:hidden animate-pulse">
          {/* Mobile Header */}
          <div className="flex justify-between items-center bg-[#FAFAFC] dark:bg-[#101935] px-4 py-3">
            <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          {/* Mobile Skeletons */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#101935] border border-[#E5E7EB] dark:border-[#263463] rounded-lg mx-4 mt-2 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, sIndex) => (
                    <div key={sIndex} className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto animate-pulse">
          <div className="grid grid-cols-[30px_200px_1fr_100px] bg-[#FAFAFC] dark:bg-[#101935] px-[14px] py-[11px] items-center gap-x-[20px] min-w-[600px]">
            <div className="h-4 w-[20px] bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[30px_200px_1fr_100px] bg-white dark:bg-[#101935] px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] dark:border-[#263463] gap-x-[20px] min-w-[600px]"
            >
              <div className="h-4 w-[20px] bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return <p className="text-center py-4 text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <>
      {/* Action Buttons (Delete/Cancel) */}
      {selectedClients.length > 0 && (
        <div className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 border-b border-[#EAEFF4] dark:border-gray-700 justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-3 py-2 text-[14px] sm:px-4 sm:py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={handleCancelSelection}
            className="bg-gray-400 text-white  px-3 py-2 text-[14px] sm:px-4 sm:py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex justify-between items-center bg-[#FAFAFC] dark:bg-[#101935] px-2 py-3">
          <p className="robotosemibold text-[18px] text-[#333333] dark:text-white">Clients</p>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </div>
        </div>

        {/* Mobile List */}
        {clients.length === 0 ? (
          <div className="flex justify-center  items-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-[16px]">No Client List Available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] dark:bg-[#101935] border border-[#EAEFF4] dark:border-[#263463] shadow-sm rounded-[8px] mx-0 p-4"
                style={{BoxShadow: "0px 0px 10px 0px #E3EBFC"}}
              >
                <div className="flex justify-between border-b pb-1.5 border-[#EAEFF4] dark:border-gray-700 items-center mb-3">
                  <div className="flex items-center  gap-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client._id)}
                      onChange={() => handleSelectClient(client._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-[14px] text-[#333333] dark:text-white robotomedium">
                      {client.name}
                    </p>
                  </div>
                  <button
                    onClick={() => openModal(client)}
                    className="text-[#0078BD] hover:text-[#005BB5] robotosemibold"
                  >
                   <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.99998 15.0002H15.75M2.25 15.0002H3.50591C3.87279 15.0002 4.05624 15.0002 4.22887 14.9587C4.38192 14.922 4.52824 14.8614 4.66245 14.7791C4.81382 14.6864 4.94354 14.5567 5.20296 14.2972L14.625 4.87517C15.2463 4.25385 15.2463 3.24649 14.625 2.62517C14.0037 2.00385 12.9963 2.00385 12.375 2.62517L2.95295 12.0472C2.69352 12.3067 2.5638 12.4364 2.47104 12.5877C2.3888 12.722 2.32819 12.8683 2.29145 13.0213C2.25 13.194 2.25 13.3774 2.25 13.7443V15.0002Z" stroke="#67778E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                  </button>
                </div>
                <div>
                  <p className="text-[14px] text-[#333333CC] dark:text-[#95A0C6]  robotomedium mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {client.services.map((service, serviceIndex) => (
                      <span
                        key={serviceIndex}
                        className="text-[10px] text-[#67778E] dark:text-gray-400 bg-[#67778E0A] dark:bg-[#95A0C60A] robotomedium border border-[#DADDE2] dark:border-gray-600 rounded-[58px] px-[10px] py-[5px]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[30px_200px_1fr_100px] bg-[#FAFAFC] dark:bg-[#101935] px-[14px] py-[11px] items-center gap-x-[20px] min-w-[600px]">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </div>
            <p className="robotosemibold text-[18px] text-[#333333CC] dark:text-[#95A0C6] whitespace-nowrap">
              Clients Name
            </p>
            <p className="robotosemibold text-[18px] text-[#333333CC] dark:text-[#95A0C6] whitespace-nowrap">
              Services
            </p>
            <p className="robotosemibold text-[18px] text-[#333333CC] dark:text-[#95A0C6] whitespace-nowrap">
              Actions
            </p>
          </div>

          {/* Table Rows */}
          {clients.length === 0 ? (
            <div className="flex justify-center items-center h-[calc(100vh-150px)]">
              <p className="text-gray-500 dark:text-gray-400 text-[16px]">No Client List Available</p>
            </div>
          ) : (
            clients.map((client, index) => (
              <div
                key={index}
                className="grid grid-cols-[30px_200px_1fr_100px] bg-white dark:bg-[#101935] px-[14px] pt-[20px] pb-[11px] border-b border-[#E5E7EB] dark:border-[#263463] gap-x-[20px] min-w-[600px]"
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client._id)}
                    onChange={() => handleSelectClient(client._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="text-[15px] text-[#333333] dark:text-white whitespace-nowrap">
                  {client.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {client.services.map((service, serviceIndex) => (
                    <span
                      key={serviceIndex}
                      className="text-[15px] text-[#555555] dark:text-gray-300 bg-white dark:bg-gray-800 border border-[#DADDE2] dark:border-gray-600 rounded-full px-3 py-1"
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000088] bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-[400px] border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedClients.length}</span>{" "}
              client(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white"
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
          <div className="bg-white dark:bg-gray-800 rounded-[8px] p-4 sm:p-6 w-[90%] max-w-[600px] max-h-[80vh] overflow-y-auto border dark:border-gray-700">
            <h2 className="text-[#1E293B] dark:text-white text-[20px] font-semibold mb-4">Update Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#1E293B] dark:text-white text-[14px] mb-2 robotomedium">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-3 py-2 text-[14px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[#1E293B] dark:text-white text-[14px] mb-2 robotomedium">
                  Services
                </label>
                {services.map((service, index) => (
                  <div key={index} className="mb-4 border border-[#E2E8F0] dark:border-gray-600 p-3 rounded-md bg-white dark:bg-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          placeholder="Enter service name"
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px] text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Type</label>
                        <select
                          value={service.type}
                          onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        >
                          <option value="fixed">Fixed</option>
                          <option value="distance">Distance</option>
                          <option value="time">Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Base Rate</label>
                        <input
                          type="number"
                          value={service.baseRate}
                          onChange={(e) => handleServiceChange(index, 'baseRate', e.target.value)}
                          placeholder="Enter base rate"
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">HST</label>
                        <input
                          type="number"
                          value={service.hst}
                          onChange={(e) => handleServiceChange(index, 'hst', e.target.value)}
                          placeholder="Enter HST"
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Total</label>
                        <input
                          type="number"
                          value={service.total}
                          readOnly
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-gray-100 dark:bg-gray-600"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Free Units</label>
                        <input
                          type="number"
                          value={service.freeUnits}
                          onChange={(e) => handleServiceChange(index, 'freeUnits', e.target.value)}
                          placeholder="Enter free units"
                          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                          disabled={isSubmitting}
                        />
                      </div>
                      {service.name.startsWith('PR1') && (
                        <>
                          <div>
                            <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Unit Type</label>
                            <input
                              type="text"
                              value={service.unitType || ''}
                              onChange={(e) => handleServiceChange(index, 'unitType', e.target.value || null)}
                              placeholder="Enter unit type"
                              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-[#333333] dark:text-gray-300 robotomedium  text-[12px] mb-1">Unit Quantity</label>
                            <input
                              type="number"
                              value={service.unitQuantity || ''}
                              onChange={(e) => handleServiceChange(index, 'unitQuantity', e.target.value || null)}
                              placeholder="Enter unit quantity"
                              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-md px-[14px] py-[8px]  text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(index)}
                        className="mt-2 text-red-500 dark:text-red-400 text-[12px] hover:text-red-700 dark:hover:text-red-300"
                        disabled={isSubmitting}
                      >
                        Remove Service
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addService}
                  className="text-[#0077CC] dark:text-[#0078BD] text-[14px] robotomedium  hover:text-[#005BB5]"
                  disabled={isSubmitting}
                >
                  + Add Service
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-md robotomedium border border-[#CBD5E1] dark:border-gray-600 text-[#475569] dark:text-gray-300 text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClient}
                className="px-5 py-2 rounded-md robotomedium bg-[#0077CC] text-white text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        theme={isDark ? "dark" : "light"}
      />
    </>
  );
};

export default Clientlist;