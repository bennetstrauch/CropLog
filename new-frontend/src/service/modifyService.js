// modifyService.js

import { get, post } from "./apiService";

// Helper to ensure measure unit exists
async function ensureMeasureUnitExists(name) {
  const existingUnits = await getMeasureUnits();
  const unitExists = existingUnits.some(unit => unit === name);
  if (!unitExists) {
    await createMeasureUnit({ name });
  }
}


export async function addGenericValues(valuesToAdd, type) {  }
export async function deleteValues(valuesToDelete) {  }


// Add multiple crops with the given measure unit
export async function addCropsWithUnit(cropNames, measureUnitName) {
  if (!measureUnitName) {
    throw new Error("Measure unit is required.");
  }

  // modifyService.js

  // Step 1: Ensure the unit exists
  await ensureMeasureUnitExists(measureUnitName);

  // Step 2: Prepare the batch payload
  const cropRequests = cropNames.map(name => ({
    name,
    measureUnitName,
  }));

  // Step 3: Submit batch to backend
  await createCropsBatch(cropRequests);
}

export const updateCrop = async (id, updates) => { /* PATCH /crops/:id */ };
export const deleteCrops = async (ids) => { /* POST or DELETE with array */ };


export const getCrops = () => get("crops");
export const createCrop = (data) => post("crops", data);
export const createCropsBatch = (cropList) => post("crops/batch", cropList);
export const deleteCrop = (id) => API.delete(`crops/${id}`);

export const getMeasureUnits = () => get("measure-units");
export const createMeasureUnit = (data) => post("measure-units", data);
export const deleteMeasureUnit = (id) => API.delete(`measure-units/${id}`);

export const getFields = () => get("fields");
export const createField = (data) => post("fields", data);
export const deleteField = (id) => API.delete(`fields/${id}`);


export const getCategories = () => get("categories");
export const createCategory = (data) => post("categories", data);
export const deleteCategory = (id) => API.delete(`categories/${id}`);

