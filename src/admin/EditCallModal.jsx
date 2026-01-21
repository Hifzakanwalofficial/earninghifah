import React, { useState, useEffect } from "react";
import { FaChevronDown, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import { Baseurl } from "../Config";

const EditCallModal = ({
  call,
  filteredCalls,
  currentEditIndex,
  onPrev,
  onNext,
  isOpen,
  onClose,
  onUpdate,
  onRefresh,
  handleUpdateStatus // Passing this from parent allows us to use the exact same logic as the table
}) => {
  const [formData, setFormData] = useState(null);
  const [clientServices, setClientServices] = useState([]);
  const [displayedServices, setDisplayedServices] = useState([]);
  const [loading, setLoading] = useState(false); // For main Save button
  const [statusUpdating, setStatusUpdating] = useState(false); // For dropdown status change specifically
  const [error, setError] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [localStatus, setLocalStatus] = useState("unverified");
  const [originalStatus, setOriginalStatus] = useState(null);

  const token = localStorage.getItem("authToken");

  const capitalizeFirstLetter = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const today = new Date().toISOString().split("T")[0];

  // Sync status when modal opens or call changes
  useEffect(() => {
    if (call?.status && isOpen) {
      const status = call.status.toLowerCase();
      const normalized = status === "pending" ? "unverified" : status;
      setLocalStatus(normalized);
      setOriginalStatus(normalized);
    }
  }, [call?.status, isOpen]);

  // Fetch Services
  useEffect(() => {
    if (!call?.clientId || !isOpen || !token) return;

    const fetchAllServices = async () => {
      try {
        const clientRes = await fetch(`${Baseurl}/common/getClientById/${call.clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!clientRes.ok) throw new Error("Client not found");
        const clientData = await clientRes.json();

        const rawServices = clientData.services || clientData.clientServices || [];
        const serviceIds = rawServices
          .map((item) => (typeof item === "string" ? item : item._id || item.serviceId))
          .filter((id) => id && id.length === 24);

        if (serviceIds.length === 0) {
          setClientServices([]);
          return;
        }

        const promises = serviceIds.map((id) =>
          fetch(`${Baseurl}/common/clients/${call.clientId}/services/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        );

        const results = await Promise.all(promises);
        setClientServices(results.filter(Boolean));
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };

    fetchAllServices();
  }, [call?.clientId, isOpen, token]);

  // Initialize Form Data
  useEffect(() => {
    if (!call || !isOpen || clientServices.length === 0) {
      setDisplayedServices([]);
      setFormData(null);
      return;
    }

    const servicesSource = call.adminEdits?.servicesUsed || call.servicesUsed || [];

    const initialServices = servicesSource
      .map((used) => {
        const svc = clientServices.find(
          (s) =>
            s._id === used.serviceId ||
            s._id === used._id ||
            s.name?.trim() === used.name?.trim()
        );
        if (!svc) return null;

        const isPR1 = svc.name === "PR1:WAITING TIME" || used.name === "PR1:WAITING TIME";
        const type = (svc.type || "").toLowerCase();

        if (isPR1 || type === "time") {
          let totalMinutes = 0;
          if (used.inputUnits != null && used.inputUnits > 0) {
            totalMinutes = Number(used.inputUnits);
          } else if (used.unitQuantity != null) {
            totalMinutes = Number(used.unitQuantity) * 31;
          }

          return {
            _id: svc._id,
            name: svc.name || "PR1:WAITING TIME",
            type: "time",
            baseRate: Number(used.baseRate || svc.baseRate || 20).toFixed(2),
            inputUnits: totalMinutes.toString(),
            originalMinutes: totalMinutes,
          };
        }

        if (type === "fixed") {
          return {
            _id: svc._id,
            name: svc.name,
            type: "fixed",
            baseRate: Number(used.baseRate || svc.baseRate || 0).toFixed(2),
            hst: Number(used.hst || 0).toFixed(2),
          };
        }

        const free = Number(used.freeUnits || 0);
        const billable = Number(used.unitQuantity || 0);
        const total = billable + free;

        return {
          _id: svc._id,
          name: svc.name,
          type: type || "distance",
          baseRate: Number(used.baseRate || svc.baseRate || 0).toFixed(2),
          inputUnits: total.toFixed(2),
          freeUnits: free.toFixed(2),
          unitType: svc.unitType || "km",
        };
      })
      .filter(Boolean);

    setDisplayedServices(initialServices);

    const callDateOnly = call.date
      ? new Date(call.date).toLocaleDateString("en-CA")
      : today;

    setFormData({
      callId: call._id,
      phoneNumber: call.phoneNumber || call.call || "",
      clientId: call.clientId,
      date: callDateOnly,
      services: initialServices,
    });
  }, [call, isOpen, clientServices]);

  if (!isOpen || !call || !formData) return null;

  const availableToAdd = clientServices.filter(
    (svc) => !displayedServices.some((d) => d._id === svc._id)
  );

  const addService = (svc) => {
    const type = (svc.type || "").toLowerCase();
    let newService;

    if (type === "fixed") {
      newService = {
        _id: svc._id,
        name: svc.name,
        type: "fixed",
        baseRate: Number(svc.baseRate || 0).toFixed(2),
        hst: "0.00",
      };
    } else if (type === "time" || svc.name === "PR1:WAITING TIME") {
      newService = {
        _id: svc._id,
        name: svc.name,
        type: "time",
        baseRate: Number(svc.baseRate || 20).toFixed(2),
        inputUnits: "0",
        originalMinutes: 0,
      };
    } else {
      newService = {
        _id: svc._id,
        name: svc.name,
        type: type || "distance",
        baseRate: Number(svc.baseRate || 0).toFixed(2),
        inputUnits: "0.00",
        freeUnits: "0.00",
        unitType: svc.unitType || "km",
      };
    }

    const updated = [newService, ...displayedServices];
    setDisplayedServices(updated);
    setFormData((prev) => ({ ...prev, services: updated }));
    setShowAddDropdown(false);
  };

  const removeService = (id) => {
    const updated = displayedServices.filter((s) => s._id !== id);
    setDisplayedServices(updated);
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  const handleInputChange = (e, serviceId) => {
    const { name, value } = e.target;
    setDisplayedServices((prev) =>
      prev.map((s) => {
        if (s._id === serviceId) {
          if (s.type === "time" && name === "inputUnits") {
            return { ...s, inputUnits: value, originalMinutes: Number(value) || 0 };
          }
          return { ...s, [name]: value };
        }
        return s;
      })
    );
  };

  const handleTopLevelChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // *** NEW: Handle Status Change Separately ***
  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    setError("");
    try {
      // Call the separate status update API
      const res = await fetch(`${Baseurl}/admin/update-call-status/${formData.callId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state immediately for UI feedback
      setLocalStatus(newStatus);
      setOriginalStatus(newStatus);
      
      // Update parent state (AllCalls) so the table behind updates instantly
      if (handleUpdateStatus) {
        handleUpdateStatus(call._id, newStatus);
      }

      // Important: Do NOT close the modal. Just show success.
    } catch (err) {
      console.error(err);
      setError("Status update failed: " + err.message);
    } finally {
      setStatusUpdating(false);
      setShowStatusDropdown(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const servicesToSave = displayedServices
        .map((s) => {
          const baseRate = parseFloat(s.baseRate) || 0;

          if (s.type === "fixed") {
            if (baseRate <= 0) return null;
            return { _id: s._id, name: s.name, type: "fixed", baseRate, unitQuantity: 1 };
          }

          if (s.type === "time") {
            const totalMinutes = Number(s.originalMinutes || s.inputUnits || 0);
            const billableBlocks = Math.floor(totalMinutes / 31);
            if (billableBlocks <= 0) return null;
            return {
              _id: s._id,
              name: s.name,
              type: "time",
              baseRate,
              inputUnits: totalMinutes,
              unitQuantity: 31,
              billableUnits: billableBlocks,
            };
          }

          const inputUnits = parseFloat(s.inputUnits) || 0;
          const freeUnits = parseFloat(s.freeUnits) || 0;
          const billable = Math.max(0, inputUnits - freeUnits);
          if (billable <= 0) return null;

          return {
            _id: s._id,
            name: s.name,
            type: s.type || "distance",
            baseRate,
            inputUnits,
            freeUnits,
            unitQuantity: billable,
            unitType: s.unitType || "km",
          };
        })
        .filter(Boolean);

      // DATE FIX
      const [year, month, day] = formData.date.split("-");
      const correctDate = new Date(year, month - 1, day, 12, 0, 0);

      const editPayload = {
        callId: formData.callId,
        phoneNumber: formData.phoneNumber,
        clientId: formData.clientId,
        date: correctDate.toISOString(),
        services: servicesToSave,
        status: localStatus, 
      };

      // 1. Update call details
      const editRes = await fetch(`${Baseurl}/admin/editcall`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editPayload),
      });

      if (!editRes.ok) {
        const err = await editRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update call details");
      }

      const editData = await editRes.json();

      // 2. If status changed in local state but API failed previously, try again? 
      // No, we handle status separately in the dropdown now. 
      // However, ensure the main API also knows the status.
      
      onUpdate(editData.call || editData);

      if (typeof onRefresh === "function") {
        onRefresh();
      }

      onClose(); // Only close on "Save Changes" button
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasBillable = (s) => {
    if (s.type === "fixed") return parseFloat(s.baseRate) > 0;
    if (s.type === "time") return Math.floor((Number(s.inputUnits || 0) / 31)) > 0;
    return (parseFloat(s.inputUnits) || 0) > (parseFloat(s.freeUnits) || 0);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div className="bg-white dark:bg-[#0078BD3D] dark:border-[#0078BD66] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 px-8 pt-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Call</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-8 mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Top Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-2 sm:px-8">
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber || ""}
            onChange={handleTopLevelChange}
            placeholder="Call No"
            className="px-4 py-3 bg-gray-50 dark:bg-[#0078BD3D] dark:border-[#0078BD66] border rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <input
            type="text"
            value={call.clientName || "N/A"}
            readOnly
            className="px-4 py-3 bg-gray-100 dark:bg-[#0078BD3D] dark:border-[#0078BD66] border rounded-lg dark:text-white"
          />
          <input
            type="date"
            name="date"
            value={formData.date || ""}
            onChange={handleTopLevelChange}
            max={today}
            className="
              px-4 py-3
              bg-white
              dark:bg-[#0078BD3D]
              border border-gray-300
              dark:border-[#0078BD66]
              rounded-lg
              text-gray-900
              dark:text-white
              placeholder-gray-400
              dark:placeholder-gray-300
              focus:outline-none
              focus:ring-2 focus:ring-blue-500
              dark:focus:ring-[#0078BD]
            "
          />
          
          {/* Status Dropdown with Separate Logic */}
          <div className="relative">
            <div
              onClick={() => !statusUpdating && setShowStatusDropdown(!showStatusDropdown)}
              className={`px-4 py-3 bg-gray-50 dark:bg-[#0078BD3D] dark:border-[#0078BD66] border rounded-lg cursor-pointer flex justify-between items-center dark:text-white ${statusUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>
                {statusUpdating ? "Updating..." : capitalizeFirstLetter(localStatus === "pending" ? "Unverified" : localStatus)}
              </span>
              <FaChevronDown />
            </div>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white dark:text-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                {["verified", "unverified"].map((st) => (
                  <div
                    key={st}
                    onClick={() => handleStatusChange(st)} // Separate handler
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {capitalizeFirstLetter(st)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="px-2 sm:px-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold dark:text-white">Services Used</h3>
            {availableToAdd.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                  className="flex items-center gap-2 px-4 text-[14px] sm:text-[16px] cursor-pointer sm:px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg"
                >
                  <FaPlus /> Add Service
                </button>
                {showAddDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                    {availableToAdd.map((svc) => (
                      <div
                        key={svc._id}
                        onClick={() => addService(svc)}
                        className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                      >
                        {svc.name} <span className="text-gray-500">({svc.type})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {displayedServices.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-white">
              No services added yet.
            </div>
          ) : (
            displayedServices.map((s) => {
              const isTime = s.type === "time";
              const isFixed = s.type === "fixed";

              return (
                <div
                  key={s._id}
                  className={`p-6 rounded-xl border-2 mb-6 dark:bg-[#0078BD3D] dark:border-[#0078BD66] ${
                    hasBillable(s) ? "border-gray-500 bg-blue-50/30" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-xl font-bold dark:text-white">
                      {s.name}
                    </h4>
                    <button
                      onClick={() => removeService(s._id)}
                      className="text-red-600 cursor-pointer hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  {isTime ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Total Minutes
                        </label>
                        <input
                          type="number"
                          name="inputUnits"
                          value={s.inputUnits || 0}
                          onChange={(e) => handleInputChange(e, s._id)}
                          className="w-full px-4 py-3 border rounded-lg text-lg dark:text-white dark:border-white"
                          placeholder="e.g. 1430"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Block Size
                        </label>
                        <div className="px-4 py-3 bg-gray-200 dark:bg-transparent border dark:border-white rounded-lg text-lg font-bold dark:text-white">
                          31 minutes
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Billable Blocks
                        </label>
                        <div className="px-4 py-3 bg-gray-200 dark:bg-transparent rounded-lg text-lg font-bold dark:text-white border dark:border-white">
                          {Math.floor((Number(s.inputUnits || 0) / 31))}
                        </div>
                      </div>
                    </div>
                  ) : isFixed ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Base Rate
                        </label>
                        <input
                          type="number"
                          name="baseRate"
                          value={s.baseRate}
                          onChange={(e) => handleInputChange(e, s._id)}
                          step="0.01"
                          className="w-full px-4 py-3 border rounded-lg dark:text-white dark:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">HST</label>
                        <input
                          type="number"
                          name="hst"
                          value={s.hst || 0}
                          onChange={(e) => handleInputChange(e, s._id)}
                          step="0.01"
                          className="w-full px-4 py-3 border rounded-lg dark:text-white dark:border-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Total Units
                        </label>
                        <input
                          type="number"
                          name="inputUnits"
                          value={s.inputUnits || 0}
                          onChange={(e) => handleInputChange(e, s._id)}
                          step="0.01"
                          className="w-full px-4 py-3 border rounded-lg dark:text-white dark:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Rate per Unit
                        </label>
                        <input
                          type="number"
                          name="baseRate"
                          value={s.baseRate || ""}
                          onChange={(e) => handleInputChange(e, s._id)}
                          step="0.01"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-medium dark:text-white dark:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-white">
                          Free Units
                        </label>
                        <input
                          type="number"
                          name="freeUnits"
                          value={s.freeUnits || 0}
                          onChange={(e) => handleInputChange(e, s._id)}
                          step="0.01"
                          className="w-full px-4 py-3 border rounded-lg dark:text-white dark:border-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-y-2.5 justify-between items-center px-2 sm:px-8 pb-8 pt-4 border-t">
          <div className="flex gap-4">
            <button
              onClick={onPrev}
              disabled={currentEditIndex === 0}
              className="
                p-2 sm:p-4 cursor-pointer        
                bg-gray-200 dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white
                rounded-lg
                disabled:opacity-50
              "
            >
              <FaArrowUp className="text-base sm:text-xl" />
            </button>

            <button
              onClick={onNext}
              disabled={currentEditIndex === filteredCalls.length - 1}
              className="
                p-2 sm:p-4      
                bg-gray-200 cursor-pointer dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white
                rounded-lg
                disabled:opacity-50
              "
            >
              <FaArrowDown className="text-base sm:text-xl" />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-1.5 cursor-pointer sm:px-8 sm:py-3 text-[14px] sm:text-[16px] bg-gray-300 dark:bg-gray-700 rounded-lg dark:text-white hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 sm:px-8 sm:py-3 cursor-pointer text-[14px] sm:text-[16px] bg-blue-900 hover:bg-blue-800 text-white rounded-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCallModal;