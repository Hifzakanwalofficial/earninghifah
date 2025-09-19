import React, { useState } from "react";

const Form = () => {
  const [emergencyReroute, setEmergencyReroute] = useState(true);
  const [expressPickup, setExpressPickup] = useState(false);

  return (
    <div
      className="bg-white rounded-[8px] p-[62px]  w-[100%] mx-auto"
      style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
    >
      {/* Title */}
      <h2 className="text-[#1E293B] text-[24px] font-semibold mb-6">
        Driver inputs the calls
      </h2>

      {/* Grid Form */}
      <div className="grid grid-cols-2 gap-6">
        {/* Call # */}
        <div>
          <label className="block text-[#1E293B] text-[14px] robotomedium mb-2">Call #</label>
          <input
            type="text"
            placeholder="Enter call number"
            className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-[#1E293B] text-[14px] mb-2 robotomedium" >Client</label>
          <select className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]">
            <option>Select a client</option>
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="block text-[#1E293B] text-[14px] mb-2 robotomedium">Service</label>
          <select className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B] bg-[#F8FAFC]">
            <option>Select a Service</option>
          </select>
        </div>

        {/* Rems */}
        <div>
          <label className="block text-[#1E293B] text-[14px] mb-2 robotomedium">Rems</label>
          <input
            type="text"
            placeholder="Enter rems"
            className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          />
        </div>

        {/* Rpm */}
        <div>
          <label className="block text-[#1E293B] text-[14px] mb-2 robotomedium">Rpm</label>
          <input
            type="text"
            placeholder="Enter rpm"
            className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          />
        </div>

        {/* Pr1 */}
        <div>
          <label className="block text-[#1E293B] text-[14px] mb-2 robotomedium">Pr1</label>
          <input
            type="text"
            placeholder="Enter pr1"
            className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-[14px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#00C26B]"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[#1E293B] text-[14px] robotomedium">Emergency Reroute</span>
          <button
            onClick={() => setEmergencyReroute(!emergencyReroute)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              emergencyReroute ? "bg-[#00C26B]" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                emergencyReroute ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#1E293B] text-[14px] robotomedium">Express Lane Pickup</span>
          <button
            onClick={() => setExpressPickup(!expressPickup)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              expressPickup ? "bg-[#00C26B]" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                expressPickup ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-6 gap-3">
        <button className="px-5 py-2 rounded-md border border-[#CBD5E1] text-[#475569] text-[14px]">
          Reset
        </button>
        <button className="px-5 py-2 rounded-md bg-[#0077CC] text-white text-[14px]">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Form;
