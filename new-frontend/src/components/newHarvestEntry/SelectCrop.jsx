import React, { useRef, useState, useEffect } from "react";
import CropButtons from "./CropButtons";
import { getCurrentDate } from "../../service/utils";
import { getLatestHarvestRecord } from "../../service/apiService";
import { useCrops } from "../../context/CropsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";

const SelectCrop = ({ harvestDate, setHarvestDate, harvestedFieldsRef }) => {
  const dateInputRef = useRef(null);
  const { crops } = useCrops();
  const { measureUnitsMap } = useMeasureUnits();
  const [latestEntry, setLatestEntry] = useState(null);

  const today = getCurrentDate();
  const isToday = harvestDate === today;

  const dateLabel = isToday
    ? "Today"
    : new Date(harvestDate + "T00:00:00").toLocaleDateString(undefined, {
        day: "numeric", month: "short", year: "numeric"
      });

  const openPicker = () => {
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.focus();
    }
  };

  useEffect(() => {
    getLatestHarvestRecord()
      .then(setLatestEntry)
      .catch(() => {});
  }, []);

  let latestLine = null;
  if (latestEntry?.createdAt) {
    const entryDate = latestEntry.createdAt.split("T")[0];
    if (entryDate === today) {
      const time = latestEntry.createdAt.slice(11, 16);
      const crop = crops.find(c => c.id === latestEntry.cropId);
      const cropName = crop?.name || latestEntry.archivedCropName || "—";
      const mu = measureUnitsMap[crop?.measureUnitId];
      const unit = mu?.abbreviation || mu?.name || latestEntry.archivedMeasureUnitName || "";
      latestLine = `${time} · ${cropName} · ${latestEntry.harvestedQuantity}${unit ? " " + unit : ""}`;
    }
  }

  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 15 }}>
        New entry{" "}
        <span style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={openPicker}
            style={{
              background: "none",
              border: "none",
              padding: "2px 4px",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              color: "#4ade80",
              borderBottom: "2px solid #4ade80",
              lineHeight: 1.2,
            }}
          >
            {dateLabel}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={harvestDate}
            onChange={(e) => { if (e.target.value) setHarvestDate(e.target.value); }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              opacity: 0,
              pointerEvents: "none",
              width: "100%",
              height: 0,
              padding: 0,
              border: 0,
            }}
          />
        </span>
        {" "}for
      </p>

      <CropButtons {...{ harvestedFieldsRef, harvestDate }} />

      {latestLine && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#9ca3af" }}>
          Last: {latestLine}
        </p>
      )}
    </div>
  );
};

export default SelectCrop;
