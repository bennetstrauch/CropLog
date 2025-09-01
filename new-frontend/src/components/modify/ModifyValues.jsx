// Directory: modify

// ==========================
// File: ModifyValues.jsx
// ==========================
import React, { useEffect, useState } from "react";
import CropSection from "./CropSection";
import FieldSection from "./FieldSection";
import MeasureUnitSection from "./MeasureUnitSection";
import { mapToHTML } from "../../service/utils";
import { getMeasureUnits } from "../../service/modifyService";

const ModifyValues = () => {
  const [measureUnits, setMeasureUnits] = useState([]);

 useEffect(() => {
  async function fetchUnits() {
    const units = await getMeasureUnits();
    setMeasureUnits(units);
  }
  fetchUnits();
}, []);

  const [cropsToAdd, setCropsToAdd] = useState("");
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [customMeasureUnit, setCustomMeasureUnit] = useState("");
  const [disableDropdown, setDisableDropdown] = useState(false);

  const [activeSection, setActiveSection] = useState("addCrops");



   async function handleAddCrops() {
    // # refactor

    if (
      (await checkIfCropIsEntered()) == false ||
      (await checkIfMeasureUnitIsSpecified()) == false
    ) {
      return;
    }

    const cropsArray = formatCropsForDatabase();
    const measureUnit = await setMeasureUnit();

    const successMessage = await addCrops({
      names: cropsArray,
      measureUnit,
    });
    //# modify so that it is not an alert
    alert(successMessage);
    await fetchMeasureUnits();
    resetValues();
  }


 function handleCustomMeasureUnitInput(event) {
    const userInput = event.target.value;
    setCustomMeasureUnit(userInput);

    const ifUserEntersCustomUnit = userInput.length > 0;
    setDisableDropdown(ifUserEntersCustomUnit); // Disable dropdown if custom unit is entered
  }



  function updateCropInput(event) {
    setCropsToAdd(event.target.value);
  }

   const crops_Input = (
    <input
      type="text"
      placeholder="Enter Crops separated by ',' Commas"
      value={cropsToAdd}
      onChange={updateCropInput}
    />
  );

  
  function handleDropdownSelection(event) {
    setSelectedMeasureUnit(event.target.value);
  }

  const measureUnit_Dropdown = (
    <select
      value={selectedMeasureUnit}
      onChange={handleDropdownSelection}
      disabled={disableDropdown}
    >
      <option value="">Select measure unit</option>
      {mapToHTML(measureUnits, (measureUnit) => (
        <option key={measureUnit.measureUnit} value={measureUnit.measureUnit}>
          {measureUnit.measureUnit}
        </option>
      ))}
    </select>
  );

    const customUnit_Input = (
    <input
      type="text"
      placeholder="Enter custom Measure Unit"
      value={customMeasureUnit}
      onChange={handleCustomMeasureUnitInput}
    />
  );

   function handleCustomMeasureUnitInput(event) {
    const userInput = event.target.value;
    setCustomMeasureUnit(userInput);

    const ifUserEntersCustomUnit = userInput.length > 0;
    setDisableDropdown(ifUserEntersCustomUnit); // Disable dropdown if custom unit is entered
  }

  const addCrops_Button = <button onClick={handleAddCrops}>Add Crops</button>;



  const displayWhenButtonIsSelected = (action) =>
    activeSection == action ? "visible" : "notVisible";

   const addCrops_Div = (
    <div className={displayWhenButtonIsSelected("addCrops")}>
      {crops_Input}
      <br /> <br />
      {measureUnit_Dropdown} or
      <br />
      {customUnit_Input}
      <br />
      {addCrops_Button}
    </div>
  );



  const modifyCrops_Div = (
    <div className="turquoiseBorder_Div">
      {addCrops_Div}
      
      {/* {addFields_Div}
      {deleteCrops_Div}
      {deleteValues_Div(modifyFields)}
      {deleteMeasureUnits_Div} */}
    </div>
  );



  return (
    modifyCrops_Div
  );
};

export default ModifyValues;
