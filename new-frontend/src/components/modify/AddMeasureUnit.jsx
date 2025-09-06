import React, { useState } from "react";
import { createMeasureUnit } from "../../service/modifyService";

const AddMeasureUnit = ({ onAdded }) => {
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async () => {

    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      const unitToPost = {
        name: name.trim(),
        abbreviation: abbreviation.trim(),
      }
      const newUnit = await createMeasureUnit(unitToPost);
      onAdded(newUnit); // notify parent
      setName("");
      setAbbreviation("");
    } catch (err) {
      console.error(err);
      setError("Failed to add measure unit.");
    }
  };

  return (
    <div className="p-3 border-b">
      <h3>Add Measure Unit</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Abbreviation (optional)"
        value={abbreviation}
        onChange={(e) => setAbbreviation(e.target.value)}
      />
      <br />
      <button onClick={handleAdd}>Add</button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default AddMeasureUnit;
