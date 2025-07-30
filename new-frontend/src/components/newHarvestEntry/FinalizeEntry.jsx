import React, { useContext, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuantityInput from "./QuantityInput";
import SelectFields from "../harvestFields/SelectFields";
import { getCurrentDate } from "../../service/utils";
import { CropsFieldsContext } from "../../context/CropsFieldsProvider";
import { post } from "../../service/apiService";
import GoBackButton from "../universal/GoBackButton";

const FinalizeEntry = () => {
  const navigate = useNavigate();
  const harvestedCrop = useLocation().state.harvestedCrop;
  console.log("RENDER FinalizeEntry,   harvestedCrop", harvestedCrop);

  const harvestDate = useRef(getCurrentDate());
  const harvestedQuantity = useRef(0.0);
  // # leave in context or define here?
  const { harvestedFields } = useContext(CropsFieldsContext);

  // # put in context if needed elsewhere
  const goBack = () => {
    navigate(-1);
  };

  // ## global variables for backend and frontend? harvestDate, cropId, etc...
  function prepareEntry() {
    let newEntry = {
      harvestDate: harvestDate.current,
      cropId: harvestedCrop.id,
      quantity: harvestedQuantity.current.value,
      harvestedFieldIds: harvestedFields.current,
    };

    console.log("newEntry", newEntry);

    return newEntry;
  }

  async function postHarvestEntry(newEntry) {
    const addedEntryId = await post("harvest-entries", newEntry);
    console.log("addedEntryId", addedEntryId);

    return addedEntryId;
  }

  // async function getLatestEntry(id) {
  //   const addedEntry = await getHarvestEntry(id);
  //   setLatestEntry(addedEntry);
  //   console.log("added Entry", addedEntry);
  // }

  const handleEntrySubmission = () => {
    const newEntry = prepareEntry();
    const addedEntryId = postHarvestEntry(newEntry);
    // getLatestEntry(addedEntryId);

    goBack();
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
      finalizeEntry
      <br />
      <GoBackButton />
      <br /> <br />
      <QuantityInput {...{ harvestedQuantity, harvestedCrop }} />
      <SelectFields {...{ harvestedFields, harvestedCrop }} />
      <br />
      {submitEntry_Button}
      {/* {modifyFieldsButton} */}
    </div>
  );
};

export default FinalizeEntry;
