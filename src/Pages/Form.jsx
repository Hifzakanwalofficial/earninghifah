import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTimes } from 'react-icons/fa';

const Form = () => {
  const [callNumber, setCallNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [rems, setRems] = useState('');
  const [rpm, setRpm] = useState('');
  const [pr1, setPr1] = useState('');
  const [clients, setClients] = useState([]);
  const [currentServices, setCurrentServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    fetch('https://expensemanager-production-4513.up.railway.app/api/common/getAllClients', {
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
    setSelectedServiceIds([]);
    setRems('');
    setRpm('');
    setPr1('');
  };

  const handleServiceChange = (e) => {
    const id = e.target.value;
    if (id && !selectedServiceIds.includes(id)) {
      setSelectedServiceIds([...selectedServiceIds, id]);
      e.target.value = ''; // Reset dropdown to placeholder
    }
  };

  const handleRemoveService = (id) => {
    setSelectedServiceIds(selectedServiceIds.filter(serviceId => serviceId !== id));
  };

  const handleSubmit = async () => {
    if (!callNumber || !selectedClientId || selectedServiceIds.length === 0) {
      toast.error('Please enter call number, select a client, and select at least one service');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    const services = {
      TOW: selectedServiceIds.some(id => currentServices.find(s => s._id === id)?.name === 'TOW') || false,
      "BOOST/LOCKOUT/TIRE CHANGE": selectedServiceIds.some(id => currentServices.find(s => s._id === id)?.name === 'BOOST/LOCKOUT/TIRE CHANGE') || false,
      GOA: selectedServiceIds.some(id => currentServices.find(s => s._id === id)?.name === 'GOA') || false,
      "REMS:KMS ENROUTE": rems ? parseInt(rems) || 0 : 0,
      "RPM:KMS UNDER TOW": rpm ? parseInt(rpm) || 0 : 0,
      "PR1:WAITING TIME": pr1 ? parseInt(pr1) || 0 : 0,
      "UNDERGROUND SERVICE": selectedServiceIds.some(id => currentServices.find(s => s._id === id)?.name === 'UNDERGROUND SERVICE') || false
    };

    const body = {
      phoneNumber: callNumber,
      clientId: selectedClientId,
      services,
      emergencyRerout: true,
      expressLanePickup: false
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
    setSelectedServiceIds([]);
    setRems('');
    setRpm('');
    setPr1('');
    setCurrentServices([]);
  };

  return (
    <>
      <div
        className="bg-white rounded-[8px] p-3 sm:p-6 md:p-8 lg:p-[62px] w-[100%] mx-auto mt-10"
        style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
      >
        <h2 className="text-[#1E293B] text-[16px] sm:text-xl md:text-[24px] font-semibold mb-3 sm:mb-6">
          Driver inputs the calls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {/* Client (now first) */}
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

          {/* Call # (now second, only numbers allowed) */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Call #</label>
            <input
              type="text"
              value={callNumber}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
                setCallNumber(onlyNums);
              }}
              placeholder="Enter call number"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">Service</label>
            <select
              value=""
              onChange={handleServiceChange}
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]"
              disabled={isSubmitting || !selectedClientId}
            >
              <option value="">Select a Service</option>
              {currentServices
                .filter(service => !selectedServiceIds.includes(service._id))
                .map(service => (
                  <option key={service._id} value={service._id}>{service.name}</option>
                ))}
            </select>
            {selectedServiceIds.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {selectedServiceIds.map((serviceId) => {
                  const service = currentServices.find(s => s._id === serviceId);
                  return (
                    <div
                      key={serviceId}
                      className="flex items-center text-[13px] text-[#555555] bg-white border border-[#DADDE2] rounded-full px-2.5 py-0.5"
                    >
                      <span>{service?.name || 'Unknown'}</span>
                      <button
                        onClick={() => handleRemoveService(serviceId)}
                        className="ml-2 text-[#555555] hover:text-[#333333] focus:outline-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rems */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Rems</label>
            <input
              type="text"
              value={rems}
              onChange={(e) => setRems(e.target.value)}
              placeholder="Enter Rems"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Rpm */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Rpm</label>
            <input
              type="text"
              value={rpm}
              onChange={(e) => setRpm(e.target.value)}
              placeholder="Enter Rpm"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Pr1 */}
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Pr1</label>
            <input
              type="text"
              value={pr1}
              onChange={(e) => setPr1(e.target.value)}
              placeholder="Enter Pr1"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-3 sm:mt-6 gap-2 sm:gap-3">
          <button 
            onClick={handleReset} 
            className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-md border border-[#CBD5E1] text-[#475569] text-[11px] sm:text-[14px] order-2 sm:order-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-md bg-[#0077CC] text-white text-[11px] sm:text-[14px] order-1 sm:order-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
