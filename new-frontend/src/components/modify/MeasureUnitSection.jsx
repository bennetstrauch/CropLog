
import React from "react";
import AddMeasureUnitForm from "./AddMeasureUnitForm";
import GenericEntityList from "./GenericEntityList";
import { updateMeasureUnit, deleteMeasureUnits } from "../../service/modifyService";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";

const MeasureUnitSection = () => {
  const { measureUnits, setMeasureUnits } = useMeasureUnits();

  const handleAdded = (newUnit) => {
    setMeasureUnits((prev) => [...prev, newUnit]);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const currentUnit = measureUnits.find(u => u.id === id);
      if (!currentUnit) {
        throw new Error("Measure unit not found");
      }

      const updateData = {
        name: field === "name" ? value : currentUnit.name,
        abbreviation: field === "abbreviation" ? value : currentUnit.abbreviation,
      };

      const updatedUnit = await updateMeasureUnit(id, updateData);
      setMeasureUnits((prev) =>
        prev.map((u) => (u.id === id ? updatedUnit : u))
      );
    } catch (error) {
      console.error("Failed to update measure unit:", error);
      alert("Failed to update measure unit.");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteMeasureUnits(ids);
      setMeasureUnits((prev) => prev.filter((u) => !ids.includes(u.id)));
    } catch (error) {
      console.error("Failed to delete measure units:", error);
      alert("Failed to delete measure units.");
    }
  };

  const fieldConfig = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      editable: true,
      required: true
    },
    {
      key: 'abbreviation',
      label: 'Abbreviation',
      type: 'text',
      editable: true,
      required: false
    }
  ];

  return (
    <div>
      <AddMeasureUnitForm onAdded={handleAdded} />

      <GenericEntityList
        title="Measure Unit Management"
        entities={measureUnits}
        fields={fieldConfig}
        onUpdate={handleUpdate}
        onDeleteSelected={handleDeleteSelected}
        sortable={['name', 'abbreviation']}
        defaultSort="name"
        emptyMessage="No measure units yet"
      />
    </div>
  );
};

export default MeasureUnitSection;