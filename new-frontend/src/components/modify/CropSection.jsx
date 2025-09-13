import React, { useState } from "react";
import CropForm from "./CropForm";
import CropList from "./CropList";
import CategorySuggestionModal from "./CategorySuggestionModal";
import {
  getCrops,
  addCropsWithUnit,
  deleteCrops,
  updateCrop,
  getMeasureUnits,
} from "../../service/modifyService";
import { ProvideCropsAndFieldsContext } from "../../context/CropsFieldsProvider";
import { useCategories } from "../../context/CategoriesProvider";

const CropSection = () => {
  const { crops, setCrops, measureUnits, setMeasureUnits } =
    ProvideCropsAndFieldsContext();
  const { categories } = useCategories();

  const [pendingCrops, setPendingCrops] = useState([]); // holds crops that need category resolution
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddCrops = async (cropsToAdd, measureUnit) => {
    try {
      const newCrops = await addCropsWithUnit(cropsToAdd, measureUnit);

      console.log("New crops returned:", newCrops);



      // separate crops that still need category resolution
      const unresolved = newCrops.filter((c) => !c.categoryResolved);
      const resolved = newCrops.filter((c) => c.categoryResolved);
console.log("Unresolved crops:", unresolved);

      if (resolved.length > 0) {
        setCrops((prev) => [...prev, ...resolved]);
      }

      if (unresolved.length > 0) {
        setPendingCrops(unresolved);
        setModalOpen(true);
      }
    } catch {
      alert("Failed to add crops.");
    }
  };

  const handleUpdateCrop = async (id, field, value) => {
    try {
      // Find the current crop to get all existing values
      const currentCrop = crops.find(c => c.id === id);
      if (!currentCrop) {
        throw new Error("Crop not found");
      }

      // Create complete request with updated field
      const completeRequest = {
        name: currentCrop.name,
        measureUnitId: field === 'measureUnitId' ? value : currentCrop.measureUnitId,
        categoryId: field === 'categoryId' ? value : currentCrop.categoryId
      };

      const updatedCrop = await updateCrop(id, completeRequest);
      setCrops((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedCrop } : c))
      );
    } catch {
      alert("Failed to update crop.");
    }
  };

  const handleDeleteCrops = async (ids) => {
    try {
      await deleteCrops(ids);
      setCrops((prev) => prev.filter((c) => !ids.includes(c.id)));
    } catch {
      alert("Failed to delete crops.");
    }
  };

  const handleModalClose = () => {
    setPendingCrops([]);
    setModalOpen(false);
  };

  const handleModalCropsUpdated = async () => {
    // Re-fetch crops so we get fresh state after user confirmed categories
    try {
      const refreshed = await getCrops();
      setCrops(refreshed);
    } catch {
      console.warn("Failed to refresh crops after category suggestion save.");
    }
  };

  return (
    <div>
      <CropForm measureUnits={measureUnits} onAdd={handleAddCrops} />

      <CropList
        crops={crops}
        measureUnits={measureUnits}
        categories={categories}
        onUpdateCrop={handleUpdateCrop}
        onDeleteSelected={handleDeleteCrops}
      />

      {modalOpen && pendingCrops.length > 0 && (
        <CategorySuggestionModal
          crops={pendingCrops}
          categories={categories}
          onClose={handleModalClose}
          onCropsUpdated={handleModalCropsUpdated}
        />
      )}
    </div>
  );
};

export default CropSection;
