import React, { useEffect, useState } from "react";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Crops</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crop Names
          </label>
          <input
            type="text"
            value={cropsInput}
            onChange={(e) => setCropsInput(e.target.value)}
            placeholder="Enter crop names separated by commas (e.g. Wheat, Barley, Corn)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Measure Unit
          </label>
          <select
            value={measureUnit}
            onChange={(e) => setMeasureUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Select unit</option>
            {measureUnits.map((unit) => (
              <option key={unit.id} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-32 flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!cropsInput.trim() || !measureUnit}
          >
            Add Crops
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropForm;
