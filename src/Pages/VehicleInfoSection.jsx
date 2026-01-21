import React from 'react';

const VehicleInfoSection = ({
  vehicleYear,
  setVehicleYear,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vinNumber,      // ← Added prop
  setVinNumber,   // ← Added prop
  comments,
  setComments,
  isSubmitting
}) => {
  return (
    <>
      {/* Visual separation + title */}
      <div className="col-span-1 sm:col-span-2 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-[#1E293B] dark:text-white text-[16px] sm:text-xl md:text-[24px] font-semibold">
          Vehicle Information & Notes
        </h3>
      </div>

      <div>
        <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
          Vehicle Year
        </label>
        <input
          type="number"
          value={vehicleYear}
          onChange={(e) => setVehicleYear(e.target.value)}
          placeholder="e.g. 2026"
          min="1900"
          max={new Date().getFullYear() + 2}
          className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
          Vehicle Make
        </label>
        <input
          type="text"
          value={vehicleMake}
          onChange={(e) => setVehicleMake(e.target.value)}
          placeholder="e.g. Toyota, Honda, Suzuki"
          className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          disabled={isSubmitting}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
          Vehicle Model
        </label>
        <input
          type="text"
          value={vehicleModel}
          onChange={(e) => setVehicleModel(e.target.value)}
          placeholder="e.g. Corolla, F-550, Hilux"
          className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          disabled={isSubmitting}
        />
      </div>

      {/* NEW VIN NUMBER FIELD */}
      <div className="sm:col-span-2">
        <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
          VIN Number
        </label>
        <input
          type="text"
          value={vinNumber}
          onChange={(e) => setVinNumber(e.target.value)}
          placeholder="e.g. 1HGCM82633A004352"
          className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] uppercase"
          disabled={isSubmitting}
          maxLength={17}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-[#1E293B] dark:text-[#CECFD3] text-[11px] sm:text-[14px] mb-1 sm:mb-2 robotomedium">
          Comments / Special Notes
        </label>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter any additional notes (one per line is recommended)"
          className="w-full border border-[#DADDE2] bg-[#FAFAFC] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:text-white rounded-[8px] px-[14px] py-[10px] sm:px-3 sm:py-2 text-[11px] sm:text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] resize-y min-h-[90px]"
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};

export default VehicleInfoSection;