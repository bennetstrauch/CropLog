

// ==========================
// File: MeasureUnitSection.jsx
// ==========================
import React, { useEffect, useState } from "react";
import { deleteValues, getMeasureUnits } from "../../service/modifyService";
import DeleteValueList from "./DeleteValueList";

const MeasureUnitSection = () => {
  const [units, setUnits] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState([]);

  useEffect(() => {
    getMeasureUnits().then(setUnits);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteValues(selectedToDelete, "units");
      setUnits(units.filter((u) => !selectedToDelete.includes(u)));
      setSelectedToDelete([]);
    } catch {
      alert("Failed to delete measure units.");
    }
  };

  return (
    <section>
      <h2>Delete Measure Units</h2>
      <DeleteValueList
        values={units}
        selected={selectedToDelete}
        setSelected={setSelectedToDelete}
      />
      <button onClick={handleDelete}>Delete Selected Units</button>
    </section>
  );
};

export default MeasureUnitSection;