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
import { usePlan } from "../context/PlanProvider";
import PlanOverageModal from "../components/plan/PlanOverageModal";

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
  const { isOverLimit, isBlocking, daysRemaining, loading: planLoading } = usePlan();
  const [overageModalOpen, setOverageModalOpen] = useState(false);

  const visibility = useUIVisibility(selectedCrop);

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
      {!planLoading && isOverLimit && !isBlocking && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Free plan limit exceeded.</span>
          </div>
          <button
            onClick={() => setOverageModalOpen(true)}
            className="flex-shrink-0 text-amber-700 font-medium hover:text-amber-900 underline transition-colors"
          >
            Resolve →
          </button>
        </div>
      )}
      {overageModalOpen && (
        <PlanOverageModal blocking={false} initialOpen={true} onClose={() => setOverageModalOpen(false)} />
      )}

      <MainPageHeader
        visibility={visibility}
        goBack={goBack}
        harvestDate={harvestDate}
        setHarvestDate={setHarvestDate}
        onTutorial={startTutorial}
      />

      <br />

      <div id="harvest-entry-form">
        <SelectCrop harvestedFieldsRef={harvestedFieldsRef} harvestDate={harvestDate} setHarvestDate={setHarvestDate} />
      </div>

      <TutorialOverlay />
    </div>
  );
}

export default MainPage;
