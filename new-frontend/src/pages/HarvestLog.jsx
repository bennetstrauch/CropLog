import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { calculateDateRange, getCurrentDate } from '../service/utils';
import TimeframeNav, { defaultTimeframe } from '../components/harvestLog/TimeframeNav';
import HarvestLogTableRefactored from '../components/harvestLog/HarvestLogTableRefactored';

const HarvestLog = () => {
  // ## impl. other criteriaqueri predicats: filter by (crop, field,)
  const navigateTo = useNavigate();

  // ### refactor already in fetch
  const [dateRange, setDateRange] = useState( calculateDateRange(defaultTimeframe, 0) );
  console.log('dateRange: ', dateRange)

  

  return (
    <div className="min-h-screen w-full p-0 m-0 fixed inset-0 bg-white">
        <HarvestLogTableRefactored dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  )
}

export default HarvestLog