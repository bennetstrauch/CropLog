import React from "react";

const MeasureUnitList = ({ units }) => {
  if (!units.length) {
    return <div>No measure units yet.</div>;
  }

  return (
    <ul className="mt-3">
      {units.map((unit) => (
        <li key={unit.id} className="border p-2 mb-2 rounded">
          {unit.name}
          {unit.abbreviation && (
            <span className="ml-2 text-gray-500">
              ({unit.abbreviation})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MeasureUnitList;
