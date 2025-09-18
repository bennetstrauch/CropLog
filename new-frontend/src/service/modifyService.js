import { get, post, put, deleteRequest } from "./apiService";


// return array of measure unit objects or strings depending on backend
export const getMeasureUnits = () => get("measure-units");
export const createMeasureUnit = (data) => post("measure-units", data);

// crops
export const getCrops = () => get("crops");
export const createCropsBatch = (cropList) => post("crops/batch", cropList);


// ##clean
export async function addCropsWithUnit(cropNames, measureUnitName) {
  if (!measureUnitName) throw new Error("Measure unit is required.");
  // fetch existing units (assume each unit has { id, name })
  const existing = await getMeasureUnits();
  const found = existing.find(u => (u.name ?? u) === measureUnitName);
  let measureUnitId;
  if (found) {
    measureUnitId = found.id ?? null;
  } else {
    const createdMU = await createMeasureUnit({ name: measureUnitName });
    measureUnitId = createdMU.id ?? null;
  }
  if (!measureUnitId) {
    // fallback: if your backend accepts measureUnitName, you could send name instead
    throw new Error("Could not resolve measure unit id.");
  }

  const payload = cropNames.map(name => ({ name, measureUnitId }));
  console.log("payload for adding crops: ", payload)
  const createdCrops = await createCropsBatch(payload);
  return createdCrops; // array of CropResponse (should include categoryName per crop)
}


// update single crop (PUT)
export const updateCrop = async (id, updates) => {
  // updates is an object like { name, measureUnitName, categoryName }
  return put(`crops/${id}`, updates); // if your backend expects PUT, swap to API.put
};

// Update other entities
export const updateMeasureUnit = async (id, updates) => {
  return put(`measure-units/${id}`, updates);
};

export const updateCategory = async (id, updates) => {
  return put(`categories/${id}`, updates);
};

export const updateField = async (id, updates) => {
  return put(`fields/${id}`, updates);
};

// delete many crops using batch delete endpoint
export const deleteCrops = async (ids) => {
  return deleteRequest("crops/batch", ids);
};

// Batch delete functions for other entities
export const deleteMeasureUnits = async (ids) => {
  return deleteRequest("measure-units/batch", ids);
};

export const deleteCategories = async (ids) => {
  return deleteRequest("categories/batch", ids);
};

export const deleteFields = async (ids) => {
  return deleteRequest("fields/batch", ids);
};





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



export const createCrop = (data) => post("crops", data);
export const deleteCrop = (id) => API.delete(`crops/${id}`);

export const deleteMeasureUnit = (id) => API.delete(`measure-units/${id}`);

export const getFields = () => get("fields");
export const createField = (data) => post("fields", data);
export const deleteField = (id) => API.delete(`fields/${id}`);


export const getCategories = () => get("categories");
export const createCategory = (data) => post("categories", data);
export const deleteCategory = (id) => API.delete(`categories/${id}`);
export const createCategories = async (categories) => {
  if (!Array.isArray(categories)) {
    throw new Error("createCategories expects an array of category names");
  }

console.log("Creating categories:", categories);
  const response = await post("categories/batch", categories);
  return response; // post() already returns the response data
};

export const createFields = async (fields) => {
  if (!Array.isArray(fields)) {
    throw new Error("createFields expects an array of field names");
  }

  console.log("Creating fields:", fields);
  const response = await post("fields/batch", fields);
  return response; // post() already returns the response data
};
