import React, { useState } from "react";
import "../App.css";
import "../index.css";
import { validateDate } from "../service/utils";
import SelectCrop from "../Components/newHarvestEntry/SelectCrop";
import { ProvideCropsAndFieldsContext } from "../context/CropsFieldsProvider";
import useHarvestForm from "../components/newHarvestEntry/useHarvestForm";
import useHarvestSubmit from "../components/newHarvestEntry/useHarvestSubmit";
import useUIVisibility from "../components/newHarvestEntry/useUIVisibility";
import MainPageHeader from "../components/newHarvestEntry/MainPageHeader";

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

  const { setLatestEntry } = ProvideCropsAndFieldsContext();
  const { submitHarvestEntry } = useHarvestSubmit(setLatestEntry);

  const [showDateInputField, setShowDateInputField] = useState(false);

  const visibility = useUIVisibility(selectedCrop, showDateInputField);

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

      <br />

      <SelectCrop harvestedFieldsRef={harvestedFieldsRef} harvestDate={harvestDate} />
    </div>
  );
}

export default MainPage;