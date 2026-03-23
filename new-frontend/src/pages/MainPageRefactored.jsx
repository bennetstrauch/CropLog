import React, { useState, useEffect } from "react";
import "../App.css";
import "../index.css";
import { validateDate } from "../service/utils";
import SelectCrop from "../components/newHarvestEntry/SelectCrop";
import useHarvestForm from "../components/newHarvestEntry/useHarvestForm";
import useHarvestSubmit from "../components/newHarvestEntry/useHarvestSubmit";
import useUIVisibility from "../components/newHarvestEntry/useUIVisibility";
import MainPageHeader from "../components/newHarvestEntry/MainPageHeader";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import { useTutorial } from "../context/TutorialContext";

function MainPage() {
  const {
    harvestDate,
    setHarvestDate,
    selectedCrop,
    setSelectedCrop,
    harvestedAmount,
    harvestedFieldsRef,
    resetForm,
    resetCropSelection,
    resetHarvestDate,
    resetHarvestedFields,
    resetHarvestedAmount,
  } = useHarvestForm();

  const { submitHarvestEntry } = useHarvestSubmit();
  const { startTutorialIfNew, startTutorial } = useTutorial();

  const [showDateInputField, setShowDateInputField] = useState(false);

  const visibility = useUIVisibility(selectedCrop, showDateInputField);

  useEffect(() => {
    startTutorialIfNew();
  }, []);

  // Validate date when crop is selected
  const dateNotValid = !validateDate(harvestDate);
  if (visibility.cropIsSelected && dateNotValid) {
    alert("Invalid date format. Please use YYYY-MM-DD.");
    resetCropSelection();
  }

  const goBack = () => {
    resetForm();
    setShowDateInputField(false);
  };

  const toggleDateInputField = () => {
    setShowDateInputField(prev => !prev);
    if (!showDateInputField) {
      resetHarvestDate();
    }
  };

  const submitEntryAndGoBack = async () => {
    const success = await submitHarvestEntry({
      harvestDate,
      cropName: selectedCrop,
      harvestedAmount,
      harvestedFields: harvestedFieldsRef.current,
    });

    if (success) {
      resetForm();
      goBack();
    }
  };

  return (
    <div className="firstWindow">
      <MainPageHeader
        visibility={visibility}
        showDateInputField={showDateInputField}
        toggleDateInputField={toggleDateInputField}
        goBack={goBack}
        harvestDate={harvestDate}
        setHarvestDate={setHarvestDate}
      />

      <button
        onClick={startTutorial}
        title="Help / Tour"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#4f7942",
          border: "none",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        ?
      </button>

      <br />

      <div id="harvest-entry-form">
        <SelectCrop harvestedFieldsRef={harvestedFieldsRef} harvestDate={harvestDate} />
      </div>

      <TutorialOverlay />
    </div>
  );
}

export default MainPage;
