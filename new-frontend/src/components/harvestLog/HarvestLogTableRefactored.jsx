import React, { useEffect, useState } from "react";
import { getEntriesFilteredBy } from "../../service/apiService";
import { useCrops } from "../../context/CropsProvider";
import { useFields } from "../../context/FieldsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";
import { getCurrentDate, validateDate } from "../../service/utils";
import { useHarvestTableActions } from "./hooks/useHarvestTableActions";
import { useNotification } from "../../context/NotificationContext";

// Components
import HarvestTableHeader from "./components/HarvestTableHeader";
import HarvestTableRow from "./components/HarvestTableRow";
import FieldSelectionModal from "./components/FieldSelectionModal";
import TimeframeNav from "./TimeframeNav";
import DateRangeDiv from "./DateRangeDiv";

const HarvestLogTableRefactored = ({ dateRange, setDateRange }) => {
  // State
  const [harvestEntries, setHarvestEntries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('harvestDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [fieldModalState, setFieldModalState] = useState({
    isOpen: false,
    entryId: null,
    selectedFieldIds: []
  });

  // Context
  const { cropsMap, crops } = useCrops();
  const { fieldsMap, fields } = useFields();
  const { measureUnitsMap } = useMeasureUnits();
  const { showNotification } = useNotification();

  // Actions
  const tableActions = useHarvestTableActions(fetchEntries);

  // Data enrichment
  const enrichedEntries = harvestEntries.map((entry) => {
    const crop = cropsMap[entry.cropId];
    const fieldNames = entry.fieldIds
      .map((id) => fieldsMap[id]?.name)
      .filter(Boolean);
    const measureUnit = measureUnitsMap[crop?.measureUnitId];
    const measureUnitDisplay = measureUnit?.abbreviation || measureUnit?.name || "?";

    return {
      id: entry.id,
      harvestDate: entry.date,
      cropId: entry.cropId,
      cropName: crop?.name || "Unknown Crop",
      quantity: entry.harvestedQuantity,
      measureUnitName: measureUnitDisplay,
      harvestedFieldNames: fieldNames,
      fieldIds: entry.fieldIds,
    };
  });

  // Sorting
  const sortedEntries = [...enrichedEntries].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'harvestedFieldNames') {
      aVal = aVal.join(', ');
      bVal = bVal.join(', ');
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Effects
  useEffect(() => {
    fetchEntries();
  }, [dateRange]);

  // Data fetching
  async function fetchEntries() {
    try {
      const fetchedEntries = await getEntriesFilteredBy(dateRange);
      setHarvestEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to fetch harvest entries:", error);
      setHarvestEntries([]);
    }
  }

  // Event handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleSelection = (entryId) => {
    setSelectedIds(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    tableActions.deleteEntries(selectedIds);
    setSelectedIds([]);
  };

  const handleFieldUpdate = async (entryId, field, value) => {
    // Validation
    if (field === 'harvestDate' && !validateDate(value)) {
      showNotification('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }

    if (field === 'quantity' && (isNaN(value) || value <= 0)) {
      showNotification('Please enter a valid positive number for quantity.');
      return;
    }

    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, field, value, fullEntry);
  };

  const openFieldModal = (entryId, selectedFieldIds) => {
    setFieldModalState({ isOpen: true, entryId, selectedFieldIds });
  };

  const closeFieldModal = () => {
    setFieldModalState({ isOpen: false, entryId: null, selectedFieldIds: [] });
  };

  const handleFieldsUpdate = async (entryId, newFieldIds) => {
    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, 'fieldIds', newFieldIds, fullEntry);
  };

  const isToday = (date) => getCurrentDate() === date;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Harvest Log</h2>
              {sortedEntries.length > 0 && (
                <span className="text-sm text-gray-500">
                  {sortedEntries.length} entr{sortedEntries.length !== 1 ? 'ies' : 'y'} total
                  {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
                </span>
              )}
            </div>
            <div className="mt-2">
              <DateRangeDiv {...dateRange} />
            </div>
          </div>
          <TimeframeNav setDateRange={setDateRange} />
        </div>
      </div>

      {/* Table or Empty State */}
      {sortedEntries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
            </svg>
          </div>
          <h3 className="text-gray-500 font-medium">No harvest entries found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your date range or add new harvest entries</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
            <HarvestTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              selectedCount={selectedIds.length}
              onDeleteSelected={handleDeleteSelected}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.map((entry, index) => (
                <HarvestTableRow
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedIds.includes(entry.id)}
                  isToday={isToday}
                  index={index}
                  onToggleSelection={handleToggleSelection}
                  onDateChange={(entryId, value) => handleFieldUpdate(entryId, 'harvestDate', value)}
                  onCropChange={(entryId, value) => handleFieldUpdate(entryId, 'cropId', value)}
                  onQuantityChange={(entryId, value) => handleFieldUpdate(entryId, 'quantity', value)}
                  onFieldsClick={openFieldModal}
                  crops={crops}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Delete Button */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 select-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selectedIds.length} Entr{selectedIds.length > 1 ? 'ies' : 'y'}
          </button>
        </div>
      )}

      {/* Field Selection Modal */}
      <FieldSelectionModal
        isOpen={fieldModalState.isOpen}
        onClose={closeFieldModal}
        selectedFieldIds={fieldModalState.selectedFieldIds}
        onUpdate={(newFieldIds) => {
          handleFieldsUpdate(fieldModalState.entryId, newFieldIds);
          closeFieldModal();
        }}
      />
    </div>
  );
};

export default HarvestLogTableRefactored;