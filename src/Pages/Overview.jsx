import React, { useState, useEffect } from 'react';
import Linechart from './Component/Linechart';
import { FiPhoneCall } from "react-icons/fi";
import { FaDollarSign } from "react-icons/fa";
import Cards from './Component/Cards'

import { PiSpeedometerThin } from "react-icons/pi";
import { BiMessageSquareError } from "react-icons/bi";
import { FaChartLine } from "react-icons/fa6";
import CallByClientsChart from './Component/CallByClientsChart';
import { Baseurl } from '../Config';

// Shimmer placeholder component for stats cards
const ShimmerCard = () => (
  <div className="bg-white px-[14px] py-[24px] rounded-xl shadow animate-pulse flex items-center justify-between">
    <div className="space-y-2 w-full">
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
    <div className='bg-gray-300 h-[40px] w-[40px] rounded-full'></div>
  </div>
);

// Shimmer placeholder for chart area
const ShimmerChart = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[300px] w-full"></div>
);

const Overview = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalRems: 0,
    totalRpm: 0,
    totalPri: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(
          `${Baseurl}/driver/monthly-stats`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch monthly stats');
        }

        const data = await response.json();

        setStats({
          totalCalls: data.totals.totalCalls,
          totalRems: data.totals.totalRems,
          totalRpm: data.totals.totalRpm,
          totalPri: data.totals.totalPr1,
          grandTotal: data.totals.grandTotal,
        });

        setChartData(data.chartData || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Topbar Shimmer */}
        <div className="mb-[44px]">
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>

        {/* Text Shimmer */}
        <div className='mt-[44px] space-y-2'>
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-72 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Chart Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-[100%]">
          <ShimmerChart />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Topbar */}
      <div>
        <p className='robotosemibold text-[24px] mb-[44px]'>Dashboard Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total CALLS</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalCalls}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_915_7518)">
<path d="M11.7094 5.00008C12.5233 5.15889 13.2713 5.55696 13.8577 6.14336C14.4441 6.72976 14.8422 7.4778 15.001 8.29175M11.7094 1.66675C13.4004 1.85461 14.9773 2.61189 16.1812 3.81425C17.3851 5.01662 18.1444 6.59259 18.3344 8.28341M8.5235 11.5526C7.52219 10.5513 6.73153 9.41912 6.15153 8.21111C6.10164 8.1072 6.0767 8.05524 6.05753 7.9895C5.98943 7.75587 6.03835 7.46899 6.18003 7.27113C6.21989 7.21546 6.26752 7.16783 6.36278 7.07257C6.65412 6.78123 6.79979 6.63556 6.89503 6.48908C7.25419 5.93667 7.25419 5.22452 6.89503 4.67211C6.79979 4.52563 6.65412 4.37996 6.36278 4.08862L6.20039 3.92623C5.75752 3.48336 5.53609 3.26192 5.29827 3.14164C4.8253 2.90241 4.26675 2.90241 3.79378 3.14164C3.55596 3.26192 3.33453 3.48336 2.89166 3.92623L2.7603 4.05759C2.31895 4.49894 2.09827 4.71962 1.92973 5.01964C1.74271 5.35257 1.60825 5.86964 1.60938 6.25149C1.61041 6.59562 1.67716 6.8308 1.81067 7.30117C2.52814 9.82901 3.88187 12.2143 5.87185 14.2043C7.86184 16.1943 10.2471 17.548 12.775 18.2655C13.2453 18.399 13.4805 18.4657 13.8246 18.4668C14.2065 18.4679 14.7236 18.3334 15.0565 18.1464C15.3565 17.9779 15.5772 17.7572 16.0186 17.3158L16.1499 17.1845C16.5928 16.7416 16.8142 16.5202 16.9345 16.2824C17.1737 15.8094 17.1737 15.2508 16.9345 14.7779C16.8142 14.5401 16.5928 14.3186 16.1499 13.8758L15.9875 13.7134C15.6962 13.422 15.5505 13.2764 15.404 13.1811C14.8516 12.8219 14.1395 12.822 13.5871 13.1811C13.4406 13.2764 13.2949 13.422 13.0036 13.7134C12.9083 13.8086 12.8607 13.8562 12.805 13.8961C12.6072 14.0378 12.3203 14.0867 12.0866 14.0186C12.0209 13.9994 11.9689 13.9745 11.865 13.9246C10.657 13.3446 9.52482 12.554 8.5235 11.5526Z" stroke="#0078BD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_915_7518">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total REMS</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalRems.toLocaleString()}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_915_7523)">
<path d="M7.9705 0.429688C7.90019 0.5 7.89238 0.558594 7.89238 1.14453V1.77734L7.533 1.87109C6.86503 2.03906 6.13457 2.34766 5.5291 2.71094L5.29472 2.85156L4.88457 2.44531C4.658 2.22266 4.43535 2.01953 4.38457 1.99219C4.19707 1.89844 4.10332 1.96875 3.19316 2.88281C2.38847 3.69141 2.30644 3.78516 2.30644 3.90625C2.30644 4.01953 2.36113 4.09375 2.75175 4.48828L3.19707 4.94141L2.99785 5.27344C2.658 5.83984 2.24394 6.89062 2.16582 7.37891L2.13847 7.53906H1.54082C0.900191 7.53906 0.779097 7.56641 0.708785 7.72266C0.681441 7.78516 0.665816 8.22656 0.665816 9.03906C0.665816 10.6016 0.587691 10.4648 1.47441 10.4766L2.12285 10.4883L2.23222 10.8984C2.29082 11.125 2.4041 11.4766 2.48222 11.6797C2.62285 12.0469 2.99003 12.7773 3.12675 12.9688L3.19707 13.0664L2.75175 13.5234C2.36503 13.918 2.30644 13.9961 2.30644 14.1055C2.30644 14.2227 2.40019 14.3281 3.21269 15.1445C4.04472 15.9805 4.13066 16.0547 4.25566 16.0547C4.37285 16.0547 4.44316 16.0039 4.8416 15.6094L5.29472 15.1602L5.39238 15.2344C5.59941 15.3828 6.02519 15.5938 6.05253 15.5625C6.1541 15.4492 7.15019 13.7305 7.12285 13.7227C7.10332 13.7148 6.94707 13.6289 6.7791 13.5352C5.4666 12.7852 4.53691 11.4883 4.23222 9.96875C4.13847 9.49609 4.13847 8.50391 4.23222 8.04688C4.68535 5.89062 6.30644 4.28906 8.43925 3.88672C8.93925 3.78906 9.77519 3.78906 10.2752 3.88672C12.158 4.24609 13.701 5.57812 14.2947 7.36719C14.5018 7.98438 14.5447 8.28125 14.5525 9.01562L14.5564 9.69531L15.2791 10.8984C15.6736 11.5625 16.0174 12.1016 16.0369 12.0938C16.0955 12.0781 16.3611 11.3711 16.4822 10.9023L16.5916 10.4883L17.24 10.4766C18.1268 10.4648 18.0486 10.6016 18.0486 9.03906C18.0486 8.22656 18.033 7.78516 18.0057 7.72266C17.9353 7.56641 17.8143 7.53906 17.1736 7.53906H16.576L16.5486 7.37891C16.4705 6.89062 16.0564 5.83984 15.7166 5.27344L15.5174 4.94141L15.9627 4.48828C16.3533 4.09375 16.408 4.01953 16.408 3.90625C16.408 3.78516 16.326 3.69141 15.5213 2.88281C14.6111 1.96875 14.5174 1.89844 14.3299 1.99219C14.2791 2.01953 14.0564 2.22266 13.8299 2.44531L13.4158 2.85156L13.2283 2.73438C12.6971 2.39844 11.8103 2.02344 11.1736 1.86719L10.8221 1.78125V1.14453C10.8221 0.558594 10.8143 0.5 10.7439 0.429688C10.6697 0.355469 10.615 0.351562 9.35722 0.351562C8.09941 0.351562 8.04472 0.355469 7.9705 0.429688Z" fill="#0078BD"/>
<path d="M11.725 7.29297C11.6625 7.35547 10.0882 9.94922 8.22105 13.0664C4.96324 18.5117 4.83042 18.7383 4.8187 18.9453C4.79917 19.2031 4.90464 19.418 5.11558 19.5586L5.24839 19.6484H12.0414C18.721 19.6484 18.8343 19.6484 18.9828 19.5703C19.2406 19.4414 19.3851 19.1016 19.307 18.8164C19.2875 18.7422 17.7367 16.1211 15.8617 12.9922C13.225 8.59375 12.4281 7.28906 12.3421 7.24609C12.2835 7.21484 12.1429 7.1875 12.0375 7.1875C11.8734 7.1875 11.8187 7.20703 11.725 7.29297ZM12.4984 10.0234C12.7601 10.1562 12.9007 10.3594 12.9242 10.6367C12.9359 10.8203 12.6507 15.3242 12.596 15.7383C12.5492 16.0898 12.2015 16.2891 11.8656 16.1562C11.6703 16.0781 11.5648 15.9453 11.5375 15.75C11.5296 15.6719 11.4437 14.4961 11.35 13.1367C11.1625 10.3672 11.1585 10.4414 11.4242 10.1758C11.7015 9.90234 12.1273 9.83984 12.4984 10.0234ZM12.3851 17.2266C12.8773 17.4766 12.8734 18.1875 12.3773 18.4414C12.1742 18.543 11.85 18.5312 11.6898 18.4102C11.3382 18.1523 11.2796 17.7031 11.5531 17.3789C11.7523 17.1445 12.1 17.082 12.3851 17.2266Z" fill="#0078BD"/>
</g>
<defs>
<clipPath id="clip0_915_7523">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total RPM</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalRpm.toLocaleString()}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.16124 5.4375C6.65343 5.6875 4.35656 7.08203 2.96593 9.1875C2.33312 10.1484 1.84484 11.4141 1.68077 12.5C1.65734 12.6602 1.62999 12.8516 1.61827 12.918C1.60656 13.0117 1.61437 13.0469 1.65343 13.0469C1.68859 13.0469 1.73156 12.9375 1.77452 12.7266C1.93859 11.9766 2.36046 10.9883 2.79406 10.3516C4.00499 8.57031 5.91124 7.46484 8.04015 7.30859C10.0675 7.15625 12.1691 7.99609 13.5401 9.50781C13.6886 9.67188 13.8253 9.80469 13.8487 9.80469C13.8917 9.80469 16.5792 8.76562 16.6769 8.71484C16.7862 8.65234 15.9659 7.77344 15.2745 7.21484C13.6339 5.89062 11.3292 5.21875 9.16124 5.4375Z" fill="#0078BD"/>
<path d="M13.6211 10.5273L10 11.9453L9.63672 11.9414C9.17969 11.9375 8.91016 12.0352 8.64062 12.2969C8.34375 12.5898 8.26172 12.793 8.26172 13.2617C8.26172 13.5898 8.27734 13.6797 8.35156 13.832C8.49609 14.125 8.69141 14.3203 8.97656 14.4609C9.21094 14.5781 9.26953 14.5898 9.57031 14.5898C9.84375 14.5898 9.94141 14.5703 10.1172 14.4883C10.4141 14.3516 10.5898 14.1875 10.7344 13.9141L10.8594 13.6797L13.582 11.793C15.082 10.7578 16.5352 9.74609 16.8164 9.55469C17.2734 9.23438 17.375 9.13672 17.2773 9.11719C17.2617 9.11328 15.6172 9.75 13.6211 10.5273Z" fill="#0078BD"/>
<path d="M16.1445 10.7148C15.4531 11.1914 14.8867 11.6055 14.8828 11.6367C14.8828 11.6641 14.9258 11.8086 14.9766 11.9492C15.1094 12.3203 15.2734 13.0703 15.3008 13.4492C15.3125 13.625 15.3398 13.8086 15.3555 13.8555L15.3906 13.9453H16.8516C18.1094 13.9453 18.3164 13.9375 18.3594 13.8867C18.4687 13.7578 18.3281 12.3867 18.125 11.5898C17.9648 10.957 17.5234 9.84375 17.4297 9.84375C17.4141 9.84375 16.8359 10.2344 16.1445 10.7148Z" fill="#0078BD"/>
</svg>

          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total PR1</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalPri.toLocaleString()}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_915_7540)">
<path d="M17.5508 0.078125C16.7617 0.285156 15.8555 0.839844 15.0469 1.62109C14.7109 1.94141 14.1445 2.58984 14.082 2.72266C14.082 2.72656 13.2891 2.54688 12.3242 2.32422L10.5664 1.91797L5.28125 7.19922C2.37891 10.1055 0 12.4961 0 12.5195C0 12.5703 7.42969 20 7.48047 20C7.50391 20 9.89844 17.6211 12.8008 14.7188L18.082 9.43359L17.6797 7.67578C17.4531 6.71094 17.2734 5.91797 17.2773 5.91406C17.2812 5.91406 17.4336 5.79688 17.6172 5.65625C18.7539 4.78125 19.6602 3.5 19.9219 2.40625C20.0195 2.01172 20.0234 1.42969 19.9375 1.12891C19.7812 0.601562 19.3945 0.226562 18.832 0.0625C18.5352 -0.0234375 17.9141 -0.015625 17.5508 0.078125ZM18.5977 1.26953C19.0156 1.48828 18.7539 2.52734 18.0352 3.5C17.9258 3.64844 17.6445 3.96094 17.4062 4.19922L16.9766 4.62891L16.9297 4.43359C16.9023 4.32422 16.8359 4.03516 16.7773 3.78516L16.6758 3.32812L16.2969 3.24219C16.0898 3.19531 15.7969 3.12891 15.6523 3.08984L15.3828 3.02734L15.6445 2.74609C16.6211 1.6875 18.0391 0.980469 18.5977 1.26953ZM12.2539 3.55859C12.9141 3.71094 13.4609 3.83984 13.4648 3.84375C13.4688 3.84766 13.4258 3.99219 13.3711 4.16016C13.2812 4.43359 13.2656 4.53906 13.2656 5C13.2617 5.57422 13.3086 5.77734 13.5117 6.07422C13.7031 6.35547 13.7031 6.35547 14.1602 5.89453L14.5742 5.48438L14.5156 5.36719C14.4805 5.30469 14.4531 5.15625 14.4531 5.03125C14.4531 4.78125 14.625 4.1875 14.7031 4.15625C14.7422 4.14062 15.6211 4.32031 15.6523 4.34766C15.6562 4.35156 15.9023 5.41406 16.1992 6.70703L16.7422 9.05859L16.2734 9.52734L15.8008 10L12.9102 7.10938L10.0195 4.21875L10.4883 3.75C10.7461 3.49219 10.9766 3.28125 11.0039 3.28125C11.0273 3.28125 11.5898 3.40625 12.2539 3.55859ZM11.2227 14.5781L7.5 18.3008L4.60938 15.4102L1.71875 12.5195L5.4375 8.80078L9.16016 5.07812L12.0508 7.96875L14.9414 10.8594L11.2227 14.5781Z" fill="#0078BD"/>
<path d="M10.3281 8.79297L9.89453 9.22656L9.75781 9.18359C9.06641 8.95703 8.30859 9.13672 7.84766 9.64062C7.21875 10.3281 7.20703 11.332 7.82812 12.0703C7.92578 12.1875 8.01953 12.3438 8.03125 12.4141C8.11328 12.8516 7.64844 13.2148 7.25 13.0273C7.05859 12.9375 6.94531 12.7656 6.92188 12.5352C6.90625 12.3477 6.89844 12.3438 6.74219 12.3008C6.11719 12.1289 5.75781 12.043 5.74219 12.0586C5.73047 12.0664 5.72266 12.2734 5.72266 12.5117C5.72656 12.8438 5.74219 12.9883 5.79297 13.1055L5.86328 13.2578L5.40234 13.7188L4.94141 14.1797L5.38281 14.6172L5.82031 15.0586L6.27734 14.6016L6.73828 14.1484L6.89453 14.207C7.11719 14.2891 7.59766 14.3164 7.85938 14.2617C8.50391 14.125 9.03516 13.6133 9.20312 12.9688C9.32422 12.4883 9.21875 11.8711 8.95312 11.5195C8.89453 11.4414 8.78906 11.3047 8.72266 11.2109C8.42188 10.8164 8.66406 10.3125 9.14844 10.3125C9.46484 10.3125 9.6875 10.5391 9.70312 10.875L9.71094 11.0352L10.2695 11.1836C10.6523 11.2852 10.8438 11.3203 10.8711 11.293C10.9375 11.2266 10.9219 10.5898 10.8438 10.3359L10.7773 10.1055L11.207 9.67188C11.4453 9.43359 11.6406 9.21875 11.6406 9.19922C11.6406 9.14844 10.8516 8.35938 10.8008 8.35938C10.7773 8.35938 10.5664 8.55469 10.3281 8.79297Z" fill="#0078BD"/>
</g>
<defs>
<clipPath id="clip0_915_7540">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total Earning</h2>
            <p className="text-2xl font-bold mt-2">${stats.grandTotal.toLocaleString()}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 17.5H3.83333C3.36662 17.5 3.13327 17.5 2.95501 17.4092C2.79821 17.3293 2.67072 17.2018 2.59083 17.045C2.5 16.8667 2.5 16.6334 2.5 16.1667V2.5M17.5 5.83333L12.9714 10.3619C12.8064 10.5269 12.7239 10.6094 12.6288 10.6404C12.5451 10.6675 12.4549 10.6675 12.3712 10.6404C12.2761 10.6094 12.1936 10.5269 12.0286 10.3619L10.4714 8.80474C10.3064 8.63973 10.2239 8.55723 10.1288 8.52632C10.0451 8.49912 9.95493 8.49912 9.87124 8.52632C9.77611 8.55723 9.6936 8.63973 9.5286 8.80474L5.83333 12.5M17.5 5.83333H14.1667M17.5 5.83333V9.16667" stroke="#0078BD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>
        </div>
      </div>
<div className='mt-6'>


      <Cards />


</div>
      <div className='mt-[44px]'>
        <p className="robotomedium text-[20px]">Monthly Performances</p>
        <p className="robotoregular text-[#707070]">Overview of calls, Pr1, Rems, and Rpm over the last  month.</p>
      </div>

      {/* Charts / Tables Section */}
     <div className="flex flex-wrap gap-3">
  <Linechart />
  <CallByClientsChart />
</div>


    </div>
  );
};

export default Overview;
