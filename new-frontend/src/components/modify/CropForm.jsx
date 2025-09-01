import React, { useState } from "react";

const CropForm = ({ measureUnits, onAdd }) => {
  const [cropsInput, setCropsInput] = useState("");
  const [measureUnit, setMeasureUnit] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cropsInput.trim()) return;

    const crops = cropsInput.split(",").map((c) => c.trim());
    onAdd(crops, measureUnit);

    setCropsInput("");
    setMeasureUnit("");
  };

  return (
    <form onSubmit={handleSubmit} className="crop-form">
      <input
        value={cropsInput}
        onChange={(e) => setCropsInput(e.target.value)}
        placeholder="e.g. Wheat, Barley"
      />
      <select
        value={measureUnit}
        onChange={(e) => setMeasureUnit(e.target.value)}
      >
        <option value="">Select unit</option>
        {measureUnits.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
      <button type="submit">Add Crops</button>
    </form>
  );
};

export default CropForm;
