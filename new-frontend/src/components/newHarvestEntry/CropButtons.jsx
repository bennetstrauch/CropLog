//REFACTOR!!!#
import { mapToHTML } from "../../service/utils";
import { useCrops } from "../../context/CropsProvider";
import { useNavigate } from "react-router-dom";
import { Path_NewEntry } from "../../routes/AppRouter";
import Spinner from "../universal/Spinner";

const Path_ModifyCrops = "/modify/crops";

function CropButtons({ harvestDate, harvestedFieldsRef }) {
  const navigate = useNavigate();
  const { crops, loading } = useCrops();

  //#bessere Namen für Handle click function
  const handleClick = (crop) => {
    console.log("harvestedCrop:", crop.name);

    // naviagte to path and pass selected crop as state
    navigate(Path_NewEntry + "/" + crop.name, {
      state: { harvestDate: harvestDate, harvestedCrop: crop, harvestedFieldsRef: harvestedFieldsRef },
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
        <Spinner size="sm" />
        <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Loading crops...</span>
      </div>
    );
  }

  const activeCrops = crops.filter(c => c.active);

  if (activeCrops.length === 0) {
    return (
      <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          No crops yet. Create your first crop to get started.
        </span>
        <button onClick={() => navigate(Path_ModifyCrops)}>
          + Create first crop
        </button>
      </div>
    );
  }

  return (
    <div>
      {mapToHTML(activeCrops, (crop) => (

        <button key={crop.id} onClick={() => handleClick(crop)}>
          {" "}
          {crop.name}{" "}
        </button>
      ))}
    </div>
  );
}

export default CropButtons;
