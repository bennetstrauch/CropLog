// hooks/useHarvestTableSorting.js - Handles sorting logic for harvest table

export const useHarvestTableSorting = () => {
  const getSortedEntries = (entries, sortField, sortDirection) => {
    if (!sortField || !entries.length) return entries;

    return [...entries].sort((a, b) => {
      let aValue = getSortValue(a, sortField);
      let bValue = getSortValue(b, sortField);

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Special handling for different data types
      if (sortField === 'harvestDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'quantity') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // String comparison (case insensitive)
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortValue = (entry, field) => {
    switch (field) {
      case 'harvestDate':
        return entry.harvestDate;
      case 'cropName':
        return entry.cropName;
      case 'quantity':
        return entry.quantity;
      case 'measureUnitName':
        return entry.measureUnitName;
      case 'harvestedFieldNames':
        return entry.harvestedFieldNames?.join(', ') || '';
      default:
        return entry[field];
    }
  };

  return {
    getSortedEntries
  };
};