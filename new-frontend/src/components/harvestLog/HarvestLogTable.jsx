import React, { useEffect, useState } from "react";
import HarvestEntryRow from "./HarvestEntryRow";
import { mapToHTML } from "../../service/utils";
import { getEntriesFilteredBy } from "../../service/apiService";

const HarvestLogTable = ({ dateRange }) => {
  console.log("RENDER HarvestLogTable");

  const [harvestEntries, setHarvestEntries] = useState([]);

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
      harvestEntries,
      // ## set needed?
      (entry, index) => (
        <HarvestEntryRow {...{ entry, index, setHarvestEntries }} />
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
