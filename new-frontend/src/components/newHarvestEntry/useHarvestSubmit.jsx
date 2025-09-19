// hooks/useHarvestSubmit.js

import { getHarvestRecord, postHarvestRecord } from "../../service/apiService";
import { useNotification } from "../../context/NotificationContext";

/**
 * Handles submission of a harvest entry.
 * @param {Function} [setLatestEntry] Optional callback to update latest entry in context
 */
export default function useHarvestSubmit(setLatestEntry) {
  const { showNotification } = useNotification();

  const submitHarvestEntry = async (entryData) => {
    const { harvestDate, cropName, harvestedAmount, harvestedFields } =
      entryData;

    if (
      !cropName ||
      !harvestDate ||
      !harvestedAmount ||
      harvestedFields.length === 0
    ) {
      alert("Missing required harvest entry data.");
      return null;
    }

    try {
      const addedEntryId = await postHarvestRecord(entryData);
      const addedEntry = await getHarvestRecord(addedEntryId);

      if (setLatestEntry) {
        setLatestEntry(addedEntry);
      }

      console.log("✅ Successfully submitted harvest entry:", addedEntry);
      showNotification("Entry saved!");
      return addedEntry;
    } catch (err) {
      console.error("❌ Failed to submit harvest entry:", err);
      alert("Failed to submit harvest entry.");
      return null;
    }
  };

  return { submitHarvestEntry };
}
