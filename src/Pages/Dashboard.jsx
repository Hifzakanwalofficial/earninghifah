import React from 'react'
import { useNavigate } from 'react-router-dom'
import Graph from './Component/Graph'
import Cards from './Component/Cards'
import Earninghistory from './Component/Earninghistory'

const Dashboard = () => {
  const navigate = useNavigate()

  const handleFormClick = () => {
    navigate('/form')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pt-[31px] pb-[50px]">
        <p className="text-[24px] robotosemibold">Overview</p>
        <button
          className="bg-[#0078BD] h-[40px] w-[98px] text-white rounded-[10px]"
          onClick={handleFormClick}
        >
          +Forms
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
