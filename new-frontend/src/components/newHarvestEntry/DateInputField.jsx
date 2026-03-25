import React, { useEffect, useRef } from "react";

function DateInputField({ harvestDate, setHarvestDate }) {
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // showPicker() not supported in all browsers — silently ignore
    }
  }, []);

  return (
    <div>
      <label htmlFor="date">Date: </label>
      <input
        ref={inputRef}
        type="date"
        id="date"
        value={harvestDate}
        onChange={(e) => setHarvestDate(e.target.value)}
      />
    </div>
  );
}

export default DateInputField;
