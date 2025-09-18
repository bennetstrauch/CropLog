import React, { useEffect, useMemo, useState } from "react";
import HarvestRecordRow from "./HarvestRecordRow";
import { mapToHTML } from "../../service/utils";
import { getEntriesFilteredBy } from "../../service/apiService";
import { useCrops } from "../../context/CropsProvider";
import { useFields } from "../../context/FieldsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";

const HarvestLogTable = ({ dateRange }) => {
  console.log("RENDER HarvestLogTable");

  const [harvestEntries, setHarvestEntries] = useState([]);
  const { cropsMap } = useCrops();
  const { fieldsMap } = useFields();
  const { measureUnitsMap } = useMeasureUnits();

  const enrichedEntries = useMemo(() => {
    return harvestEntries.map((entry) => {
      const crop = cropsMap[entry.cropId];
      const fieldNames = entry.fieldIds
        .map((id) => fieldsMap[id]?.name)
        .filter(Boolean);

      const measureUnit = measureUnitsMap[crop?.measureUnitId];
      const measureUnitDisplay = measureUnit?.abbreviation || measureUnit?.name || "?";

      return {
        id: entry.id,
        harvestDate: entry.date,
        cropName: crop?.name || "Unknown Crop",
        quantity: entry.harvestedQuantity,
        measureUnitName: measureUnitDisplay,
        harvestedFieldNames: fieldNames,
      };
    });
  }, [harvestEntries, cropsMap, fieldsMap, measureUnitsMap]);

  // check rerenders, maybe use memo instead #
  useEffect(() => {
    updateEntries();
  }, [dateRange]);

  async function updateEntries() {
    const fetchedEntries = await getEntriesFilteredBy(dateRange);
    console.log("fetchedEntries: ", fetchedEntries);
    setHarvestEntries(fetchedEntries);
  }

  const createRowForEveryEntry = () =>
    mapToHTML(
      enrichedEntries,
      // ## set needed?
      (entry, index) => (
        <HarvestRecordRow
          key={entry.id}
          {...{ entry, index, setHarvestEntries }}
        />
      )
    );

  const tableHead = (
    <tr>
      <th>Date</th>
      <th>Crop</th>
      <th>Quantity</th>
      <th>Unit</th>
      <th>Fields</th>
      <th>Modify</th>
    </tr>
  );

  return Array.isArray(harvestEntries) ? (
    <table className="harvest-overview">
      <thead>{tableHead}</thead>
      <tbody>
        {harvestEntries.length > 0
          ? createRowForEveryEntry()
          : "...no entries found"}
      </tbody>
    </table>
  ) : (
    <p>...could not load any Entries</p>
  );
};

export default HarvestLogTable;
