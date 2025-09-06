import React, { useContext, useEffect, useState } from "react";
import CropForm from "./CropForm";
import CropList from "./CropList";
import { getCrops, addCropsWithUnit, deleteCrops, updateCrop, getMeasureUnits } from "../../service/modifyService";
import { CropsFieldsContext, CropsFieldsProvider, ProvideCropsAndFieldsContext } from "../../context/CropsFieldsProvider";

const CropSection = () => {
  const {crops, setCrops, measureUnits, setMeasureUnits} = ProvideCropsAndFieldsContext()
  // // Load crops + supporting data
  // useEffect(() => {
  //   async function fetchData() {
  //     const [cropData, muData, catData] = await Promise.all([
  //       getCrops(),
  //       // assume you have service funcs
  //       // or replace with [] if not ready
  //       getMeasureUnits(),
  //       getCategories(),
  //     ]);
  //     setCrops(cropData);
  //     setMeasureUnits(muData);
  //     setCategories(catData);

  //     console.log("MeasureUNits: ", measureUnits)
  //   }
  //   fetchData();
  // }, []);

  const [categories, setCategories] = useState([])

  console.log("measureUnits:" ,measureUnits)

  const handleAddCrops = async (cropsToAdd, measureUnit) => {
    try {
      const newCrops = await addCropsWithUnit(cropsToAdd, measureUnit);
      setCrops((prev) => [...prev, ...newCrops]);
    } catch {
      alert("Failed to add crops.");
    }
  };

  const handleUpdateCrop = async (id, field, value) => {
    try {
      const updatedCrop = await updateCrop(id, { [field]: value });
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
    </div>
  );
};

export default CropSection;
