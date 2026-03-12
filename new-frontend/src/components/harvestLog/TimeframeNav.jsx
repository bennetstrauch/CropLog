import React, { useEffect, useState } from 'react'
import './harvestLog.css'
import { calculateDateRange } from '../../service/utils';


export const timeFrameOptions = [7, 30, 365];
export const defaultTimeframe = timeFrameOptions[0];


const TimeframeNav = ({ setDateRange, isCustomMode = false, onPresetSelect }) => {

    // ## Refactor for better readability! - some already done
    const [timeframe, setTimeframe] = useState(defaultTimeframe);

    const [startDateOffset, setStartDateOffset] = useState(0); // Keep track: how far back we're viewing



    useEffect(() => {
        updateDaterange();
        console.log("updated date range")
    }, [timeframe, startDateOffset]);


    function updateDaterange() {

        const dateRange = calculateDateRange(timeframe, startDateOffset);
        setDateRange(dateRange);
    }


    // Change timeframe to 7 days, 30 days, or 1 year
    const handleTimeframeChange = (newTimeframe) => {
        onPresetSelect?.();
        setTimeframe(newTimeframe);
        setStartDateOffset(0); // Reset offset when changing the timeframe
    };

    // Adjust the start date offset to navigate forward/backward in time
    const navigateTimeframe = (direction) => {
        // Adjust based on the direction (< or >) #
        setStartDateOffset(
            (prevOffset) => {
                if (direction === "back")
                    return prevOffset - timeframe;

                else // direction === "forward"
                    return prevOffset + timeframe;
            });
    };


    // Nav arrows only visible when a preset is active (not in custom mode)
    const makeNavVisible = (timeFrameOption) =>
        !isCustomMode && timeframe === timeFrameOption ? "visible" : "notVisible";

    const navigationButtons = (timeFrameOption) => (
        <div
            className={`navigation-buttons ${makeNavVisible(timeFrameOption)}`}
        >
            <button className="goBackInTime" onClick={() => navigateTimeframe("back")}>
                {"<"}
            </button>

            <button className="moveForwardInTime" onClick={() => navigateTimeframe("forward")}>
                {">"}
            </button>
        </div>
    );

    const timeFrameButton = (timeFrameOption) => (
        <button
            className={!isCustomMode && timeframe === timeFrameOption ? "active" : ""}
            onClick={() => handleTimeframeChange(timeFrameOption)}
        >
            {/* refactor this? # */}
            {`${timeFrameOption < 365 ? `${timeFrameOption} days` : "1 year"}`}
        </button>
    );

    return (
        <div className="timeframe-navigation navbar">

            {timeFrameOptions.map((timeFrameOption) => (

                <div  key={timeFrameOption}>
                    {timeFrameButton(timeFrameOption)}
                    {navigationButtons(timeFrameOption)}
                </div>
            ))}

        </div>
    )
}

export default TimeframeNav