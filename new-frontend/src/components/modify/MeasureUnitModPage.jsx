import React, { useEffect, useState } from "react";
import { getMeasureUnits } from "../../service/modifyService";
import AddMeasureUnitForm from "./AddMeasureUnitForm";
import MeasureUnitList from "./MeasureUnitList";

const MeasureUnitModPage = () => {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await getMeasureUnits();
      setUnits(data);
    } catch (err) {
      console.error("Failed to fetch measure units", err);
    }
  };

  const handleAdded = (newUnit) => {
    setUnits((prev) => [...prev, newUnit]);
  };

  return (
    <div>
      <AddMeasureUnitForm onAdded={handleAdded} />
      <MeasureUnitList units={units} />
    </div>
  );
};

export default MeasureUnitModPage;
