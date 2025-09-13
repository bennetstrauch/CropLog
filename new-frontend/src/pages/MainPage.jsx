import React, { useRef } from "react";
import { useState } from "react";
import "../App.css";
import "../index.css";
import { getHarvestRecord, postHarvestRecord } from "../service/apiService";
import { useNavigate } from "react-router-dom";
import { getCurrentDate, validateDate } from "../service/utils";
import DateInputField from "../Components/newHarvestEntry/DateInputField";
import SelectCrop from "../Components/newHarvestEntry/SelectCrop";
import FinalizeEntry from "../Components/newHarvestEntry/finalizeEntry";
import { useDispatch } from "react-redux";
import { Path_HarvestLog } from "../routes/AppRouter";
import { logout } from "../reduxStore/Slices/AuthSlice";
import useHarvestForm from "../components/newHarvestEntry/useHarvestForm";
import useHarvestSubmit from "../components/newHarvestEntry/useHarvestSubmit";

// import "bootstrap/dist/css/bootstrap.min.css";
//# warning --> each child should have unique key (fixit)

function MainPage() {
  console.log("MainPage rendered");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    harvestDate,
    setHarvestDate,
    selectedCrop,
    setSelectedCrop,
    harvestedAmount,
    setHarvestedAmount,
    harvestedFieldsRef,
    setHarvestedFields,
    resetForm,
  } = useHarvestForm();

  console.log("MainPage - harvestedFields:", harvestedFieldsRef);

  const { submitHarvestEntry } = useHarvestSubmit();

  const [showDateInputField, setShowDateInputField] = useState(false);

  //
  const cropIsNotYetSelected = selectedCrop == "";
  const cropIsSelected = selectedCrop != "";

  const displayBeforeCropHasBeenSelected = cropIsNotYetSelected
    ? "visible"
    : "notVisible";
  const displayIfCropHasBeenSelected = cropIsSelected
    ? "visible"
    : "notVisible";

  const displayIfModifyDateButtonPressed =
    showDateInputField && cropIsNotYetSelected ? "visible" : "notVisible";

  const resetHarvestDate = () => setHarvestDate(getCurrentDate);
  const resetCropSelection = () => setSelectedCrop("");
  const resetHarvestedFields = () => setHarvestedFields([]);
  const resetHarvestedAmount = () => setHarvestedAmount(0.0);

  const dateNotValid = !validateDate(harvestDate);
  // # make function and call it
  if (cropIsSelected) {
    if (dateNotValid) {
      alert("Invalid date format. Please use YYYY-MM-DD.");

      resetCropSelection();
    }
  }

  // ##### not necessary

  let harvestEntryObject = {
    harvestDate: harvestDate,
    cropName: selectedCrop,
    harvestedAmount: harvestedAmount,
    // sortFields ?
    harvestedFieldsRef: harvestedFieldsRef,
  };

  //###reset button selection if time, disallow 0 values

  // --------- LAYER 4 -----------------------------------------------------

  async function postHarvestEntryAndSetLatestEntry() {
    const addedEntryId = await postHarvestRecord(harvestEntryObject);
    console.log("addedEntryId", addedEntryId);

    const addedEntry = await getHarvestRecord(addedEntryId);
    // Latest entry tracking removed - handled by hooks
    console.log("added Entry", addedEntry);
  }

  // ----------- LAYER 3 --------------------------------------------

  const goBack = () => {
    resetHarvestDate();
    resetCropSelection();
    resetHarvestedFields();
    resetHarvestedAmount();
    setShowDateInputField(false);
    console.log(harvestedFieldsRef, harvestedAmount);
  };

  const goToHarvestLogPage = () => {
    console.log("harvestLogButton pressed");
    navigate(Path_HarvestLog);
  };

  const toggleDateInputField = () => {
    setShowDateInputField((previousState) => !previousState);

    if (showDateInputField == false) resetHarvestDate();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login"); // optional redirect
  };

  const submitEntryAndGoBack = async () => {
    const success = await submitHarvestEntry({
      harvestDate: harvestDateRef,
      cropName: selectedCrop,
      harvestedAmount,
      harvestedFields: harvestedFieldsRef.current,
    });

    if (success) {
      resetForm();
      goBack();
    }
  };
  // #cleanup!!, edit delete, layout #add time if from same day instead of date

  // --------- LAYER 2 --------------------------------------------

  const goBackArrow = (
    <button className={displayIfCropHasBeenSelected} onClick={goBack}>
      ← Back
    </button>
  );

  const harvestLog_Button = (
    <button
      className={displayBeforeCropHasBeenSelected}
      onClick={goToHarvestLogPage}
    >
      Harvest Log
    </button>
  );

  const modifyDate_Button = (
    <button
      className={displayBeforeCropHasBeenSelected}
      onClick={toggleDateInputField}
      Modify
      Date
    >
      {showDateInputField ? "Hide Date Input" : "Modify Date"}
    </button>
  );

  const logout_Button = <button onClick={handleLogout}>Logout</button>;

  const dateInputField = (
    <div className={displayIfModifyDateButtonPressed}>
      <DateInputField
        harvestDate={harvestDate}
        setHarvestDate={setHarvestDate}
      />
    </div>
  );

  // ------------------------------------------------------------
  // ----------- LAYER 1 ----------------------------------------

  const head = (
    <header>
      {goBackArrow}
      {harvestLog_Button}
      {modifyDate_Button}
      {logout_Button}
      {dateInputField}
    </header>
  );

  // ------ LAYER 0 ------------------------------------------------------

  return (
    <div className="firstWindow">
      {head}

      <br />

      <SelectCrop {...{ harvestedFieldsRef, harvestDate }} />
      {/* {cropIsNotYetSelected ?
        <SelectCrop />

        : <FinalizeEntry harvestedFields={harvestedFields} />} */}
    </div>
  );
}

export default MainPage;
