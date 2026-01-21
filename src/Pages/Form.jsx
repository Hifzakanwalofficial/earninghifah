import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTimes, FaEdit } from 'react-icons/fa';
import { Baseurl } from "../Config";

import VehicleInfoSection from './VehicleInfoSection';

const PriceModal = ({ isOpen, onClose, title, data, onSave, driverPercentage }) => {
  const [editingBaseRate, setEditingBaseRate] = useState(false);
  const [editingUnitQuantity, setEditingUnitQuantity] = useState(false);
  const [tempBaseRate, setTempBaseRate] = useState(data.baseRate);
  const [tempUnitQuantity, setTempUnitQuantity] = useState(data.unitQuantity || 31);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempBaseRate, tempUnitQuantity);
    setEditingBaseRate(false);
    setEditingUnitQuantity(false);
  };

  // Helper to apply percentage for Modal display
  const getPercentageValue = (value) => {
    if (!value) return "0.00";
    return (Number(value) * (Number(driverPercentage) / 100)).toFixed(2);
  };

  // Calculate Total with percentage
  const modalTotal = getPercentageValue(data.total);

  return (
    <div className="fixed inset-0 bg-[#00000096] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#101935] rounded-lg p-5 max-w-sm w-full shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2 text-sm text-[#555555] dark:text-gray-300">
          {/* Base Rate - Editable */}
          <div className="flex items-center gap-2">
            <span>Base Rate:</span>
            {editingBaseRate ? (
              <input
                type="number"
                value={tempBaseRate}
                onChange={(e) => setTempBaseRate(Number(e.target.value))}
                className="w-24 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                min="0"
                step="0.01"
              />
            ) : (
              <span className="font-medium text-[#1E293B] dark:text-white">${data.baseRate.toFixed(2)}</span>
            )}
            {editingBaseRate ? (
              <button onClick={handleSave} className="text-green-600 text-xs">Save</button>
            ) : (
              <button onClick={() => setEditingBaseRate(true)} className="text-[#0078BD] text-xs flex items-center gap-1">
                <FaEdit className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {/* Unit Quantity - Only for type: time */}
          {data.type === 'time' && (
            <div className="flex items-center gap-2">
              <span>Unit Quantity (per block):</span>
              <span className="font-medium text-[#1E293B] dark:text-white">{data.unitQuantity}</span>
            </div>
          )}

          {data.blocks !== undefined && (
            <p>Blocks: <span className="font-medium text-[#1E293B] dark:text-white">{data.blocks}</span> (31 min each)</p>
          )}
          
          <p>Subtotal: <span className="font-medium text-[#1E293B] dark:text-white">${data.subtotal.toFixed(2)}</span></p>
          <p>HST (13%): <span className="font-medium text-[#1E293B] dark:text-white">${data.hst.toFixed(2)}</span></p>
          
          {/* CHANGED: Total displays Percentage Applied Value */}
          <p className="text-base font-semibold text-[#0078BD] dark:text-blue-400">
            Total: ${modalTotal}
          </p>
        </div>
      </div>
    </div>
  );
};

const Form = () => {
  const [callNumber, setCallNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [rems, setRems] = useState('');
  const [rpm, setRpm] = useState('');
  const [pr1, setPr1] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // ── Vehicle & Comments states ──────────────────────────────
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [comments, setComments] = useState('');

  const [clients, setClients] = useState([]);
  const [currentServices, setCurrentServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCall, setSubmittedCall] = useState(null);
  const [servicesTotal, setServicesTotal] = useState(0);

  // ── State for Driver Percentage ──────────────────────────────
  const [driverPercentage, setDriverPercentage] = useState(0); // Default 0%

  const [customRates, setCustomRates] = useState({});

  const [showRemsModal, setShowRemsModal] = useState(false);
  const [showRpmModal, setShowRpmModal] = useState(false);
  const [showPr1Modal, setShowPr1Modal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(null);

  const navigate = useNavigate();
  const HST_RATE = 0.13;
  const PR1_BLOCK_SIZE = 31;

  // ── Fetch Driver Percentage from API ──────────────────────────────
  useEffect(() => {
    const fetchDriverPercentage = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formatDate = (d) => d.toISOString().split('T')[0];

        const url = new URL(`https://expensemanager-production-303e.up.railway.app/api/driver/call-summary`);
        url.searchParams.append("startDate", formatDate(firstDay));
        url.searchParams.append("endDate", formatDate(lastDay));

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data && data.percentage !== undefined) {
          setDriverPercentage(Number(data.percentage));
        }
      } catch (err) {
        console.error("Error fetching driver percentage:", err);
      }
    };

    fetchDriverPercentage();
  }, []); 

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
    setCustomRates({});
  };

  const getCustomRate = (serviceName) => {
    return customRates[serviceName] || {};
  };

  const calculateService = (serviceName, quantity = 1) => {
    const client = clients.find(c => c._id === selectedClientId);
    if (!client) return { subtotal: 0, hst: 0, total: 0, blocks: 0, baseRate: 0, type: '', unitQuantity: 31 };

    const service = client.services.find(s => s.name === serviceName);
    if (!service || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      return { subtotal: 0, hst: 0, total: 0, blocks: 0, baseRate: 0, type: '', unitQuantity: 31 };
    }

    const custom = getCustomRate(serviceName);
    const baseRate = custom.baseRate !== undefined ? custom.baseRate : service.baseRate;
    const unitQuantity = custom.unitQuantity !== undefined ? custom.unitQuantity : (serviceName === 'PR1:WAITING TIME' ? 31 : 31);

    const freeUnits = service.freeUnits || 0;
    let chargeableUnits = service.type === 'fixed' ? 1 : Math.max(0, Number(quantity) - freeUnits);
    let blocks = 0;

    if (serviceName === 'PR1:WAITING TIME') {
      blocks = Math.floor(Number(quantity) / PR1_BLOCK_SIZE);
      chargeableUnits = blocks;
    }

    const subtotal = chargeableUnits * baseRate;
    const hst = subtotal * HST_RATE;
    const total = subtotal + hst;

    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      hst: parseFloat(hst.toFixed(2)), 
      total: parseFloat(total.toFixed(2)),
      blocks,
      baseRate,
      type: service.type,
      unitQuantity
    };
  };

  useEffect(() => {
    if (!selectedClientId) {
      setServicesTotal(0);
      return;
    }

    const remsResult = calculateService('REMS:KMS ENROUTE', rems);
    const rpmResult = calculateService('RPM:KMS UNDER TOW', rpm);
    const pr1Result = calculateService('PR1:WAITING TIME', pr1);

    const servicesSum = selectedServiceIds.reduce((sum, serviceId) => {
      const service = currentServices.find(s => s._id === serviceId);
      if (!service) return sum;
      const calc = calculateService(service.name);
      return sum + calc.total;
    }, 0);

    const grandTotal = servicesSum + remsResult.total + rpmResult.total + pr1Result.total;
    
    // Calculate Percentage Applied Total
    const appliedTotal = grandTotal * (driverPercentage / 100);
    
    setServicesTotal(appliedTotal.toFixed(2));
  }, [selectedServiceIds, currentServices, rems, rpm, pr1, selectedClientId, clients, customRates, driverPercentage]);

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

  const updateCustomRate = (serviceName, baseRate, unitQuantity) => {
    setCustomRates(prev => ({
      ...prev,
      [serviceName]: { baseRate, unitQuantity }
    }));
  };

  // Helper to apply percentage
  const getPercentageValue = (originalTotal) => {
    return (originalTotal * (driverPercentage / 100)).toFixed(2);
  };
  
  // ── CHANGED: Vehicle Year Validation Handler ──────────────────────────────
  const handleVehicleYearChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit length
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 4) {
      setVehicleYear(numericValue);
    }
  };

  const handleVehicleYearBlur = () => {
    // Validate on blur: exactly 4 digits
    if (vehicleYear && vehicleYear.length !== 4) {
      toast.error('Enter valid vehicle year ');
      // Optional: setVehicleYear(''); // Clear if strict
    }
  };

  const handleSubmit = async () => {
    // CHANGED: Validation for Vehicle Year
    if (vehicleYear && vehicleYear.length !== 4) {
      toast.error('Enter valid vehicle year ');
      return;
    }

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

    const services = [];

    selectedServiceIds.forEach(id => {
      const service = currentServices.find(s => s._id === id);
      if (service) {
        const custom = getCustomRate(service.name);
        services.push({
          _id: service._id,
          name: service.name,
          type: service.type,
          baseRate: custom.baseRate !== undefined ? custom.baseRate : service.baseRate,
          inputUnits: service.type === 'fixed' ? 1 : 0
        });
      }
    });

    if (rems && Number(rems) > 0) {
      const remsService = clients.find(c => c._id === selectedClientId)?.services.find(s => s.name === 'REMS:KMS ENROUTE');
      if (remsService) {
        const custom = getCustomRate('REMS:KMS ENROUTE');
        services.push({
          _id: remsService._id,
          name: remsService.name,
          type: remsService.type,
          baseRate: custom.baseRate !== undefined ? custom.baseRate : remsService.baseRate,
          inputUnits: Number(rems),
          freeUnits: remsService.freeUnits || 0,
          unitType: "km"
        });
      }
    }

    if (rpm && Number(rpm) > 0) {
      const rpmService = clients.find(c => c._id === selectedClientId)?.services.find(s => s.name === 'RPM:KMS UNDER TOW');
      if (rpmService) {
        const custom = getCustomRate('RPM:KMS UNDER TOW');
        services.push({
          _id: rpmService._id,
          name: rpmService.name,
          type: rpmService.type,
          baseRate: custom.baseRate !== undefined ? custom.baseRate : rpmService.baseRate,
          inputUnits: Number(rpm),
          freeUnits: rpmService.freeUnits || 0,
          unitType: "km"
        });
      }
    }

    if (pr1 && Number(pr1) > 0) {
      const pr1Service = clients.find(c => c._id === selectedClientId)?.services.find(s => s.name === 'PR1:WAITING TIME');
      if (pr1Service) {
        const custom = getCustomRate('PR1:WAITING TIME');
        services.push({
          _id: pr1Service._id,
          name: pr1Service.name,
          type: pr1Service.type,
          baseRate: custom.baseRate !== undefined ? custom.baseRate : pr1Service.baseRate,
          inputUnits: Number(pr1),
          freeUnits: pr1Service.freeUnits || 0,
          unitType: "unit",
          unitQuantity: custom.unitQuantity !== undefined ? custom.unitQuantity : 31
        });
      }
    }

    // Prepare vehicle object
    const vehicle = {};
    if (vehicleYear && !isNaN(vehicleYear) && Number(vehicleYear) >= 1900) {
      vehicle.year = Number(vehicleYear);
    }
    if (vehicleMake.trim()) vehicle.make = vehicleMake.trim();
    if (vehicleModel.trim()) vehicle.model = vehicleModel.trim();
    if (vinNumber.trim()) vehicle.vin = vinNumber.trim();

    // Prepare comments array
    const commentsArray = comments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(note => ({ note }));

    const localDateTime = new Date(date + 'T00:00:00');
    const isoDate = date;

    const body = {
      phoneNumber: callNumber,
      clientId: selectedClientId,
      services,
      date: isoDate,
      ...(Object.keys(vehicle).length > 0 && { vehicle }),
      ...(commentsArray.length > 0 && { comments: commentsArray })
    };

    try {
      console.log('Submitting to v2:', JSON.stringify(body, null, 2));
      const res = await fetch(`${Baseurl}/driver/submitCall/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const responseData = await res.json();
      if (res.ok) {
        toast.success('Call submitted successfully!');
        setSubmittedCall(responseData.call);
        handleReset();
        navigate('/driver/callrecord');
      } else {
        toast.error(responseData.message || 'Error submitting call');
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
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
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    setCurrentServices([]);
    setSubmittedCall(null);
    setServicesTotal(0);
    setCustomRates({});

    // Reset vehicle & comments fields
    setVehicleYear('');
    setVehicleMake('');
    setVehicleModel('');
    setVinNumber('');
    setComments('');
  };

  return (
    <div className="p-4 sm:p-6 dark:bg-[#080F25]">
      <div
        className="bg-white dark:bg-[#101935] shadow:sm dark:shadow-none rounded-[8px] p-3 sm:p-6 md:p-8 lg:p-[62px] w-[100%] mx-auto mt-[0] sm:mt-10"
      >
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <h2 className="text-[#1E293B] dark:text-white text-[16px] sm:text-xl md:text-[24px] font-semibold">
            Input call details
          </h2>
          <p className="text-[#0078bd] text-[14px] dark:text-blue-400 sm:text-[16px] font-semibold">
            Total: ${servicesTotal}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={handleClientChange}
              className=" dark:[&>option]:bg-[#101935] dark:[&>option]:text-white w-full border border-[#DADDE2] bg-[#FAFAFC]  dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
              required
            >
              <option value="" className="dark:text-white">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id} className="dark:text-white">{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[#11px] sm:text-[14px] mb-1 sm:mb-2">
              Call # <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              placeholder="Enter call number"
              className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] appearance-none cursor-pointer dark:[color-scheme:dark]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Service
            </label>
            <select
              value=""
              onChange={handleServiceChange}
              className=" dark:[&>option]:bg-[#101935] dark:[&>option]:text-white w-full border border-[#DADDE2] bg-[#FAFAFC]  dark:bg-[#0078BD3D]  dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1  "
              disabled={isSubmitting || !selectedClientId}
            >
              <option value="" className="dark:text-white">Select a Service</option>
              {currentServices
                .filter(service => !selectedServiceIds.includes(service._id))
                .map(service => (
                  <option key={service._id} value={service._id} className="dark:text-white">{service.name}</option>
                ))}
            </select>
            {selectedServiceIds.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {selectedServiceIds.map((serviceId) => {
                  const service = currentServices.find(s => s._id === serviceId);
                  // Using helper to apply percentage to Service Tags
                  const calc = service ? calculateService(service.name) : { total: 0 };
                  const displayTotal = getPercentageValue(calc.total);
                  
                  return (
                    <div
                      key={serviceId}
                      className="flex items-center text-[13px] text-[#555555] dark:text-gray-300 bg-white dark:bg-gray-800 border border-[#DADDE2] dark:border-gray-600 rounded-full px-2.5 py-0.5"
                    >
                      <span>
                        {service?.name || 'Unknown'} 
                        <span 
                          className="text-[#0078bd] robotosemibold cursor-pointer hover:underline dark:text-blue-400"
                          onClick={() => setShowServiceModal(serviceId)}
                        > ${displayTotal}</span>
                      </span>
                      <button
                        onClick={() => handleRemoveService(serviceId)}
                        className="ml-2 text-[#555555] hover:text-[#333333] focus:outline-none cursor-pointer dark:text-gray-400 dark:hover:text-white"
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
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Rems (Kms Enroute)
            </label>
            <input
              type="number"
              value={rems}
              onChange={(e) => setRems(e.target.value)}
              placeholder="Enter Kms Enroute"
              min="0"
              className="w-full border border-[#DADDE2] bg-[#FAFAFC]  dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {/* Applying percentage to REMS total */}
            {calculateService('REMS:KMS ENROUTE', rems).total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555] dark:text-gray-300">
                <p 
                  className="text-[#0078BD] robotosemibold cursor-pointer hover:underline dark:text-blue-400"
                  onClick={() => setShowRemsModal(true)}
                >
                  ${getPercentageValue(calculateService('REMS:KMS ENROUTE', rems).total)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Rpm (Kms Under Tow)
            </label>
            <input
              type="number"
              value={rpm}
              onChange={(e) => setRpm(e.target.value)}
              placeholder="Enter Kms Under Tow"
              min="0"
              className="w-full border border-[#DADDE2] bg-[#FAFAFC]  dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {/* Applying percentage to RPM total */}
            {calculateService('RPM:KMS UNDER TOW', rpm).total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555] dark:text-gray-300">
                <p 
                  className="text-[#0078BD] robotosemibold cursor-pointer hover:underline dark:text-blue-400"
                  onClick={() => setShowRpmModal(true)}
                >
                  ${getPercentageValue(calculateService('RPM:KMS UNDER TOW', rpm).total)}
                </p>
              </div>
            )}
          </div>

          {/* ── New Disabled Field for Driver Percentage ────────────────────────────── */}
          {/* <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
              Driver Earnings (%)
            </label>
            <input
              type="text"
              value={driverPercentage !== 0 ? `${driverPercentage}%` : '--'}
              disabled
              className="w-full border border-[#DADDE2] bg-[#EEEEEE] dark:bg-[#1a2639] dark:border-[#0078BD66] text-gray-500 dark:text-gray-400 rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] cursor-not-allowed"
            />
          </div> */}

          <div>
            <label className="block text-[#1E293B] dark:text-[#CECFD3]  text-[11px] sm:text-[14px] robotomedium mb-1 sm:mb-2">
              Pr1 (Waiting Time in Minutes)
            </label>
            <input
              type="number"
              value={pr1}
              onChange={(e) => setPr1(e.target.value)}
              placeholder="Enter Waiting Time (minutes)"
              min="0"
              className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
              disabled={isSubmitting || !selectedClientId}
            />
            {/* Applying percentage to PR1 total */}
            {calculateService('PR1:WAITING TIME', pr1).total > 0 && (
              <div className="mt-2 text-[10px] sm:text-[12px] text-[#555555] dark:text-gray-300">
                <p 
                  className="text-[#0078BD] robotosemibold cursor-pointer hover:underline dark:text-blue-400"
                  onClick={() => setShowPr1Modal(true)}
                >
                  ${getPercentageValue(calculateService('PR1:WAITING TIME', pr1).total)}
                </p>
              </div>
            )}
          </div>

          {/* CHANGED: Vehicle Year Input Handler */}
          <VehicleInfoSection
            vehicleYear={vehicleYear}
            setVehicleYear={setVehicleYear}
            // Pass custom handler for validation
            handleVehicleYearChange={handleVehicleYearChange} 
            handleVehicleYearBlur={handleVehicleYearBlur}
            vehicleMake={vehicleMake}
            setVehicleMake={setVehicleMake}
            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}
            vinNumber={vinNumber}
            setVinNumber={setVinNumber}
            comments={comments}
            setComments={setComments}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="flex flex-row justify-end mt-3 sm:mt-6 gap-2 sm:gap-3">
          <button 
            onClick={handleReset} 
            className="px-3 py-1.5 sm:px-5 sm:py-2 w-50 rounded-md border bg-[#F6F7F8] robotomedium border-[#DADDE2] text-[#475569] text-[11px] sm:text-[14px] order-2 sm:order-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-[32px] py-[8px] sm:px-5 sm:py-2 w-50 rounded-md bg-[#0078BD] text-white text-[11px] sm:text-[14px] order-1 sm:order-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent robotomedium rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* CHANGED: Passing driverPercentage to Modals */}
      <PriceModal
        isOpen={showRemsModal}
        onClose={() => setShowRemsModal(false)}
        title="REMS: Kms Enroute"
        data={calculateService('REMS:KMS ENROUTE', rems)}
        driverPercentage={driverPercentage}
        onSave={(baseRate) => updateCustomRate('REMS:KMS ENROUTE', baseRate, undefined)}
      />
      <PriceModal
        isOpen={showRpmModal}
        onClose={() => setShowRpmModal(false)}
        title="RPM: Kms Under Tow"
        data={calculateService('RPM:KMS UNDER TOW', rpm)}
        driverPercentage={driverPercentage}
        onSave={(baseRate) => updateCustomRate('RPM:KMS UNDER TOW', baseRate, undefined)}
      />
      <PriceModal
        isOpen={showPr1Modal}
        onClose={() => setShowPr1Modal(false)}
        title="PR1: Waiting Time"
        data={calculateService('PR1:WAITING TIME', pr1)}
        driverPercentage={driverPercentage}
        onSave={(baseRate, unitQuantity) => updateCustomRate('PR1:WAITING TIME', baseRate, unitQuantity)}
      />
      {showServiceModal && (() => {
        const service = currentServices.find(s => s._id === showServiceModal);
        const calc = service ? calculateService(service.name) : {};
        return (
          <PriceModal
            isOpen={true}
            onClose={() => setShowServiceModal(null)}
            title={service?.name || 'Service'}
            data={calc}
            driverPercentage={driverPercentage}
            onSave={(baseRate) => updateCustomRate(service.name, baseRate, undefined)}
          />
        );
      })()}

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