import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMeasureUnits,
  deleteCrops,
  deleteMeasureUnits,
  addValues,
  deleteValues,
  createCropsBatch,
  createMeasureUnit,
} from "../../service/apiService";
import {
  addValue,
  capitalizeFirstLetter,
  mapToHTML,
  removeValue,
  valueToModify,
} from "../../service/utils";

function ModifyValues() {
  const [measureUnits, setMeasureUnits] = useState([]);
  const [cropsToAdd, setCropsToAdd] = useState("");
  const [valuesToAdd, setValuesToAdd] = useState("");
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [customMeasureUnit, setCustomMeasureUnit] = useState("");
  const [disableDropdown, setDisableDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("addCrops");
  const [valuesToDelete, setValuesToDelete] = useState([]);

  // #for delete, only load when deleteCrops button in navbar is pressed
  const { crops, updateCrops, updateValues, fields, setFields } =
    ProvideCropsAndFieldsContext();
  const [valueToModify, setToModify] = useState("crops");

  const modifyFields_Buttons = [
    <button autoFocus onClick={() => setActiveSection("addFields")}>
      Add Fields
    </button>,
    <button onClick={() => setActiveSection("deleteFields")}>
      Delete Fields
    </button>,
  ];

  const modifyFields = {
    name: "Fields",
    values: fields,
    buttons: modifyFields_Buttons,
  };

  // let cropsToModify = new elementToModify("crops");

  async function fetchMeasureUnits() {
    const fetchedUnits = await getMeasureUnits();
    setMeasureUnits(fetchedUnits);
  }

  useEffect(() => {
    fetchMeasureUnits();
  }, []);

  function updateCropInput(event) {
    setCropsToAdd(event.target.value);
  }

  function updateValueInput(event) {
    setValuesToAdd(event.target.value);
  }

  function handleDropdownSelection(event) {
    setSelectedMeasureUnit(event.target.value);
  }

  // Handle custom measure unit input  !# further refinement
  function handleCustomMeasureUnitInput(event) {
    const userInput = event.target.value;
    setCustomMeasureUnit(userInput);

    const ifUserEntersCustomUnit = userInput.length > 0;
    setDisableDropdown(ifUserEntersCustomUnit); // Disable dropdown if custom unit is entered
  }

  async function setMeasureUnit() {
    const userDefinesCustomUnit = customMeasureUnit !== "";
    let measureUnit;

    if (userDefinesCustomUnit) {
      measureUnit = customMeasureUnit;
      await createMeasureUnit({ measureUnit });
    } else measureUnit = selectedMeasureUnit;

    measureUnit = measureUnit.toLowerCase();
    console.log("Measure Unit to add:", measureUnit);

    return measureUnit;
  }

  function formatCropsForDatabase() {
    const cropsToArrayTrimAndCapitalizeFirstLetter = cropsToAdd
      .split(",")
      .map((crop) => capitalizeFirstLetter(crop.trim()));

    return cropsToArrayTrimAndCapitalizeFirstLetter;
  }

  function formatValuesForDatabase() {
    const valuesToArrayTrimAndCapitalizeFirstLetter = valuesToAdd
      .split(",")
      .map((value) => capitalizeFirstLetter(value.trim()));

    return valuesToArrayTrimAndCapitalizeFirstLetter;
  }

  async function checkIfCropIsEntered() {
    const cropHasBeenEntered = cropsToAdd != "";

    if (cropHasBeenEntered) {
      return true;
    } else {
      alert("Please enter a Cropname");
      return false;
    }
  }

  async function checkIfValueIsEntered(values) {
    const valueHasBeenEntered = valuesToAdd != "";

    if (valueHasBeenEntered) {
      return true;
    } else {
      alert(`Please Enter ${values.name}`);
      return false;
    }
  }

  async function checkIfMeasureUnitIsSpecified() {
    const unitIsSpecified = selectedMeasureUnit || customMeasureUnit;

    if (unitIsSpecified) {
      return true;
    } else {
      alert("Please specify a Measure Unit");
      return false;
    }
  }

  function handleValueSelection(event) {
    const valueName = event.target.value;
    const isSelected = event.target.checked;

    if (isSelected) {
      // setCropsToDelete((prevCrops) => [...prevCrops, name]);
      setValuesToDelete(addValue(valueName));
    } else {
      setValuesToDelete(removeValue(valueName));
    }
  }

  function resetValues() {
    setCropsToAdd("");
    setSelectedMeasureUnit("");
    setCustomMeasureUnit("");
    setDisableDropdown(false);
  }

  async function deleteCropsAndUpdate() {
    console.log("Deleting crops:", valuesToDelete);
    const response = await deleteCrops({ valuesToDelete });
    alert(response.message);

    updateCrops();
    setValuesToDelete([]);
  }

  async function deleteValuesAndUpdate(values) {
    console.log("Deleting:", valuesToDelete);
    const response = await deleteValues({ valuesToDelete }, "/delete" + values.name);
    alert(response.message);

    updateValues(values.name);
    setValuesToDelete([]);
  }

  async function deleteMeasureUnitsAndUpdate() {
    const response = await deleteMeasureUnits({ valuesToDelete });
    alert(response.message);

    fetchMeasureUnits();
    setValuesToDelete([]);
  }

  async function handleDeleteCrops() {
    if (valuesToDelete.length === 0) {
      alert("Please select Crops to delete");
      return;
    }

    if (window.confirm("Delete these Crops?")) {
      deleteCropsAndUpdate();
    }
  }

  async function handleDeleteMeasureUnits() {
    if (valuesToDelete.length === 0) {
      alert("Please select Units to delete");
      return;
    }

    if (window.confirm("Delete these Units?")) {
      deleteMeasureUnitsAndUpdate();
    }
  }


  async function handleDeleteValues(values) {
    if (valuesToDelete.length === 0) {
      alert(`Please select ${values.name} to delete`);	
      return;
    }

    if (window.confirm(`Delete these ${values.name}?`)) {
      deleteValuesAndUpdate(values);
    }
  }


  // Submit crops
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

    const successMessage = await createCropsBatch({
      names: cropsArray,
      measureUnit,
    });
    //# modify so that it is not an alert
    alert(successMessage);
    await fetchMeasureUnits();
    resetValues();
  }

  async function handleAddValues(values) {
    // # refactor
    console.log("values", values, "values.name", values.name);

    if ((await checkIfValueIsEntered(values)) == false) {
      return;
    }

    const valuesToAdd = formatValuesForDatabase();
    const successMessage = await addValues(
      {
        valuesToAdd,
      },
      "/" + values.name
    );
    //# modify so that it is not an alert
    alert(successMessage);
    resetValues();
  }

  const goBackAndReload = () => (window.location.href = "/");

  const head = (
    <header>
      <button className="goBack" onClick={goBackAndReload}>
        ← Back
      </button>
    </header>
  );

  //### how to change one variable name like measureUnit in database and only change it once in backorfrontend, appply everywhere

  const modifyCrops_Buttons = [
    <button autoFocus onClick={() => setActiveSection("addCrops")}>
      Add Crops
    </button>,
    <button onClick={() => setActiveSection("deleteCrops")}>
      Delete Crops
    </button>,
    <button onClick={() => setActiveSection("deleteMeasureUnits")}>
      Delete Measure Units
    </button>,
  ];

  const modifyCrops_Navbar = (
    <div className="navbar">
      <button autoFocus onClick={() => setActiveSection("addCrops")}>
        Add Crops
      </button>
      <button onClick={() => setActiveSection("deleteCrops")}>
        Delete Crops
      </button>
      <button onClick={() => setActiveSection("deleteMeasureUnits")}>
        Delete Measure Units
      </button>
    </div>
  );

  const modifyCrops = {
    buttons: modifyCrops_Buttons,
  };

  const [modifyingElement, setElementToModify] = useState(modifyFields);

  const navbar = <div className="navbar">{modifyingElement.buttons}</div>;

  const crops_Input = (
    <input
      type="text"
      placeholder="Enter Crops separated by ',' Commas"
      value={cropsToAdd}
      onChange={updateCropInput}
    />
  );

  const values_Input = (values) => (
    <input
      type="text"
      placeholder={`Enter ${values.name} separated by ',' Commas`}
      value={valuesToAdd}
      onChange={updateValueInput}
    />
  );

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

  const addCrops_Button = <button onClick={handleAddCrops}>Add Crops</button>;

  const addValues_Button = (values) => (
    <button onClick={() => handleAddValues(values)}>Add {values.name}</button>
  );

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

  const addFields_Div = (
    <div className={displayWhenButtonIsSelected("add" + modifyFields.name)}>
      {values_Input(modifyFields)}
      <br />
      {addValues_Button(modifyFields)}
    </div>
  );

  const deleteFields_Div = (
    <div className={displayWhenButtonIsSelected("deleteFields")}></div>
  );

  const deleteValues_Div = (values) => <DeleteValues {...
    { values, displayWhenButtonIsSelected, handleValueSelection, handleDeleteValues }} />;

  

  const deleteCrops_Div = (
    <div className={displayWhenButtonIsSelected("deleteCrops")}>
      <h2>Delete Crops</h2>
      <ul>
        {mapToHTML(crops, (crop) => (
          <li key={crop.name}>
            <input
              type="checkbox"
              value={crop.name}
              onChange={handleValueSelection}
            />
            {crop.name}
          </li>
        ))}
      </ul>
      <button onClick={handleDeleteCrops}>Delete Crops</button>
    </div>
  );

  const deleteMeasureUnits_Div = (
    <div className={displayWhenButtonIsSelected("deleteMeasureUnits")}>
      <h2>Delete Measure Units</h2>
      <ul>
        {measureUnits.map((unit) => (
          <li key={unit.measureUnit}>
            <input
              type="checkbox"
              value={unit.measureUnit}
              onChange={handleValueSelection}
            />
            {unit.measureUnit}
          </li>
        ))}
      </ul>
      <button onClick={handleDeleteMeasureUnits}>Delete Measure Units</button>
    </div>
  );

  // # update page after crops where added

  const modifyCrops_Div = (
    <div className="turquoiseBorder_Div">
      {addCrops_Div}
      {addFields_Div}
      {deleteCrops_Div}
      {deleteValues_Div(modifyFields)}
      {deleteMeasureUnits_Div}
    </div>
  );

  return (
    <div className="addCrop">
      {navbar}
      {head}
      {modifyCrops_Navbar}
      <br />
      {modifyCrops_Div}
    </div>
  );
}

export default ModifyValues;
