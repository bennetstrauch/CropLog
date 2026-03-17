import React, { useState, useEffect } from "react";
import GenericAddForm from "./GenericAddForm";

const AddCropForm = ({ measureUnits, onAdd, onOpenMeasureUnitModal, newlyCreatedMeasureUnit, onMeasureUnitSelected }) => {
  const [cropsInput, setCropsInput] = useState("");
  const [measureUnit, setMeasureUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select newly created measure unit
  useEffect(() => {
    if (newlyCreatedMeasureUnit) {
      setMeasureUnit(newlyCreatedMeasureUnit.name);
      onMeasureUnitSelected();
    }
  }, [newlyCreatedMeasureUnit, onMeasureUnitSelected]);

  const handleSubmit = async () => {
    const crops = cropsInput.split(",").map((c) => c.trim());
    setIsSubmitting(true);
    try {
      await onAdd(crops, measureUnit);
    } finally {
      setCropsInput("");
      setMeasureUnit("");
      setIsSubmitting(false);
    }
  };

  return (
    <GenericAddForm
      buttonText="Add Crops"
      primaryInput={{
        placeholder: "Eg: Wheat, Zucchini",
        helperText: "names separated by comma",
        value: cropsInput,
        setValue: setCropsInput,
        validation: (value) => value.trim() !== ""
      }}
      secondaryInput={{
        placeholder: "Select Measure Unit",
        shortPlaceholder: "Select Unit",
        value: measureUnit,
        setValue: setMeasureUnit,
        required: true,
        validation: (value) => value !== "",
        options: measureUnits.map(unit => ({
          id: unit.id,
          value: unit.name,
          label: unit.name
        })),
        helperText: "or add new unit",
        onHelperTextClick: onOpenMeasureUnitModal
      }}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
};

export default AddCropForm;
