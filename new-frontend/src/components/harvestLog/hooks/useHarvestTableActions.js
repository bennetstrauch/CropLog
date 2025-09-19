// hooks/useHarvestTableActions.js - Handles CRUD operations for harvest records

import { updateHarvestRecord, deleteHarvestRecords } from '../../../service/apiService';
import { useNotification } from '../../../context/NotificationContext';

export const useHarvestTableActions = (onDataChange) => {
  const { showNotification } = useNotification();

  const updateEntry = async (entryId, field, value, fullEntry) => {
    try {
      // Get the current entry data first
      if (!fullEntry) {
        throw new Error('Full entry data is required for updates');
      }

      // Prepare the complete update data based on field type
      const updateData = prepareCompleteUpdateData(fullEntry, field, value);

      await updateHarvestRecord(entryId, updateData);
      showNotification('Entry updated!');

      // Trigger data refresh
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Failed to update harvest entry:', error);
      showNotification('Failed to update entry');
    }
  };

  const deleteEntries = async (entryIds) => {
    if (entryIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${entryIds.length} harvest ${entryIds.length === 1 ? 'entry' : 'entries'}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteHarvestRecords(entryIds);
      showNotification(`${entryIds.length} ${entryIds.length === 1 ? 'entry' : 'entries'} deleted!`);

      // Trigger data refresh
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Failed to delete harvest entries:', error);
      showNotification('Failed to delete entries');
    }
  };

  const prepareCompleteUpdateData = (fullEntry, field, value) => {
    // Create complete HarvestRecordRequest object
    const updateData = {
      date: fullEntry.harvestDate,
      cropId: fullEntry.cropId,
      fieldIds: fullEntry.fieldIds,
      harvestedQuantity: fullEntry.quantity
    };

    // Update the specific field being changed
    switch (field) {
      case 'harvestDate':
        updateData.date = value;
        break;
      case 'cropId':
        updateData.cropId = parseInt(value);
        break;
      case 'quantity':
        updateData.harvestedQuantity = parseFloat(value);
        break;
      case 'fieldIds':
        updateData.fieldIds = Array.isArray(value) ? value.map(id => parseInt(id)) : [parseInt(value)];
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }

    return updateData;
  };

  return {
    updateEntry,
    deleteEntries
  };
};