import React, { useState } from "react";

function DateInputField({ harvestDate, setHarvestDate }) {
  const handleInputChange = (event) => {
    let input = event.target.value;

    // Only allow numbers and dashes
    input = input.replace(/[^0-9-]/g, "");

    // Ensure the format is YYYY-MM-DD and doesn't exceed 10 characters
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    setHarvestDate(input);
  };


  
  return (
    <div>
      <label htmlFor="date">Enter Date (YYYY-MM-DD): </label>
      <input
        type="text"
        id="date"
        value={harvestDate}
        onChange={handleInputChange}
        maxLength="10" // Limit the input length to 10 characters (YYYY-MM-DD)
        placeholder="YYYY-MM-DD"
      />
    </div>
  );
}

export default DateInputField;
