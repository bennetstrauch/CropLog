import { cropsMeasuredIn } from "../ProvideCropsAndFields";
import { confirmAndDelete } from "../../service/utils";
import { useState } from "react";
import { getLatestHarvestRecord } from "../../service/apiService";

function DisplayLatestRecord() {
  //###
  const [latestRecord, setLatestRecord] = useState();

  if (latestRecord == undefined) {
    setLatestRecordFromDatabase();
  }

  async function setLatestRecordFromDatabase() {
    const latestRecordFromDb = await getLatestHarvestRecord();
    setLatestRecord(latestRecordFromDb);
  }

  async function deleteAndUpdateLatestRecord(recordId) {
    await confirmAndDelete(recordId).then(setLatestRecord(undefined));
  }

  const deleteLatestRecord_Button = (
    <button
      className="deleteLatestRecord"
      onClick={() => deleteAndUpdateLatestRecord(latestRecord.id)}
    >
      Delete
    </button>
  );

  if (latestRecord != undefined)
    return (
      <div className="latestRecord">
        <span>
          <strong>Latest Record: </strong>
          {`${latestRecord.harvestDate.substring(0, 10)}, 
            ${latestRecord.cropName}, 
            ${latestRecord.harvestedAmount} ${
            cropsMeasuredIn[latestRecord.cropName]
          }, 
            ${latestRecord.harvestedFields} 
          `}
        </span>
        {deleteLatestRecord_Button}
      </div>
    );
  else {
    console.log("#checkifneeded# latest record is undefined");
    return <div></div>;
  }
}

export default DisplayLatestRecord;
