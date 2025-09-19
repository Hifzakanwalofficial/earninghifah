import React from 'react'
import { BsArrowUpRight } from "react-icons/bs";

const Cards = () => {
  return (
    <div className="flex gap-4 mb-[32px]">
      {/* Left Card */}
      <div className="w-1/2 bg-[#0078BD] px-[14px] py-[22px] rounded-[8px] flex items-center justify-between">
        <div>
          <p className="text-white robotomedium text-[20px]">Total Earnings</p>
          <p className="text-white robotomedium text-[14px] my-[14px]">
            As of September 18, 2025
          </p>
          <p className="text-[#ffffff] text-[14px] robotomedium flex gap-2">
            <BsArrowUpRight /> 12.5% Last month
          </p>
        </div>
        <div className="robotobold text-white text-[32px]">$12,530.75</div>
      </div>

      {/* Right Card */}
      <div
        className="w-1/2 bg-white px-[14px] py-[22px] rounded-[8px]"
        style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
      >
        <p className="text-[#1E293B] text-[14px] robotomedium">
          15-Day Earnings Summary
        </p>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[#475569] text-[14px] robotomedium">
            Earnings for the current 15-days cycle
          </p>
          <p className="text-[#0078BD] robotobold text-[20px]">
            $12,530.75
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full mt-3">
          <div className="bg-[#0078BD] h-[6px] rounded-full w-[55%]"></div>
        </div>

        <p className="text-[#475569] text-[14px] robotomedium mt-2">
          7 Days remaining in Cycle
        </p>
      </div>
    </div>
  );
};

export default Cards;
