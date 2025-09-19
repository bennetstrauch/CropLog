import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import GoBackButton from '../components/universal/GoBackButton';
import { calculateDateRange, getCurrentDate } from '../service/utils';
import DateRangeDiv from '../components/harvestLog/DateRangeDiv';
import TimeframeNav, { defaultTimeframe } from '../components/harvestLog/TimeframeNav';
import HarvestLogTable from '../components/harvestLog/HarvestLogTable';
import HarvestLogTableRefactored from '../components/harvestLog/HarvestLogTableRefactored';

const HarvestLog = () => {
  // ## impl. other criteriaqueri predicats: filter by (crop, field,)
  const navigateTo = useNavigate();

  // ### refactor already in fetch
  const [dateRange, setDateRange] = useState( calculateDateRange(defaultTimeframe, 0) );
  console.log('dateRange: ', dateRange)

  

  return (
    <div>HarvestLog
        <GoBackButton />
        <br />

        <DateRangeDiv {...dateRange} />
        <br />

        <TimeframeNav {...{setDateRange}} />
        <br />

        <HarvestLogTableRefactored {...{dateRange}} />


    </div>
  )
}

export default HarvestLog