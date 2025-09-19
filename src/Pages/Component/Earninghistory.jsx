import React from 'react';

const Earninghistory = () => {
  const data = [
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
    { date: "Jul 28", amount: "$250.00" },
  ];

  return (
    <div
      className="bg-white rounded-[8px] p-5"
      style={{ boxShadow: "0px 0px 16px #E3EBFC" }}
    >
      {/* Header */}
      <h2 className="text-[#1E293B] text-[16px] font-semibold">
        Earning History
      </h2>
      <p className="text-[#64748B] text-[14px] mt-1">
        Detailed View of earnings by date.
      </p>

      {/* Table */}
      <div className="mt-4">
        <div className="grid grid-cols-2 text-[14px] font-semibold text-[#475569] border-b border-[#E2E8F0] pb-2">
          <p>Date</p>
          <p className="text-right">Amounts</p>
        </div>

        {data.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-2 text-[14px] text-[#334155] py-2 border-b border-[#E2E8F0]"
          >
            <p>{item.date}</p>
            <p className="text-right">{item.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Earninghistory;
