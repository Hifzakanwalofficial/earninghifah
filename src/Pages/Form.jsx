import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTimes } from 'react-icons/fa';
import { Baseurl } from "../Config";

const Form = () => {
  const [callNumber, setCallNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [rems, setRems] = useState('');
  const [rpm, setRpm] = useState('');
  const [pr1, setPr1] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clients, setClients] = useState([]);
  const [currentServices, setCurrentServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCall, setSubmittedCall] = useState(null);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [remsCalc, setRemsCalc] = useState({ subtotal: 0, hst: 0, total: 0 });
  const [rpmCalc, setRpmCalc] = useState({ subtotal: 0, hst: 0, total: 0 });
  const [pr1Calc, setPr1Calc] = useState({ subtotal: 0, hst: 0, total: 0, blocks: 0 });

  const navigate = useNavigate();
  const HST_RATE = 0.13;
  const PR1_BLOCK_SIZE = 31; // Block size for PR1:WAITING TIME

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    fetch(`${Baseurl}/common/getAllClients`, {
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
    const filteredServices = client 
      ? client.services.filter(service => 
          !["REMS:KMS ENROUTE", "RPM:KMS UNDER TOW", "PR1:WAITING TIME"].includes(service.name)
        )
      : [];
    setCurrentServices(filteredServices);
    setSelectedServiceIds([]);
    setRems('');
    setRpm('');
    setPr1('');
  };

  const calculateService = (serviceName, quantity = 1) => {
    const client = clients.find(c => c._id === selectedClientId);
    if (!client) return { subtotal: 0, hst: 0, total: 0, blocks: 0 };

    const service = client.services.find(s => s.name === serviceName);
    if (!service || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      return { subtotal: 0, hst: 0, total: 0, blocks: 0 };
    }

    const freeUnits = service.freeUnits || 0;
    let chargeableUnits = service.type === 'fixed' ? 1 : Math.max(0, Number(quantity) - freeUnits);
    let blocks = 0;

    if (serviceName === 'PR1:WAITING TIME') {
      blocks = Math.floor(Number(quantity) / PR1_BLOCK_SIZE);
      chargeableUnits = blocks;
    }

    const subtotal = chargeableUnits * service.baseRate;
    const hst = subtotal * HST_RATE;
    const total = subtotal + hst;
    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      hst: parseFloat(hst.toFixed(2)), 
      total: parseFloat(total.toFixed(2)),
      blocks
    };
  };

  useEffect(() => {
    if (!selectedClientId) {
      setRemsCalc({ subtotal: 0, hst: 0, total: 0 });
      setRpmCalc({ subtotal: 0, hst: 0, total: 0 });
      setPr1Calc({ subtotal: 0, hst: 0, total: 0, blocks: 0 });
      setServicesTotal(0);
      return;
    }

    // Calculate REMS, RPM, PR1 dynamically
    const remsResult = calculateService('REMS:KMS ENROUTE', rems);
    const rpmResult = calculateService('RPM:KMS UNDER TOW', rpm);
    const pr1Result = calculateService('PR1:WAITING TIME', pr1);

    setRemsCalc(remsResult);
    setRpmCalc(rpmResult);
    setPr1Calc(pr1Result);

    // Calculate total for selected services
    const servicesSum = selectedServiceIds.reduce((sum, serviceId) => {
      const service = currentServices.find(s => s._id === serviceId);
      if (!service) return sum;
      const calc = calculateService(service.name);
      return sum + calc.total;
    }, 0);

    // Add REMS, RPM, PR1 totals
    const grandTotal = servicesSum + remsResult.total + rpmResult.total + pr1Result.total;
    setServicesTotal(grandTotal.toFixed(2));
  }, [selectedServiceIds, currentServices, rems, rpm, pr1, selectedClientId, clients]);

  const handleServiceChange = (e) => {
    const id = e.target.value;
    if (id && !selectedServiceIds.includes(id)) {
      setSelectedServiceIds([...selectedServiceIds, id]);
      e.target.value = '';
    }
  };

  const handleRemoveService = (id) => {
    setSelectedServiceIds(selectedServiceIds.filter(serviceId => serviceId !== id));
  };

  const handleSubmit = async () => {
    if (!callNumber || !selectedClientId || !date) {
      toast.error('Please enter call number, select a client, and select a date');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    const services = {};
    selectedServiceIds.forEach(id => {
      const service = currentServices.find(s => s._id === id);
      if (service) {
        services[service.name] = true;
      }
    });

    if (rems !== '' && !isNaN(rems) && Number(rems) > 0) {
      services["REMS:KMS ENROUTE"] = Number(rems);
    }
    if (rpm !== '' && !isNaN(rpm) && Number(rpm) > 0) {
      services["RPM:KMS UNDER TOW"] = Number(rpm);
    }
    if (pr1 !== '' && !isNaN(pr1) && Number(pr1) > 0) {
      services["PR1:WAITING TIME"] = Number(pr1);
    }

    const body = {
      phoneNumber: callNumber,
      clientId: selectedClientId,
      services,
      date: new Date(date).toISOString(),
      emergencyRerout: true,
      expressLanePickup: false
    };

    try {
      console.log('Submitting payload:', JSON.stringify(body, null, 2));
      const res = await fetch(`${Baseurl}/driver/submitCall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const responseData = await res.json();
      console.log('Backend response:', JSON.stringify(responseData, null, 2));

      if (res.ok) {
        toast.success('Call submitted successfully!');
        setSubmittedCall(responseData.call);
        handleReset();
        navigate('/driver/callrecord');
      } else {
        toast.error(responseData.message || 'Error submitting call');
        console.error('Submission error:', responseData);
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error(`Network error occurred: ${err.message}. Please try again.`);
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
    setDate(new Date().toISOString().split('T')[0]);
    setCurrentServices([]);
    setSubmittedCall(null);
    setServicesTotal(0);
    setRemsCalc({ subtotal: 0, hst: 0, total: 0 });
    setRpmCalc({ subtotal: 0, hst: 0, total: 0 });
    setPr1Calc({ subtotal: 0, hst: 0, total: 0, blocks: 0 });
  };

  return (
    <div className="p-6">
      <div
        className="bg-white rounded-[8px] p-3 sm:p-6 md:p-8 lg:p-[62px] w-[100%] mx-auto mt-10"
        style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <h2 className="text-[#1E293B] text-[16px] sm:text-xl md:text-[24px] font-semibold">
            Input call details
          </h2>
          <p className="text-[#0078bd] text-[14px] sm:text-[16px] font-semibold">
            Total: ${servicesTotal}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={handleClientChange}
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]"
              disabled={isSubmitting}
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Call # <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              placeholder="Enter call number"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.target.showPicker()}
              placeholder="Select a date"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] appearance-none cursor-pointer"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Service
            </label>
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
                  const calc = service ? calculateService(service.name) : { subtotal: 0, hst: 0, total: 0 };
                  return (
                    <div
                      key={serviceId}
                      className="flex items-center text-[13px] text-[#555555] bg-white border border-[#DADDE2] rounded-full px-2.5 py-0.5"
                    >
                      <span>
                        {service?.name || 'Unknown'} 
                        <span className="text-[#0078bd] robotosemibold"> ${calc.total}</span>
                      </span>
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

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Rems (Kms Enroute)
            </label>
            <input
              type="number"
              value={rems}
              onChange={(e) => setRems(e.target.value)}
              placeholder="Enter Kms Enroute"
              min="0"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {remsCalc.total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555]">
              
                <p className="text-[#0078BD] robotosemibold">${remsCalc.total.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Rpm (Kms Under Tow)
            </label>
            <input
              type="number"
              value={rpm}
              onChange={(e) => setRpm(e.target.value)}
              placeholder="Enter Kms Under Tow"
              min="0"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {rpmCalc.total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555]">
                {/* <p>Subtotal: ${rpmCalc.subtotal.toFixed(2)}</p>
                <p>HST: ${rpmCalc.hst.toFixed(2)}</p> */}
                <p className="text-[#0078BD] robotosemibold"> ${rpmCalc.total.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Pr1 (Waiting Time in Minutes)
            </label>
            <input
              type="number"
              value={pr1}
              onChange={(e) => setPr1(e.target.value)}
              placeholder="Enter Waiting Time (minutes)"
              min="0"
              className="w-full border border-[#E2E8F0] rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {pr1Calc.total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555]">
                {/* <p>Blocks: {pr1Calc.blocks} (31 minutes each)</p>
                <p>Subtotal: ${pr1Calc.subtotal.toFixed(2)}</p>
                <p>HST: ${pr1Calc.hst.toFixed(2)}</p> */}
                <p className="text-[#0078BD] robotosemibold"> ${pr1Calc.total.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

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

      {submittedCall && (
        <div
          className="bg-white rounded-[8px] p-3 sm:p-6 md:p-8 lg:p-[62px] w-[100%] mx-auto mt-6"
          style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
        >
          <h2 className="text-[#1E293B] text-[16px] sm:text-xl md:text-[24px] font-semibold mb-3 sm:mb-6">
            Submitted Call Details
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-6">
            <div>
              <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Call Number</label>
              <p className="text-[#1E293B] text-[11px] sm:text-[14px]">{submittedCall.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Client</label>
              <p className="text-[#1E293B] text-[11px] sm:text-[14px]">{clients.find(c => c._id === submittedCall.clientId)?.name || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Date</label>
              <p className="text-[#1E293B] text-[11px] sm:text-[14px]">{new Date(submittedCall.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Services Used</label>
              {submittedCall.servicesUsed.length > 0 ? (
                submittedCall.servicesUsed.map((service, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-[#1E293B] text-[11px] sm:text-[14px] font-semibold">{service.name}</p>
                    <p className="text-[#555555] text-[10px] sm:text-[12px]">Quantity: {service.unitQuantity} {service.unitType || 'unit'}</p>
                    <p className="text-[#555555] text-[10px] sm:text-[12px]">Base Rate: ${service.baseRate}</p>
                    <p className="text-[#555555] text-[10px] sm:text-[12px]">Subtotal: ${service.subtotal}</p>
                    <p className="text-[#555555] text-[10px] sm:text-[12px]">HST: ${service.hst}</p>
                    <p className="text-[#555555] text-[10px] sm:text-[12px]">Total: ${service.total}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#555555] text-[10px] sm:text-[12px]">No services recorded</p>
              )}
            </div>
            <div>
              <label className="block text-[#1E293B] text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">Total Earnings</label>
              <p className="text-[#1E293B] text-[11px] sm:text-[14px] font-semibold">${submittedCall.totalEarnings}</p>
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
    </div>
  );
};

export default Form;