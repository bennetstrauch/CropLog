import React from 'react'

const DateRangeDiv = ({startDate, endDate}) => {

    // Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (day) => {
        if (day >= 11 && day <= 13) {
            return day + 'th';
        }
        switch (day % 10) {
            case 1: return day + 'st';
            case 2: return day + 'nd';
            case 3: return day + 'rd';
            default: return day + 'th';
        }
    };

    // Helper function to get month name
    const getMonthName = (month) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    };

    // Format the date range intelligently
    const formatDateRange = (startDateStr, endDateStr) => {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();

        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth();
        const endYear = endDate.getFullYear();

        const startDayOrdinal = getOrdinalSuffix(startDay);
        const endDayOrdinal = getOrdinalSuffix(endDay);

        // Same month and year: "12th - 18th September 2025"
        if (startMonth === endMonth && startYear === endYear) {
            return `${startDayOrdinal} - ${endDayOrdinal} ${getMonthName(startMonth)} ${startYear}`;
        }

        // Different months, same year: "27th September - 3rd October 2025"
        if (startYear === endYear) {
            return `${startDayOrdinal} ${getMonthName(startMonth)} - ${endDayOrdinal} ${getMonthName(endMonth)} ${startYear}`;
        }

        // Different years: "24th December 2025 - 1st January 2026"
        return `${startDayOrdinal} ${getMonthName(startMonth)} ${startYear} - ${endDayOrdinal} ${getMonthName(endMonth)} ${endYear}`;
    };

    const formattedRange = formatDateRange(startDate, endDate);

    return (
        <div className="text-teal-600">
            {formattedRange}
        </div>
    )
}

export default DateRangeDiv