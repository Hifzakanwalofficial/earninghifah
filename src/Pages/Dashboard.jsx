import React from 'react'
import { useNavigate } from 'react-router-dom'
import Graph from './Component/Graph'
import Cards from './Component/Cards'
import Earninghistory from './Component/Earninghistory'
import { FaPlus } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate()

  const handleFormClick = () => {
    navigate('/driver/form')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pt-[31px] pb-[50px]">
        <p className="text-[24px] robotosemibold">Overview</p>
      <button
  className="bg-[#0078BD] flex items-center justify-center  robotobold gap-2 h-[50px] w-[104px] text-white rounded-[10px] cursor-pointer"
  onClick={handleFormClick}
><FaPlus />
  Forms
</button>

      </div>

      {/* Cards */}
      <Cards />

      {/* Graph + Earning History */}
      <div className="flex gap-4 mt-6">
        <div className="w-1/2">
          <Graph />
        </div>
        <div className="w-1/2">
          <Earninghistory />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
