import React from "react";
import { useNavigate } from "react-router-dom";
import CropButtons from "./CropButtons";
import { Path_Modify } from "../../routes/AppRouter";

const SelectCrop = ({ harvestDate, harvestedFieldsRef }) => {
  console.log("RENDER SelectCrop");

  const navigate = useNavigate();

  const modifyCropsButton = (
    <button id="nav-manage" onClick={() => navigate(Path_Modify)}>Modify Crops</button>
  );

  return (
    <div>
      NewEntry
      {/* <DisplayLatestEntry/> */}
      <br />
      <p> Please select crop: </p>
      <CropButtons {...{ harvestedFieldsRef, harvestDate }} />
      <br />
      {modifyCropsButton}
    </div>
  );
};

export default SelectCrop;
