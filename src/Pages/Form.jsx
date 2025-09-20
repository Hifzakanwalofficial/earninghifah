import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Form = () => {
  const [emergencyReroute, setEmergencyReroute] = useState(true);
  const [expressPickup, setExpressPickup] = useState(false);
  const [callNumber, setCallNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [hst, setHst] = useState('');
  const [total, setTotal] = useState('');
  const [freeUnits, setFreeUnits] = useState('');
  const [clients, setClients] = useState([]);
  const [currentServices, setCurrentServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    fetch('https://expensemanager-production-4513.up.railway.app/api/driver/getAllClients', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClients(data.data);
        } else {
          toast.error(data.message || 'Error fetching clients');
        }
      })
      .catch(err => {
        console.error('Error fetching clients:', err);
        toast.error('Network error while fetching clients');
      });
  }, []);

  const handleClientChange = (e) => {
    const id = e.target.value;
    setSelectedClientId(id);
    const client = clients.find(c => c._id === id);
    setCurrentServices(client ? client.services : []);
    setSelectedServiceId('');
    setUnitQuantity('');
    setBaseRate('');
    setHst('');
    setTotal('');
    setFreeUnits('');
  };

  const handleServiceChange = (e) => {
    const id = e.target.value;
    setSelectedServiceId(id);
    const service = currentServices.find(s => s._id === id);
    if (service) {
      setBaseRate(service.baseRate.toString());
      setHst(service.hst.toString());
      setTotal(service.total.toString());
      setFreeUnits(service.freeUnits.toString());
    } else {
      setBaseRate('');
      setHst('');
      setTotal('');
      setFreeUnits('');
    }
    setUnitQuantity('');
  };

  const handleSubmit = async () => {
    if (!callNumber || !selectedClientId || !selectedServiceId) {
      toast.error('Please enter call number, select a client, and select a service');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    const qty = parseFloat(unitQuantity) || 0;
    const servicesUsed = [{
      serviceId: selectedServiceId,
      unitQuantity: qty,
      baseRate: parseFloat(baseRate) || 0,
      hst: parseFloat(hst) || 0,
      total: parseFloat(total) || 0,
      freeUnits: parseInt(freeUnits) || 0
    }];

    const body = {
      phoneNumber: callNumber,
      clientId: selectedClientId,
      servicesUsed,
      emergencyRerout: emergencyReroute,
      expressLanePickup: expressPickup
    };

    try {
      const res = await fetch('https://expensemanager-production-4513.up.railway.app/api/driver/submitCall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success('Call submitted successfully!');
        handleReset();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Error submitting call');
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCallNumber('');
    setSelectedClientId('');
    setSelectedServiceId('');
    setUnitQuantity('');
    setBaseRate('');
    setHst('');
    setTotal('');
    setFreeUnits('');
    setCurrentServices([]);
    setEmergencyReroute(true);
    setExpressPickup(false);
  };

  return (
    <>
      <div
        className="bg-white rounded-[8px] p-3 sm:p-6 md:p-8 lg:p-[62px] w-[100%] mx-auto mt-10"
        style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
      >
        {/* Title */}
        <h2 className="text-[#1E293B] text-[16px] sm:text-xl md:text-[24px] font-semibold mb-3 sm:mb-6">
          Driver inputs the calls
        </h2>

        {/* Grid Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {/* Call # */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Call #</label>
            <input
              type="text"
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              placeholder="Enter call number"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Client</label>
            <select
              value={selectedClientId}
              onChange={handleClientChange}
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]"
              disabled={isSubmitting}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Service</label>
            <select
              value={selectedServiceId}
              onChange={handleServiceChange}
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]"
              disabled={isSubmitting}
            >
              <option value="">Select a Service</option>
              {currentServices.map(service => (
                <option key={service._id} value={service._id}>{service.name}</option>
              ))}
            </select>
          </div>

          {/* Unit Quantity */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Unit Quantity</label>
            <input
              type="number"
              value={unitQuantity}
              onChange={(e) => setUnitQuantity(e.target.value)}
              placeholder="Enter unit quantity"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Base Rate */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Base Rate</label>
            <input
              type="number"
              step="0.01"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              placeholder="Enter base rate"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* HST */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">HST</label>
            <input
              type="number"
              step="0.01"
              value={hst}
              onChange={(e) => setHst(e.target.value)}
              placeholder="Enter HST"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Total */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Total</label>
            <input
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Enter total"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Free Units */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Free Units</label>
            <input
              type="number"
              value={freeUnits}
              onChange={(e) => setFreeUnits(e.target.value)}
              placeholder="Enter free units"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[#1E293B] text-[11px] sm:text-[14px] robotomedium">Emergency Reroute</span>
            <button
              onClick={() => setEmergencyReroute(!emergencyReroute)}
              className={`w-9 h-5 sm:w-11 sm:h-6 flex items-center rounded-full p-1 transition-colors ${
                emergencyReroute ? "bg-[#00C26B]" : "bg-gray-300"
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              <div
                className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform transition-transform ${
                  emergencyReroute ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#1E293B] text-[11px] sm:text-[14px] robotomedium">Express Lane Pickup</span>
            <button
              onClick={() => setExpressPickup(!expressPickup)}
              className={`w-9 h-5 sm:w-11 sm:h-6 flex items-center rounded-full p-1 transition-colors ${
                expressPickup ? "bg-[#00C26B]" : "bg-gray-300"
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              <div
                className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform transition-transform ${
                  expressPickup ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-3 sm:mt-6 gap-2 sm:gap-3">
          <button 
            onClick={handleReset} 
            className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-md border border-[#CBD5E1] text-[#475569] text-[11px] sm:text-[14px] order-2 sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-md bg-[#0077CC] text-white text-[11px] sm:text-[14px] order-1 sm:order-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
      
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

export default Form;