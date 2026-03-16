import React, { useState } from "react";
import AddCropForm from "./AddCropForm";
import CropList from "./CropList";
import CategorySuggestionModal from "./CategorySuggestionModal";
import MeasureUnitModal from "./MeasureUnitModal";
import {
  getCrops,
  addCropsWithUnit,
  deleteCrops,
  updateCrop,
  getMeasureUnits,
  getCategories,
} from "../../service/modifyService";
import { useCrops } from "../../context/CropsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";
import { useCategories } from "../../context/CategoriesProvider";
import { useNotification } from "../../context/NotificationContext";

const CropSection = () => {
  const { crops, setCrops, loading: cropsLoading } = useCrops();
  const { measureUnits, setMeasureUnits } = useMeasureUnits();
  const { categories, setCategories } = useCategories();
  const { showNotification } = useNotification();

  const [pendingCrops, setPendingCrops] = useState([]); // holds crops that need category resolution
  const [modalOpen, setModalOpen] = useState(false);
  const [measureUnitModalOpen, setMeasureUnitModalOpen] = useState(false);
  const [newlyCreatedMeasureUnit, setNewlyCreatedMeasureUnit] = useState(null);

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
        showNotification("Crop added!");
      }

      if (unresolved.length > 0) {
        setPendingCrops(unresolved);
        setModalOpen(true);
      }
    } catch {
      showNotification("Failed to add crops.", "error");
    }
  };

  const handleUpdateCrop = async (id, field, value) => {
    try {
      // Find the current crop to get all existing values
      const currentCrop = crops.find((c) => c.id === id);
      if (!currentCrop) {
        throw new Error("Crop not found");
      }

      // Create complete request with updated field - backend expects IDs
      const completeRequest = {
        name: field === "name" ? value : currentCrop.name,
        measureUnitId: field === "measureUnitId" ? value : currentCrop.measureUnitId,
        categoryId: field === "categoryId" ? value : currentCrop.categoryId,
        active: field === "active" ? value : currentCrop.active,
      };

      console.log("Updating crop with request:", completeRequest);
      const updatedCrop = await updateCrop(id, completeRequest);
      console.log("Received updated crop from API:", updatedCrop);

      // Update the crop in state with the response from the API
      setCrops((prev) =>
        prev.map((c) => (c.id === id ? updatedCrop : c))
      );
    } catch (error) {
      console.error("Failed to update crop:", error);
      showNotification("Failed to update crop.", "error");
    }
  };

  const handleDeleteCrops = async (ids) => {
    try {
      await deleteCrops(ids);
      setCrops((prev) => prev.filter((c) => !ids.includes(c.id)));
      showNotification("Deleted.");
    } catch {
      showNotification("Failed to delete crops.", "error");
    }
  };

  const handleModalClose = () => {
    setPendingCrops([]);
    setModalOpen(false);
  };

  const handleModalCropsUpdated = async () => {
    // Re-fetch crops and categories so we get fresh state after user confirmed categories
    try {
      const [refreshedCrops, refreshedCategories] = await Promise.all([
        getCrops(),
        getCategories()
      ]);
      setCrops(refreshedCrops);
      setCategories(refreshedCategories);
      showNotification("Crop added!");
    } catch {
      console.warn("Failed to refresh crops and categories after category suggestion save.");
    }
  };

  const handleOpenMeasureUnitModal = () => {
    setMeasureUnitModalOpen(true);
  };

  const handleCloseMeasureUnitModal = () => {
    setMeasureUnitModalOpen(false);
  };

  const handleMeasureUnitCreated = (newMeasureUnit) => {
    // Update measure units context with the new unit
    setMeasureUnits((prev) => [...prev, newMeasureUnit]);
    // Set the newly created measure unit for auto-selection
    setNewlyCreatedMeasureUnit(newMeasureUnit);
  };

  return (
    <div>
      <AddCropForm
        measureUnits={measureUnits}
        onAdd={handleAddCrops}
        onOpenMeasureUnitModal={handleOpenMeasureUnitModal}
        newlyCreatedMeasureUnit={newlyCreatedMeasureUnit}
        onMeasureUnitSelected={() => setNewlyCreatedMeasureUnit(null)}
      />

      <CropList
        crops={crops}
        measureUnits={measureUnits}
        categories={categories}
        onUpdateCrop={handleUpdateCrop}
        onDeleteSelected={handleDeleteCrops}
        loading={cropsLoading}
      />

      {modalOpen && pendingCrops.length > 0 && (
        <CategorySuggestionModal
          crops={pendingCrops}
          categories={categories}
          onClose={handleModalClose}
          onCropsUpdated={handleModalCropsUpdated}
        />
      )}

      {measureUnitModalOpen && (
        <MeasureUnitModal
          onClose={handleCloseMeasureUnitModal}
          onMeasureUnitCreated={handleMeasureUnitCreated}
        />
      )}
    </div>
  );
};

export default CropSection;
