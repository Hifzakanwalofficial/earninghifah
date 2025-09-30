import React from "react";

const Violationlog = () => {
  return (
    <div>
      <p className="text-[24px] robotosemibold mb-[24px]">Violation Log</p>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="bg-[#FAFAFC]">
            <th className="p-2 text-left">Violation ID</th>
            <th className="p-2 text-left">Truck Plate</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Admin Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr className="">
            <td className="p-2">TR123</td>
            <td className="p-2">TR123</td>
            <td className="p-2">$150</td>
            <td className="p-2">Paid</td>
            <td className="p-2">Paid</td>
            <td className="p-2">N/A</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Violationlog;