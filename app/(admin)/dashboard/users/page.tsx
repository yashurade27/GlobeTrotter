import UserDataAreaChart from '@/components/Admin/UserDataAreaChart'
import UserDataCard from '@/components/Admin/UserDataCard'
import UserDataTable from '@/components/Admin/UserDataTable'
import React from 'react'

const UserData = () => {
  return (
    <div className='grid grid-rows-3 gap-4 p-4'>
        {/* User Cards */}
      <div className='mb-0 pb-0'>
        <UserDataCard/>
      </div>

        {/* Total Visitor , Area chart  */}
      <div className=''>
        <UserDataAreaChart/>
      </div>

        {/* User Data Table */}
      <div className=''>
        <UserDataTable/>
      </div>
      
    </div>
  )
}

export default UserData
