import React, { useContext, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuantityInput from "./QuantityInput";
import SelectFields from "../harvestFields/SelectFields";
import { getCurrentDate } from "../../service/utils";
import { post, postHarvestRecord } from "../../service/apiService";
import GoBackButton from "../universal/GoBackButton";
import { useNotification } from "../../context/NotificationContext";

const FinalizeEntry = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showNotification } = useNotification();

  // Add a safety check in case someone navigates to this URL directly
  if (!state) {
    // You can redirect them or show an error message
    return <div>Error: Missing entry data. Please start a new entry.</div>;
  }

  // ✅ Destructure BOTH pieces of data from the location state
  const { harvestDate, harvestedCrop, harvestedFieldsRef } = state;

  console.log(
    "RENDER FinalizeEntry,   harvestedCrop",
    harvestedCrop,
    "harvestedFields",
    harvestedFieldsRef
  );

  const harvestedQuantity = useRef(0.0);
  // # leave in context or define here?

  // # put in context if needed elsewhere
  const goBack = () => {
    navigate(-1);
  };

  // ## global variables for backend and frontend? harvestDate, cropId, etc...
  function prepareEntry() {
    let newEntry = {
      date: harvestDate,
      cropId: harvestedCrop.id,
      fieldIds: harvestedFieldsRef.current,
      harvestedQuantity: harvestedQuantity.current.value,
    };

    console.log("newEntry", newEntry);

    return newEntry;
  }

  // async function getLatestEntry(id) {
  //   const addedEntry = await getHarvestEntry(id);
  //   setLatestEntry(addedEntry);
  //   console.log("added Entry", addedEntry);
  // }

  const handleEntrySubmission = async () => {
    const newEntry = prepareEntry();
    console.log("Submitting new entry:", newEntry);

    try {
      const addedEntryId = await postHarvestRecord(newEntry);
      showNotification("Entry saved!");
      goBack();
    } catch (error) {
      console.error("Failed to submit entry:", error);
      alert("Failed to submit harvest entry.");
    }
  };

  const submitEntry_Button = (
    <button onClick={handleEntrySubmission}>Submit</button>
  );
  // //#
  // const modifyFieldsButton = (
  //   <button onClick={navigateTo(Path_ModifyCrops)}>Modify Fields</button>
  // );

  return (
    <div>
      <br />
      <GoBackButton />
      <br /> <br />
      <QuantityInput {...{ harvestedQuantity, harvestedCrop }} />
      <SelectFields {...{ harvestedFieldsRef, harvestedCrop }} />
      <br />
      {submitEntry_Button}
      {/* {modifyFieldsButton} */}
    </div>
  );
};

export default FinalizeEntry;
