//REFACTOR!!!#
import { mapToHTML } from "../../service/utils";
import { useCrops } from "../../context/CropsProvider";
import { useNavigate } from "react-router-dom";
import { Path_NewEntry } from "../../routes/AppRouter";

function CropButtons({ harvestDate, harvestedFieldsRef }) {
  const navigate = useNavigate();
  const { crops } = useCrops();

  //#bessere Namen für Handle click function
  const handleClick = (crop) => {
    console.log("harvestedCrop:", crop.name);

    // naviagte to path and pass selected crop as state
    navigate(Path_NewEntry + "/" + crop.name, {
      state: { harvestDate: harvestDate, harvestedCrop: crop, harvestedFieldsRef: harvestedFieldsRef },
    });
  };

  return (
    <div>
      {mapToHTML(crops, (crop) => (
        <button key={crop.id} onClick={() => handleClick(crop)}>
          {" "}
          {crop.name}{" "}
        </button>
      ))}
    </div>
  );
}

export default CropButtons;
