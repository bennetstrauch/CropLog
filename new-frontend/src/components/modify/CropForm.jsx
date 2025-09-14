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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={cropsInput}
            onChange={(e) => setCropsInput(e.target.value)}
            placeholder="Eg: Wheat, Zucchini"
            className="w-full px-3 py-2 border-2 border-teal-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all duration-200"
            required
          />
          <p className="text-xs text-gray-500 mt-1 italic underline">names separated by comma</p>
        </div>

        <div className="w-64 min-w-0">
          <select
            value={measureUnit}
            onChange={(e) => setMeasureUnit(e.target.value)}
            className="w-full px-3 py-2 border-2 border-teal-400 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-teal-500 transition-all duration-200"
            required
          >
            <option value="" className="text-gray-500">Select MeasureUnit</option>
            {measureUnits.map((unit) => (
              <option key={unit.id} value={unit.name} className="text-gray-900">
                {unit.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-blue-600 mt-1 underline cursor-pointer hover:text-blue-700">+ or add new unit</p>
        </div>

        <div className="w-32">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
