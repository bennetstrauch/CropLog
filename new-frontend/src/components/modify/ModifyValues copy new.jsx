// Directory: modify

// ==========================
// File: ModifyValues.jsx
// ==========================
import React from "react";
import CropSection from "./CropSection";
import FieldSection from "./FieldSection";
import MeasureUnitSection from "./MeasureUnitSection";

const ModifyValues = () => {
  return (
    <div className="modify-values">
      <h1>Modify Values</h1>
      <CropSection />
      <FieldSection />
      <MeasureUnitSection />
    </div>
  );
};

export default ModifyValues;
