import React, { useState, useEffect } from "react";

const AddCropForm = ({ measureUnits, onAdd }) => {
  const [cropsInput, setCropsInput] = useState("");
  const [measureUnit, setMeasureUnit] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Detect screen size (small or not)
  useEffect(() => {
    const checkSize = () => setIsSmallScreen(window.innerWidth < 640); // Tailwind "sm" breakpoint
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cropsInput.trim()) return;

    const crops = cropsInput.split(",").map((c) => c.trim());
    onAdd(crops, measureUnit);

    setCropsInput("");
    setMeasureUnit("");
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-start">
        {/* CROPS INPUT */}
        <div className="flex-1 min-w-[300px]">
          <input
            id="cropsInput"
            type="text"
            value={cropsInput}
            onChange={(e) => setCropsInput(e.target.value)}
            placeholder="Eg: Wheat, Zucchini"
            className="w-full px-3 py-2 border-0 rounded-lg bg-yellow-50/100 text-gray-900 placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-teal-500 transition-all duration-200"
            required
          />
          <p className="text-xs text-gray-500 mt-1 italic">
            names separated by comma
          </p>
        </div>

        {/* MEASURE UNIT + BUTTON WRAPPER */}
        <div className="flex gap-4 items-start flex-1 min-w-[200px]">
          {/* MEASURE UNIT SELECT */}
          <div className="flex-1 min-w-[110px]">
            <select
              id="measureUnitInput"
              value={measureUnit}
              onChange={(e) => setMeasureUnit(e.target.value)}
              className="w-full px-3 py-2 border-0 rounded-lg bg-yellow-50/100 text-gray-900 focus:outline-none focus:border-teal-500 transition-all duration-200"
              required
            >
              {/* Dynamically choose placeholder text based on screen size */}
              <option value="" disabled>
                {isSmallScreen ? "Select Unit" : "Select Measure Unit"}
              </option>

              {measureUnits.map((unit) => (
                <option key={unit.id} value={unit.name} className="text-gray-900">
                  {unit.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end mt-1">
              <p className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-700">
                or add new unit
              </p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="w-32 flex-shrink-0">
            <button
              type="submit"
              className="w-full px-4 py-2 !bg-teal-700 text-white font-semibold rounded-lg hover:!bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!cropsInput.trim() || !measureUnit}
            >
              Add Crops
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCropForm;
