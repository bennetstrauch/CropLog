import React from "react";
import AddMeasureUnitForm from "./AddMeasureUnitForm";
import GenericEntityList from "./GenericEntityList";
import { updateMeasureUnit, deleteMeasureUnits, hardDeleteMeasureUnits, updateMeasureUnitsActiveBatch } from "../../service/modifyService";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";
import { useNotification } from "../../context/NotificationContext";

const MeasureUnitSection = () => {
  const { measureUnits, setMeasureUnits, loading } = useMeasureUnits();
  const { showNotification } = useNotification();

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
        active: field === "active" ? value : currentUnit.active,
      };

      const updatedUnit = await updateMeasureUnit(id, updateData);
      setMeasureUnits((prev) =>
        prev.map((u) => (u.id === id ? updatedUnit : u))
      );
    } catch (error) {
      console.error("Failed to update measure unit:", error);
      showNotification("Failed to update measure unit.", "error");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteMeasureUnits(ids);
      setMeasureUnits((prev) => prev.filter((u) => !ids.includes(u.id)));
      showNotification("Marked as inactive.");
    } catch (error) {
      console.error("Failed to delete measure units:", error);
      showNotification("Failed to delete measure units.", "error");
    }
  };

  const handleHardDelete = async (ids, cascade = false) => {
    await hardDeleteMeasureUnits(ids, cascade);
    setMeasureUnits((prev) => prev.filter((u) => !ids.includes(u.id)));
    showNotification("Permanently deleted.");
  };

  const handleBatchToggleActive = async (ids, active) => {
    try {
      await updateMeasureUnitsActiveBatch(ids, active);
      setMeasureUnits((prev) => prev.map(u => ids.includes(u.id) ? { ...u, active } : u));
      showNotification(active ? "Marked as active." : "Marked as inactive.");
    } catch (error) {
      console.error("Failed to update active status:", error);
      showNotification("Failed to update active status.", "error");
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
        onHardDeleteSelected={handleHardDelete}
        onBatchToggleActive={handleBatchToggleActive}
        entityName="Measure Unit"
        sortable={['name', 'abbreviation']}
        defaultSort="name"
        emptyMessage="No measure units yet"
        showActiveColumn={true}
        loading={loading}
      />
    </div>
  );
};

export default MeasureUnitSection;
