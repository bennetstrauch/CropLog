import React from "react";
import { getCurrentDate } from "../../service/utils";
import "./harvestLog.css";

//# change key to hervestEntryId, then no index needed also | impl. Deletion
const HarvestRecordRow = ({ entry, index, setHarvestEntries }) => {
  console.log("RENDER HarvestEntryRow, entry: ", entry);

  console.log("entry: ", entry);

  // const removeFromLog = (entryId) => {
  //     setHarvestEntries((prevEntries) =>
  //       prevEntries.filter((entry) => entry.id !== entryId)
  //     );
  //   };

  // const handleEntryDeletion = (entryId) => {
  //     confirmAndDelete(entryId).then(() => removeFromLog(entryId));
  //   };

  const highlightIfEntryIsFromToday = (entryHarvestDate) => {
    return getCurrentDate() === entryHarvestDate ? "highlight" : "normal";
  };

  return (
    <tr className={highlightIfEntryIsFromToday(entry.harvestDate)} key={index}>
      <td>{entry.harvestDate}</td>
      <td>{entry.cropName}</td>
      <td>{entry.quantity}</td>
      <td>{entry.measureUnitName}</td>
      {/* to string? handle in backend? # */}
      <td>{entry.harvestedFieldNames.join(", ")}</td>
      <td>
        <button onClick={() => handleEntryDeletion(entry.id)}>Delete</button>
      </td>
    </tr>
  );
};

export default HarvestRecordRow;
