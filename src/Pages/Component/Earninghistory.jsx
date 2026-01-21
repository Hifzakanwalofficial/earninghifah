import React, { useState, useEffect } from "react";
import { Baseurl } from "../../Config";

const Earninghistory = ({ fromDate: parentFromDate, toDate: parentToDate }) => {
  const [data, setData] = useState([]);
  const [allCalls, setAllCalls] = useState([]); 
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  
  // STATE TO HOLD PERCENTAGE FROM API
  const [currentPercentage, setCurrentPercentage] = useState(50); 

  const [totals, setTotals] = useState({
    totalCalls: 0, totalSubtotal: 0, totalHst: 0, totalEarnings: 0,
    totalRemsSubtotal: 0, totalRemsHst: 0, totalRpmSubtotal: 0, totalRpmHst: 0,
    totalPr1Subtotal: 0, totalPr1Hst: 0, totalRems: 0, totalRpm: 0, totalPr1: 0,
    pr1RpmRemsSubtotal: 0, pr1RpmRemsHst: 0, pr1RpmRemsEarnings: 0,
    percentageEarnings: 0,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // SUMMARY API
      const url = new URL(`${Baseurl}/driver/lifetime-progress`);
      if (parentFromDate) url.searchParams.append("startDate", parentFromDate);
      if (parentToDate) url.searchParams.append("endDate", parentToDate);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const apiData = await response.json();
      
      // Dynamic percentage from API
      const percentageFromApi = Number(apiData.percentage || 50);
      setCurrentPercentage(percentageFromApi);

      const mappedData = (apiData.dailyStats || []).map((stat) => {
        const [year, month, day] = stat.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        return {
          rawDate: localDate,
          date: stat.date.split('-').reverse().join('/'),
          amount: `$${Number(stat.earnings || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          // Daily driver earning = daily earnings * percentage / 100
          calculatedEarning: (Number(stat.earnings || 0) * percentageFromApi) / 100,
          earnings: Number(stat.earnings || 0),
          rems: Number(stat.rems || 0),
          remsSubtotal: Number(stat.remsSubtotal || 0),
          remsHst: Number(stat.remsHst || 0),
          rpm: Number(stat.rpm || 0),
          rpmSubtotal: Number(stat.rpmSubtotal || 0),
          rpmHst: Number(stat.rpmHst || 0),
          pr1: Number(stat.pr1 || 0),
          pr1Subtotal: Number(stat.pr1Subtotal || 0),
          pr1Hst: Number(stat.pr1Hst || 0),
          calls: Number(stat.calls || 0),
          hst: Number(stat.hst || 0),
          subtotal: Number(stat.subtotal || 0),
        };
      });

      const sortedData = [...mappedData].sort((a, b) => b.rawDate - a.rawDate);
      setData(sortedData);

      // CALLS API (dropdown details - already using percentageEarning)
      const callsUrl = new URL(`${Baseurl}/driver/getDriverCalls?limit=0`);
      if (parentFromDate) callsUrl.searchParams.append("startDate", parentFromDate);
      if (parentToDate) callsUrl.searchParams.append("endDate", parentToDate);

      const callsRes = await fetch(callsUrl, { headers: { Authorization: `Bearer ${token}` } });
      const callsJson = await callsRes.json();

      const detailedCalls = (callsJson.data || []).map(call => {
        const dateStr = call.date.split("T")[0];
        const [y, m, d] = dateStr.split("-");
        const boostService = call.servicesUsed.find(s =>
          s.name.includes("BOOST") || s.name.includes("LOCKOUT") || s.name.includes("TIRE") || s.name.includes("DOLLIES")
        );

        return {
          id: call._id,
          date: `${d}/${m}/${y}`,
          callNo: call.phoneNumber || "-",
          client: call.client || "Unknown",
          serviceName: boostService ? boostService.name.split(":")[0] : "N/A",
          rems: call.servicesUsed.find(s => s.name.includes("REMS"))?.unitQuantity || 0,
          rpm: call.servicesUsed.find(s => s.name.includes("RPM"))?.unitQuantity || 0,
          pr1: call.servicesUsed.find(s => s.name.includes("PR1") || s.name.includes("WAITING"))?.unitQuantity || 0,
          totalEarnings: Number(call.percentageEarning || call.totalEarnings || 0),
        };
      });
      setAllCalls(detailedCalls);

      // NEW: Calculate driver totals using dynamic percentage
      const fullSubtotal = Number(apiData.totals?.totalSubtotal || 0);
      const fullHst      = Number(apiData.totals?.totalHst || 0);

      const driverSubtotal = fullSubtotal * (percentageFromApi / 100);
      const driverHst      = fullHst      * (percentageFromApi / 100);
      const driverEarnings = driverSubtotal + driverHst;   // should ≈ apiData.percentageEarnings

      setTotals(prev => ({
        ...prev,
        totalCalls: Number(apiData.totals?.totalCalls || 0),
        totalSubtotal: driverSubtotal,
        totalHst: driverHst,
        totalEarnings: driverEarnings,          // not used in UI anymore
        percentageEarnings: Number(apiData.percentageEarnings || driverEarnings),
        // Keeping other fields for REMS/RPM/PR1 counts (not affected by %)
        totalRems: Number(apiData.dailyStats?.reduce((sum, d) => sum + (d.rems || 0), 0) || 0),
        totalRpm: Number(apiData.dailyStats?.reduce((sum, d) => sum + (d.rpm || 0), 0) || 0),
        totalPr1: Number(apiData.dailyStats?.reduce((sum, d) => sum + (d.pr1 || 0), 0) || 0),
        pr1RpmRemsSubtotal: Number(apiData.totals?.pr1RpmRemsSubtotal || 0),
        pr1RpmRemsHst: Number(apiData.totals?.pr1RpmRemsHst || 0),
      }));

    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parentFromDate, parentToDate]);

  useEffect(() => {
    if (!data.length || !parentFromDate || !parentToDate) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(item => {
      const itemDateStr = item.rawDate.toISOString().split('T')[0];
      return itemDateStr >= parentFromDate && itemDateStr <= parentToDate;
    });
    setFilteredData(filtered);
  }, [data, parentFromDate, parentToDate]);

  // Removed the old reduce calculation because we now use API totals + percentage

  const CallDetailsDropdown = ({ date }) => {
    const calls = allCalls.filter(c => c.date === date);
    if (calls.length === 0) return null;

    const sortedCalls = [...calls].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateB - dateA;
    });

    return (
      <div className="col-span-6 mt-3 mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white dark:bg-[#062849]">
            <thead className="bg-gray-200 text-black dark:bg-[#062849] dark:text-white border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="ps-4 font-normal py-3 text-left w-[23%]">Client Name</th>
                <th className="px-4 py-3 font-normal text-left w-[5%]">Call No</th>
                <th className="px-1 font-normal py-3 text-center">REMS</th>
                <th className="ps-9 font-normal py-3 text-center">RPM</th>
                <th className="ps-9 font-normal py-3 text-center">PR1</th>
                <th className="ps-4 font-normal py-3 text-right pr-6">Total</th>
              </tr>
            </thead>

            <tbody>
              {sortedCalls.map((call, idx) => (
                <tr
                  key={call.id}
                  className={`${
                    idx % 2 === 0
                      ? 'bg-gray-100 dark:bg-[#062849]'
                      : 'bg-white dark:bg-[#062849]'
                  } border-t border-gray-300 dark:border-gray-700`}
                >
                  <td className="ps-4 py-3 text-black dark:text-white">{call.client}</td>
                  <td className="px-4 py-3 font-medium text-black dark:text-white">{call.callNo}</td>
                  <td className="px-4 py-3 text-center text-black dark:text-white">
                    {call.rems > 0 ? call.rems.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-black dark:text-white">
                    {call.rpm > 0 ? call.rpm.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-black dark:text-white">
                    {call.pr1 > 0 ? call.pr1.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right pr-6 font-bold text-[#0078BD] dark:text-[#0078BD]">
                    ${call.totalEarnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TableShimmer = () => (
    <div className="bg-white dark:bg-[#080F25] rounded-[8px] p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse mb-2"></div>
          <div className="w-56 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
        </div>
        <div className="w-48 h-10 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-6 border-b border-[#0078BD66] pb-2 h-[56px]">
          <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse mx-auto"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse ml-auto"></div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 py-2 border-b border-[#0078BD66] h-[56px]">
            <div className="w-16 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse mx-auto"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-[#080F25] rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <TableShimmer />;

  if (isMobile) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#1E293B] dark:text-white text-[16px] font-semibold">Earning History</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div key={`${item.rawDate.getTime()}-${index}`} className="bg-white dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:shadow-none shadow-[0px_0px_10px_0px_#E3EBFC] rounded-lg p-4 border border-[#EAEFF4]">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-base robotomedium text-[#334155] dark:text-[#CECFD3]">{item.date}</p>
                  <p className="text-lg robotosemibold text-[#2AAC5A]">{`$${item.calculatedEarning.toFixed(2)}`}</p>
                </div>
                <p className="text-sm dark:text-[#CECFD3] border-b border-[#EAEFF4] dark:border-[#0078BD66] pb-1.5 robotomedium text-[#67778E99] mb-3 cursor-pointer hover:text-[#0078BD]"
                  onClick={() => setExpandedDate(expandedDate === item.date ? null : item.date)}
                >
                  {item.calls > 0 ? `${item.calls} Call${item.calls > 1 ? 's' : ''} ${expandedDate === item.date ? '↑' : '↓'}` : '0 Calls'}
                </p>

                {expandedDate === item.date && <CallDetailsDropdown date={item.date} />}

                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] robotomedium">
                    <p className="text-gray-500 dark:text-[#CECFD3]">REMS</p>
                    <p className="text-[#334155] dark:text-[#CECFD3]">{item.rems > 0 ? Number(item.rems).toLocaleString("en-US") : "-"}</p>
                  </div>
                  <div className="flex justify-between text-[12px] robotomedium">
                    <p className="text-gray-500 font-medium dark:text-[#CECFD3]">RPM</p>
                    <p className="text-[#334155] font-medium dark:text-[#CECFD3]">{item.rpm > 0 ? Number(item.rpm).toLocaleString("en-US") : "-"}</p>
                  </div>
                  <div className="flex justify-between text-[12px] robotomedium">
                    <p className="text-gray-500 dark:text-[#CECFD3]">PR1</p>
                    <p className="text-[#334155] dark:text-[#CECFD3]">{item.pr1 > 0 ? Number(item.pr1).toLocaleString("en-US") : "-"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[14px] text-[#334155] py-8 text-center">
              {error ? "Unable to load data. Please try again." : "No earnings data available for selected date range."}
            </div>
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="mt-6 bg-[#FFFFFF] dark:bg-[#0078BD3D] dark:border-[#0078BD66] dark:shadow-none shadow-[0px_0px_10px_0px_#E3EBFC] p-4 border-t border-[#E2E8F0] rounded-[8px]">
            <div className="space-y-3 text-[14px] font-semibold text-[#1E293B] dark:text-[#CECFD3]">
              <div className="flex justify-between"><p className="text-[#5C5C5C] dark:text-[#CECFD3]">Total Calls:</p><p>{totals.totalCalls > 0 ? totals.totalCalls : "-"}</p></div>
              <div className="flex justify-between"><p className="text-[#5C5C5C] dark:text-[#CECFD3]">Total REMS:</p><p>{totals.totalRems > 0 ? totals.totalRems.toLocaleString("en-US") : "-"}</p></div>
              <div className="flex justify-between"><p className="text-[#5C5C5C] dark:text-[#CECFD3]">Total RPM:</p><p>{totals.totalRpm > 0 ? totals.totalRpm.toLocaleString("en-US") : "-"}</p></div>
              <div className="flex justify-between"><p className="text-[#5C5C5C] dark:text-[#CECFD3]">Total PR1:</p><p>{totals.totalPr1 > 0 ? totals.totalPr1.toLocaleString("en-US") : "-"}</p></div>
              <div className="flex justify-between"><p>Total HST:</p><p>{totals.totalHst > 0 ? `$${Number(totals.totalHst).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}</p></div>
              <div className="flex justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#0078BD66] font-bold text-[#333333]">
                <p>Total Earnings:</p>
                <p className="text-[#2AAC5A]">
                  {totals.percentageEarnings > 0 ? `$${Number(totals.percentageEarnings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DESKTOP VIEW
  return (
    <div className="bg-white dark:bg-[#101935] rounded-[8px] p-5 shadow-md dark:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#1E293B] dark:text-white text-[16px] font-semibold">Earning History</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-[#101935] border border-red-200 rounded-md">
          <p className="text-red-600 text-[14px]">{error}</p>
        </div>
      )}

      <div
        className="mt-4 h-[300px] overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarColor: 'oklch(var(--s)) oklch(var(--p))',
          scrollbarWidth: 'thin',
        }}
      >
        <style>
          {`
            ::-webkit-scrollbar-button {
              background: transparent;
              height: 0px;
              width: 0px;
            }
            ::-webkit-scrollbar-corner {
              background: transparent;
            }
          `}
        </style>
        <div className="grid grid-cols-6 text-[14px] font-semibold text-[#475569] dark:text-white border-b-2 border-[#E2E8F0] dark:border-[#263463] pb-2 h-[56px] items-end">
          <p>Date</p><p className="text-center">Calls</p><p>REMS</p><p>RPM</p><p>PR1</p><p className="text-right pe-5">Earnings</p>
        </div>

        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={`${item.rawDate.getTime()}-${index}`}>
              <div className="grid grid-cols-6 text-[14px] text-[#334155] dark:text-[#95A0C6] py-2 dark:border-[#263463] border-b border-[#E2E8F0] h-[56px] items-end">
                <p>{item.date}</p>
                <p 
                  className="text-center font-bold text-[#0078BD] dark:text-[#60A5FA] cursor-pointer hover:underline"
                  onClick={() => setExpandedDate(expandedDate === item.date ? null : item.date)}
                >
                  {item.calls}{' '}
                  {expandedDate === item.date ? (
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </p>
                <p>{item.rems === 0 ? "-" : Number(item.rems).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>{item.rpm === 0 ? "-" : Number(item.rpm).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>{item.pr1 === 0 ? "-" : Number(item.pr1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-right font-medium pe-5">{item.calculatedEarning === 0 ? "-" : `$${item.calculatedEarning.toFixed(2)}`}</p>
              </div>
              {expandedDate === item.date && <CallDetailsDropdown date={item.date} />}
            </div>
          ))
        ) : (
          <div className="text-[14px] text-[#334155] dark:text-white py-4 text-center h-[56px] items-end">
            {error ? "Unable to load data. Please try again." : "No earnings data available for selected date range."}
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-[#E2E8F0] dark:border-[#263463] flex">
          <div className="w-1/2 p-4 border-r border-[#E2E8F0] dark:border-[#263463]">
            <div className="flex justify-between text-[14px] font-semibold text-[#1E293B] border-b border-[#E2E8F0] dark:border-[#263463] pb-2">
              <p className="text-[15px] dark:text-[#95A0C6]">Total Calls: </p>
              <p className="text-[15px] dark:text-[#95A0C6]"><span>{totals.totalCalls === 0 ? "-" : totals.totalCalls}</span></p>
            </div>
            <div className="flex mt-3 justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px] dark:text-[#95A0C6]">Subtotal:</p>
              <p className="text-[15px] dark:text-[#95A0C6]">
                {totals.totalSubtotal === 0 ? "-" : `$${Number(totals.totalSubtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="flex py-1 justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px] dark:text-[#95A0C6]">Total HST:</p>
              <p className="text-[15px] dark:text-[#95A0C6]">
                {totals.totalHst === 0 ? "-" : `$${Number(totals.totalHst).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="flex justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px] dark:text-[#95A0C6]">Total Earnings:</p>
              <p className="text-[15px] dark:text-[#95A0C6]">
                {totals.percentageEarnings === 0
                  ? "-"
                  : `$${Number(totals.percentageEarnings).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`}             
              </p>
            </div>
          </div>
          <div className="w-1/2 p-4">
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">
              <p>Total REMS:</p><p>{totals.totalRems === 0 ? "-" : Number(totals.totalRems).toLocaleString("en-US")}</p>
            </div>
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B] dark:text-[#95A0C6] mt-1">
              <p>Total RPM:</p><p>{totals.totalRpm === 0 ? "-" : Number(totals.totalRpm).toLocaleString("en-US")}</p>
            </div>
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B] dark:text-[#95A0C6] mt-1">
              <p>Total PR1:</p><p>{totals.totalPr1 === 0 ? "-" : Number(totals.totalPr1).toLocaleString("en-US")}</p>
            </div>
            <div className="border-t border-[#E2E8F0] dark:border-[#263463] mt-4 pt-3">
              <div className="flex justify-between">
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">Subtotal:</p>
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">
                  {totals.totalSubtotal === 0 ? "-" : `$${Number(totals.totalSubtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">HST:</p>
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">
                  {totals.totalHst === 0 ? "-" : `$${Number(totals.totalHst).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">Total:</p>
                <p className="text-[15px] font-semibold text-[#1E293B] dark:text-[#95A0C6]">
                  {totals.percentageEarnings === 0
                    ? "-"
                    : `$${Number(totals.percentageEarnings).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}              
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earninghistory;